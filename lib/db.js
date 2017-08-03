const low = require('lowdb');
const path = require('path');
const db = low(path.join(__dirname, '../db/db.json'));

module.exports = function() {
  return db;
};
