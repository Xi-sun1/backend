const mysql = require('mysql2/promise')
const config = require('../config/config')

// 创建连接池
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10
})

// 测试连接
const connectDB = async () => {
  try {
    const conn = await pool.getConnection()
    console.log('MySQL connected successfully')
    conn.release()
  } catch (error) {
    console.error('MySQL connection error:', error)
  }
}

// 导入模型
const User = require('./user')
const Song = require('./song')
const LikedSong = require('./likedSong')
const RecentPlay = require('./recentPlay')
const Playlist = require('./playlist')
const PlaylistSong = require('./playlistSong')

const db = {
  pool,
  connectDB,
  User,
  Song,
  LikedSong,
  RecentPlay,
  Playlist,
  PlaylistSong
}

module.exports = db