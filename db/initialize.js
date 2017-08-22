const db = require('../lib/db')();

db.defaults({
  task: [],
  schedule: [],
  user: [],
  log: []
}).write();
