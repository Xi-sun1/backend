const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../models');

module.exports = (req, res, next) => {
  // 从请求头获取Authorization字段
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问' 
    });
  }
  
  // 解析token
  const token = authHeader.split(' ')[1];
  
  try {
    // 验证token
    const decoded = jwt.verify(token, config.secret);
    
    // 查找用户
    db.User.findById(decoded.userId)
      .then(user => {
        if (!user) {
          return res.status(401).json({
            code: 401,
            message: '用户不存在' 
          });
        }
        
        // 将用户信息存储在请求对象中
        req.user = user;
        next();
      })
      .catch(err => {
        return res.status(500).json({
          code: 500,
          message: '服务器内部错误' 
        });
      });
  } catch (err) {
    return res.status(401).json({
      code: 401,
      message: '无效的token' 
    });
  }
};