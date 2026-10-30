const mysql = require('mysql2/promise');
const config = require('../config/config');

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

const Song = {
  async findAll(options = {}) {
    const limit = parseInt(options.limit) || 20;
    const offset = parseInt(options.offset) || 0;
    
    const [rows] = await pool.execute(
      `SELECT * FROM music LIMIT ${limit} OFFSET ${offset}`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM music WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByMood(moodTypes, limit = 10) {
    const placeholders = moodTypes.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `SELECT * FROM music WHERE mood_type IN (${placeholders}) LIMIT ${parseInt(limit)}`,
      [...moodTypes]
    );
    return rows;
  },

  async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM music');
    return rows[0].total;
  },

  async create(data) {
    const { mood_type, song_name, music_url, cover_url, bg_url } = data;
    const [result] = await pool.execute(
      'INSERT INTO music (mood_type, song_name, music_url, cover_url, bg_url) VALUES (?, ?, ?, ?, ?)',
      [mood_type, song_name, music_url, cover_url, bg_url]
    );
    return result.insertId;
  },

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM music WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Song;
