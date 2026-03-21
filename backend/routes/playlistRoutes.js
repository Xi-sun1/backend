const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const authMiddleware = require('../middleware/auth');

// 获取用户歌单列表
router.get('/', authMiddleware, playlistController.getUserPlaylists);

module.exports = router;