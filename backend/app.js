const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./models')

const app = express()


app.use(cors())
app.options('*', cors())

// 解析请求体
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件
app.use('/uploads', express.static('uploads'))
app.use('/static', express.static('static'))

// 路由
const authRoutes = require('./routes/authRoutes')
const songRoutes = require('./routes/songRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/songs', songRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 404
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found'
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    code: 500,
    message: 'Internal server error'
  })
})

// 启动服务器
const PORT = 3000

async function startServer() {
  try {
    await db.connectDB()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

  } catch (err) {
    console.error(err)
  }
}

startServer()

module.exports = app