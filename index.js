const Koa = require('koa');
const send = require('koa-send');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

const uuidV4 = require('uuid/v4');
const moment = require('moment');
const ajax = require('./lib/ajax');

const schedule = require('./lib/schedule');
const task = require('./lib/task');
const log = require('./lib/log');

require('./lib/cronjob');
require('./db/initialize');

const app = new Koa();

router.get('/', async ctx => {
  if (ctx.cookies.get('ssoid')) {
    await send(ctx, 'static/index.html');
  } else {
    await send(ctx, 'static/login.html');
  }
});

router.get('/log', async ctx => {
  if (ctx.cookies.get('ssoid')) {
    await send(ctx, 'static/log.html');
  } else {
    await send(ctx, 'static/login.html');
  }
});

router.get('/static/*', async ctx => {
  await send(ctx, ctx.path);
});

router.use(async (ctx, next) => {
  ctx.state.ssoid = ctx.cookies.get('ssoid');
  ajax.setSsoId(ctx.state.ssoid);
  await next();
});

router.get('/user', async ctx => {
  try {
    ctx.body = await ajax.getUserInfo(ctx.state.ssoid);
  } catch (e) {
    console.log(e);
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  }
});

router.get('/room', async ctx => {
  try {
    ctx.body = await ajax.getRoomList({}, ctx.state.ssoid);
  } catch (e) {
    console.log(e);
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  }
});

router.get('/list', async ctx => {
  let userInfo = (await ajax.getUserInfo(ctx.state.ssoid)).data;
  ctx.body = {
    status: 0,
    data: task.getTasksByUserMis(userInfo.mis).map(function (item) {
      return Object.assign({id: item.id, status: item.status}, item.appointment);
    })
  };
});

const ADMIN_EMPID = 1027691;
router.get('/loglist', async ctx => {
  let userInfo = (await ajax.getUserInfo(ctx.state.ssoid)).data;
  if (userInfo.empId === ADMIN_EMPID) {
    ctx.body = {
      status: 1,
      data: log.getList()
    };
  } else {
    ctx.status = 401;
  }
});

router.post('*', bodyParser());
router.post('/delete', async ctx => {
  let userInfo = (await ajax.getUserInfo(ctx.state.ssoid)).data;
  let id = ctx.request.body.id;

  let deleteRecords = task.deleteTaskById({id, mis: userInfo.mis});
  if (deleteRecords.length) {
    deleteRecords.forEach(function(item) {
      schedule.deleteScheduleById(item.id);
    });
    ctx.body = {
      status: 0,
      msg: '删除成功'
    };
  } else {
    ctx.body = {
      status: 1,
      msg: '删除失败'
    }
  }
});
router.post('/save', async ctx => {
  try {
    let appointment = ctx.request.body;

    // check conflict
    if (!task.checkConflict(appointment)) {
      ctx.body = {
        status: 1,
        msg: '房间已预订'
      };
      return;
    }

    let userInfo = (await ajax.getUserInfo(ctx.state.ssoid)).data;
    let item = {
      id: uuidV4(),
      status: 0,
      userInfo: {
        mis: userInfo.mis,
        name: userInfo.name,
        email: userInfo.email,
        ssoid: ctx.state.ssoid
      },
      appointment
    };
    task.addTask(item);
    schedule.addSchedule({
      id: item.id,
      time: +moment(+appointment.startTime).subtract(13, 'days').set({
        hour: 8,
        minute: 0
      })
    });
    ctx.body = {
      status: 0,
      data: Object.assign({id: item.id, status: item.status}, item.appointment),
      msg: '预订成功'
    };
  } catch (e) {
    console.log(e);
    ctx.status = 500;
    ctx.body = 'fail';
  }
});

const job = require('./lib/job');
router.get('/batch/:time', async ctx => {
  job.batchAppoint(ctx.params.time === -1 ? +moment() : +ctx.params.time);
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
