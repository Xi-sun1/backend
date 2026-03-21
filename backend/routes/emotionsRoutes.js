const express = require('express');
const router = express.Router();
const emotionController = require('../controllers/emotionController');

// 保存情绪记录
router.post('/', emotionController.saveEmotion);

module.exports = router;