const mysql = require('mysql2');
const config = require('../config/config');

const db = mysql.createPool(config.database);

module.exports = {
  findById: (id) => new Promise((resolve,reject) => {
    db.query('SELECT id, username, email FROM users WHERE id=?',[id],(error,rows)=>error?reject(error):resolve(rows[0]||null));
  }),
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