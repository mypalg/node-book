const task = require('./task'),
  schedule = require('./schedule'),
  ajax = require('./ajax');

module.exports = {
  batchAppoint(date) {
    schedule.getUnfinishedTasksBeforeDate(date).forEach(function(sch) {
      setImmediate(function() {
        let tsk = task.getTaskById(sch.id);
        if (tsk !== 1) {
          let {appointment, userInfo} = tsk;
          ajax.setSsoId(userInfo.ssoid);
          ajax.saveAppointMent({
            title: appointment.title,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            room: {
              id: appointment.roomId,
              email: appointment.email
            }
          }).then(function(data) {
            if (data.status === 1) {
              task.updateStatusById(sch.id, 1);
              schedule.updateStatusById(sch.id, 1);
            } else {
              task.updateStatusById(sch.id, 2);
              schedule.updateStatusById(sch.id, 2);
            }
          }).catch(function() {
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
