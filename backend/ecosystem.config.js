module.exports = {
  apps: [{
    name: 'app',
    script: './app.js',
    cwd: '/www/wwwroot/backend', // 👈 关键！指定工作目录
    interpreter: 'node',
    // 可选：日志路径
    error_file: './logs/app-err.log',
    out_file: './logs/app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
