const express = require('express');
const router = express.Router();
const likedSongController = require('../controllers/likedSongController');
const authMiddleware = require('../middleware/auth');

// 获取喜欢的歌曲列表
router.get('/', authMiddleware, likedSongController.getLikedSongs);

// 上传本地音乐（必须在/:songId之前，避免路由冲突）
router.post('/local', authMiddleware, likedSongController.upload, likedSongController.uploadLocalMusic);

// 添加喜欢的歌曲
router.post('/:songId', authMiddleware, likedSongController.addLikedSong);

// 取消喜欢的歌曲
router.delete('/:songId', authMiddleware, likedSongController.removeLikedSong);

// 检查歌曲是否已喜欢
router.get('/check/:songId', authMiddleware, likedSongController.checkLikedSong);

module.exports = router;