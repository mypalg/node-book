const db = require('./db')();

db.defaults({
  task: [],
  schedule: [],
  user: []
}).write();
