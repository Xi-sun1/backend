const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 登录路由
router.post('/login', authController.login);

// 注册路由
router.post('/register', authController.register);

// 获取当前用户信息路由
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;