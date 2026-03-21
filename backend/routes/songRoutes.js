const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// 获取歌曲列表
router.get('/', songController.getSongs);

// 获取歌曲详情
router.get('/:id', songController.getSongById);

// 根据情绪获取推荐音乐
router.post('/recommend-by-emotion', songController.getRecommendByEmotion);

module.exports = router;