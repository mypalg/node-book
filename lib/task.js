const db = require('./db')().get('task');

module.exports = {
  getTasksByUserMis(mis) {
    return db.filter({
      userInfo: {
        mis
      }
    }).value();
  },
  getTaskById(id) {
    return db.find({
      id
    }).value();
  },
  deleteTaskById(data) {
    return db.remove({
      id: data.id,
      userInfo: {
        mis: data.mis
      }
    }).write();
  },
  addTask(data) {
    return db.push(data).write();
  },
  checkConflict(appointment) {
    return db.filter({
      appointment: {
        roomId: appointment.roomId
      }
    }).every(function (item) {
      let startTime = item.appointment.startTime,
        endTime = item.appointment.endTime;
      return appointment.startTime <= startTime && appointment.endTime <= startTime
        || appointment.startTime >= endTime && appointment.endTime >= endTime;
    }).value()
  },
  updateStatusById(id, status) {
    return db.find({id}).assign({status}).write();
  }
};
