const mysql = require('mysql2');
const config = require('../config/config');

const db = mysql.createConnection(config.database);

module.exports = {
  findByUsername: (username, callback) => {
    db.query('SELECT * FROM users WHERE username=?', [username], callback);
  },

  createUser: (username, password, callback) => {
    db.query(
      'INSERT INTO users (username,password) VALUES (?,?)',
      [username, password],
      callback
    );
  }
};