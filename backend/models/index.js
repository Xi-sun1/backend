const mysql = require('mysql2/promise')
const config = require('../config/config')

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port || 3306,
  waitForConnections: true,
  connectionLimit: 10
})

const connectDB = async () => {
  try {
    const conn = await pool.getConnection()
    console.log('MySQL connected successfully')
    conn.release()
  } catch (error) {
    throw error
  }
}

const User = require('./user')
const Song = require('./song')

const db = {
  pool,
  connectDB,
  User,
  Song,
  LikedSong: {},
  RecentPlay: {},
  Playlist: {},
  PlaylistSong: {}
}

module.exports = db
