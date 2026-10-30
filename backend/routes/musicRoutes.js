const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const likedSongController = require('../controllers/likedSongController');
const authMiddleware = require('../middleware/auth');

// 根据情绪推荐音乐
router.post('/recommend', musicController.recommendMusic);

// 获取音乐详情
router.get('/:id', musicController.getMusicById);

// 添加音乐（上传本地音乐）
router.post('/', authMiddleware, likedSongController.upload, likedSongController.createMusic);

// 删除音乐（仅允许拥有者删除）
router.delete('/:id', authMiddleware, likedSongController.deleteMusic);

//生成音乐
router.post('/generate',musicController.generateMusic);
module.exports = router;
