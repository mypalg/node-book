const db = require('./db')().get('schedule');

module.exports = {
  addSchedule(opt) {
    return db.push({
      id: opt.id,
      time: opt.time,
      status: 0 // 0-pending 1-success 2-fail
    }).write();
  },
  deleteScheduleById(id) {
    return db.remove({id}).write();
  },
  getUnfinishedTasksBeforeDate(date) {
    return db.filter(function (item) {
      return item.time < date && item.status !== 1;
    }).value();
  },
  updateStatusById(id, status) {
    return db.find({id}).assign({status}).write();
  }
};
