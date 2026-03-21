const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const config = require('../config/config');

const db = mysql.createConnection(config.database);

const AuthController = {
  // 登录
  login(req, res) {
    const { username, password } = req.body;

    db.query(
      'SELECT * FROM users WHERE username=?',
      [username],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ code: 500, message: '数据库错误' });
        }

        if (result.length === 0) {
          return res.status(400).json({ code: 400, message: '用户名或密码错误' });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ code: 400, message: '用户名或密码错误' });
        }

        const token = jwt.sign(
          { userId: user.id },
          config.secret,
          { expiresIn: '7d' }
        );

        res.json({
          code: 200,
          message: '登录成功',
          data: {
            token,
            user: {
              id: user.id,
              username: user.username
            }
          }
        });
      }
    );
  },

  // 注册
  register(req, res) {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '密码至少6位'
      });
    }

    db.query(
      'SELECT * FROM users WHERE username=?',
      [username],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            code: 500,
            message: '数据库错误'
          });
        }

        if (result.length > 0) {
          return res.status(400).json({
            code: 400,
            message: '用户已存在'
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          'INSERT INTO users (username,password,email) VALUES (?,?,?)',
          [username, hashedPassword, email || null],
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                code: 500,
                message: '注册失败'
              });
            }

            const token = jwt.sign(
              { userId: result.insertId },
              config.secret,
              { expiresIn: '7d' }
            );

            res.json({
              code: 200,
              message: '注册成功',
              data: {
                token,
                user: {
                  id: result.insertId,
                  username
                }
              }
            });
          }
        );
      }
    );
  },

  // 获取当前用户信息
  getCurrentUser(req, res) {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未登录或token无效'
      });
    }

    db.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            code: 500,
            message: '数据库错误'
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            code: 404,
            message: '用户不存在'
          });
        }

        res.json({
          code: 200,
          message: '获取用户信息成功',
          data: result[0]
        });
      }
    );
  }
};

module.exports = AuthController;