const CronJob = require('cron').CronJob,
  job = require('./job'),
  moment = require('moment');

new CronJob('0,10,30,59 0 8 * * *', function() {
  try {
    job.batchAppoint(+moment());
  } catch (e) {
    console.log(e);
  }
}, function() {
  console.log('stop!');
}, true);

new CronJob('0 5 8 * * *', function() {
  try {
    job.clearSchedule(+moment());
  } catch (e) {
    console.log(e);
  }
}, function() {
  console.log('stop!');
}, true);
