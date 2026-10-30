require('dotenv').config({ path: require('path').join(__dirname, '.env') })
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
const musicRoutes = require('./routes/musicRoutes')
const aiMusicRoutes = require('./routes/aiMusicRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/songs', songRoutes)
app.use('/api/music',musicRoutes)
app.use('/api/ai-music', aiMusicRoutes)

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
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '127.0.0.1'

async function startServer() {
  try {
    await db.connectDB()

    app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`)
    })

  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

startServer()

module.exports = app