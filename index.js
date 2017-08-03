const Koa = require('koa');
const send = require('koa-send');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

const uuidV4 = require('uuid/v4');
const moment = require('moment');
const ajax = require('./lib/ajax');

require('./db/initialize');
const schedule = require('./lib/schedule');
const task = require('./lib/task');

require('./lib/cronjob');

const app = new Koa();

router.get('/', async ctx => {
  if (ctx.cookies.get('ssoid')) {
    await send(ctx, 'static/index.html');
  } else {
    await send(ctx, 'static/login.html');
  }
});

router.get('/static/*', async ctx => {
  await send(ctx, ctx.path);
});

router.use(async (ctx, next) => {
  ajax.setSsoId(ctx.cookies.get('ssoid'));
  await next();
});

router.get('/user', async ctx => {
  try {
    ctx.body = await ajax.getUserInfo();
  } catch (e) {
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  }
});
router.get('/room', async ctx => {
  try {
    ctx.body = await ajax.getRoomList({});
  } catch (e) {
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  }
});

router.get('/list', async ctx => {
  let userInfo = (await ajax.getUserInfo()).data;
  ctx.body = {
    status: 0,
    data: task.getTasksByUserMis(userInfo.mis).map(function (item) {
      return Object.assign({id: item.id, status: item.status}, item.appointment);
    })
  };
});
router.post('*', bodyParser());
router.post('/delete', async ctx => {
  let userInfo = (await ajax.getUserInfo()).data;
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

    let userInfo = (await ajax.getUserInfo()).data;
    let item = {
      id: uuidV4(),
      status: 0,
      userInfo: {
        mis: userInfo.mis,
        name: userInfo.name,
        email: userInfo.email,
        ssoid: ctx.cookies.get('ssoid')
      },
      appointment
    };
    task.addTask(item);
    schedule.addSchedule({
      id: item.id,
      time: +moment(+appointment.startTime).set({
        hour: 0,
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
router.get('/batch', async ctx => {
  job.batchAppoint(+moment('2017-08-10', 'YYYY-MM-DD'));
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
