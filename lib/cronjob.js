const CronJob = require('cron').CronJob,
  job = require('./job'),
  moment = require('moment');

new CronJob('0,10,30,59 0 8 * * *', function() {
  try {
    job.batchAppoint(+moment().add(14, 'd').set({hour: 0, minute: 0, second: 0}));
  } catch (e) {
    console.log(e);
  }
}, function() {
  console.log('stop!');
}, true);

new CronJob('0 5 8 * * *', function() {
  try {
    job.clearSchedule(+moment().add(14, 'd').set({hour: 0, minute: 0, second: 0}));
  } catch (e) {
    console.log(e);
  }
}, function() {
  console.log('stop!');
}, true);
