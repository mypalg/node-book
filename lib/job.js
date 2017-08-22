const task = require('./task'),
  schedule = require('./schedule'),
  log = require('./log'),
  ajax = require('./ajax');

module.exports = {
  batchAppoint(date) {
    schedule.getUnfinishedTasksBeforeDate(date).forEach(function(sch) {
      setImmediate(function() {
        let tsk = task.getTaskById(sch.id);
        if (tsk !== 1) {
          let {appointment, userInfo} = tsk;
          ajax.saveAppointMent({
            title: appointment.title,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            room: {
              id: appointment.roomId,
              email: appointment.email
            }
          }, userInfo.ssoid).then(function(data) {
            log.append({
              roomId: appointment.roomId,
              roomName: appointment.roomName,
              userMis: userInfo.mis,
              userName: userInfo.name,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              status: 200,
              result: data
            });
            if (data.status === 1) {
              task.updateStatusById(sch.id, 1);
              schedule.updateStatusById(sch.id, 1);
            } else {
              task.updateStatusById(sch.id, 2);
              schedule.updateStatusById(sch.id, 2);
            }
          }).catch(function(e) {
            log.append({
              roomId: appointment.roomId,
              roomName: appointment.roomName,
              userMis: userInfo.mis,
              userName: userInfo.name,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              status: e.response.status,
              result: e.response.data
            });
            task.updateStatusById(sch.id, 2);
            schedule.updateStatusById(sch.id, 2);
          });
        }
      });
    });
  },
  clearSchedule(date) {
    schedule.deleteScheduleBeforeDate(date);
  }
};
