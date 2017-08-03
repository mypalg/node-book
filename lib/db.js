const low = require('lowdb');
const db = low('./db/db.json');

module.exports = function() {
  return db;
};
