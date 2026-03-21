const express = require('express');
const router = express.Router();
const recentPlayController = require('../controllers/recentPlayController');
const authMiddleware = require('../middleware/auth');

// 获取最近听过的歌曲列表
router.get('/', authMiddleware, recentPlayController.getRecentPlays);

// 添加到最近听过
router.post('/', authMiddleware, recentPlayController.addRecentPlay);

module.exports = router;