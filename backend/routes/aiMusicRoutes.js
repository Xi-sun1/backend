const express = require('express');
const router = express.Router();
const aiMusicController = require('../controllers/aiMusicController');

// POST /api/ai-music/generate  - 提交生成任务
router.post('/generate', aiMusicController.generate);

// GET /api/ai-music/status/:predictionId  - 查询状态
router.get('/status/:predictionId', aiMusicController.status);

module.exports = router;
