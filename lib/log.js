const db = require('./db')().get('log');

module.exports = {
  append(data) {
    return db.push(Object.assign({createTime: new Date().getTime()}, data)).write();
  },
  getList() {
    return db.value();
  }
};