const db = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/songs/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/m4a', 'audio/x-m4a'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型，仅支持 .mp3, .wav, .m4a, .aac 格式'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

const LikedSongController = {
  // 获取喜欢的歌曲列表
  async getLikedSongs(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // 查询喜欢的歌曲列表和总数
      const { count, rows } = await db.LikedSong.findAndCountAll({
        where: { userId },
        include: [
          {
            model: db.Song,
            attributes: ['id', 'title', 'artist', 'cover', 'url', 'duration'],
            required: false // 左连接，支持本地音乐
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      // 处理歌曲信息：本地音乐使用LikedSong的字段，在线音乐使用Song的字段
      // helper: 转换为绝对 URL
      const toAbsoluteUrl = (path) => {
        if (!path) return path;
        if (/^https?:\/\//i.test(path)) return path;
        const host = `${req.protocol}://${req.get('host')}`;
        return path.startsWith('/') ? host + path : host + '/' + path;
      };

      const songs = rows.map(item => {
        if (item.isLocal) {
          return {
            id: item.id,
            title: item.title,
            artist: item.artist,
            cover: toAbsoluteUrl(item.cover),
            url: toAbsoluteUrl(item.url),
            duration: item.duration,
            isLocal: true,
            fileSize: item.fileSize
          };
        } else {
          const s = item.Song?.dataValues || {};
          return {
            id: s.id,
            title: s.title,
            artist: s.artist,
            cover: toAbsoluteUrl(s.cover),
            url: toAbsoluteUrl(s.url),
            duration: s.duration,
            isLocal: false
          };
        }
      });
      
      return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: songs,
        meta: {
          total: count,
          page,
          limit
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误' 
      });
    }
  },
  
  // 添加喜欢的歌曲
  async addLikedSong(req, res) {
    try {
      const userId = req.user.id;
      const { songId } = req.params;
      
      // 检查歌曲是否存在
      const song = await db.Song.findByPk(songId);
      if (!song) {
        return res.status(404).json({
          code: 404,
          message: '歌曲不存在' 
        });
      }
      
      // 检查是否已经喜欢
      const existing = await db.LikedSong.findOne({
        where: { userId, songId }
      });
      
      if (existing) {
        return res.status(400).json({
          code: 400,
          message: '已经喜欢该歌曲' 
        });
      }
      
      // 添加到喜欢列表
      await db.LikedSong.create({
        userId,
        songId
      });
      
      return res.status(201).json({
        code: 201,
        message: '添加成功' 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误' 
      });
    }
  },
  
  // 取消喜欢的歌曲
  async removeLikedSong(req, res) {
    try {
      const userId = req.user.id;
      const { songId } = req.params;
      
      // 删除喜欢的歌曲
      const result = await db.LikedSong.destroy({
        where: { userId, songId }
      });
      
      if (result === 0) {
        return res.status(404).json({
          code: 404,
          message: '未找到该喜欢记录' 
        });
      }
      
      return res.status(200).json({
        code: 200,
        message: '取消成功' 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误' 
      });
    }
  },
  
  // 检查歌曲是否已喜欢
  async checkLikedSong(req, res) {
    try {
      const userId = req.user.id;
      const { songId } = req.params;
      
      // 检查是否已经喜欢
      const existing = await db.LikedSong.findOne({
        where: { userId, songId }
      });
      
      return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
          isLiked: !!existing
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误' 
      });
    }
  },

  // 上传本地音乐
  async uploadLocalMusic(req, res) {
    try {
      const userId = req.user.id;
      const file = req.file;
      const { title, artist } = req.body;
      
      if (!file) {
        return res.status(400).json({
          code: 400,
          message: '请上传音频文件'
        });
      }
      
      const fileName = file.filename;
      // 使用相对路径，前端可以通过代理访问
      const fileUrl = `/uploads/songs/${fileName}`;
      
      // 默认封面和时长
      const coverUrl = '/static/default-cover.png';
      const duration = 0; // 可以后续使用音频解析库获取
      
      const songTitle = title || file.originalname.replace(/\.[^/.]+$/, '');
      const songArtist = artist || '本地音乐';
      
      // 创建本地音乐记录
      const newLikedSong = await db.LikedSong.create({
        userId,
        title: songTitle,
        artist: songArtist,
        cover: coverUrl,
        url: fileUrl,
        isLocal: true,
        duration: duration,
        fileSize: file.size
      });
      
      // 返回给前端的是绝对可访问的 URL
      const host = `${req.protocol}://${req.get('host')}`;
      return res.status(200).json({
        code: 200,
        message: '上传成功',
        data: {
          id: newLikedSong.id,
          title: newLikedSong.title,
          artist: newLikedSong.artist,
          cover: coverUrl && coverUrl.startsWith('/') ? host + coverUrl : coverUrl,
          url: fileUrl && fileUrl.startsWith('/') ? host + fileUrl : fileUrl,
          isLocal: true,
          duration: newLikedSong.duration,
          fileSize: newLikedSong.fileSize,
          createdAt: newLikedSong.createdAt
        }
      });
    } catch (err) {
      console.error('上传本地音乐失败:', err);
      
      // 如果上传失败，删除已上传的文件
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('删除文件失败:', unlinkErr);
        }
      }
      
      return res.status(500).json({
        code: 500,
        message: err.message || '服务器内部错误'
      });
    }
  }
};

// 导出multer中间件
LikedSongController.upload = upload.single('file');

// 创建音乐（供 POST /api/music 使用），返回后端生成的 id 与必要字段
LikedSongController.createMusic = async function (req, res) {
  try {
    // uploadLocalMusic 已经在 req.file 创建了文件并保存到 DB
    // 这里我们在 uploadLocalMusic 逻辑之外再次处理：如果 uploadLocalMusic 尚未执行则重复创建
    // 为简洁，我们依赖上传流程：上传中间件会将文件保存在 req.file，并 uploadLocalMusic 会创建记录。

    // 如果 uploadLocalMusic 已创建了记录并返回在 res.locals，则使用它；否则查找最近一条由当前用户创建的本地音乐
    let record = res.locals && res.locals.newLikedSong;

    if (!record) {
      // 尝试依据文件名查找（file path）
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: '未找到上传的文件' });
      }
      const fileUrl = `/uploads/songs/${file.filename}`;
      record = await db.LikedSong.findOne({ where: { url: fileUrl, userId: req.user.id } });
    }

    if (!record) {
      return res.status(500).json({ message: '创建音乐记录失败' });
    }

    // 返回要求的契约字段
    const host = `${req.protocol}://${req.get('host')}`;
    return res.status(201).json({
      id: record.id,
      title: record.title,
      artist: record.artist,
      url: record.url && record.url.startsWith('/') ? host + record.url : record.url,
      cover: record.cover && record.cover.startsWith('/') ? host + record.cover : record.cover
    });
  } catch (err) {
    console.error('createMusic error:', err);
    return res.status(500).json({ message: err.message || '服务器内部错误' });
  }
};

// 删除音乐
LikedSongController.deleteMusic = async function (req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const record = await db.LikedSong.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: '未找到音乐' });
    }

    // 权限检查：只能删除自己的本地音乐
    if (record.userId !== userId) {
      return res.status(403).json({ message: '没有权限删除该音乐' });
    }

    // 如果为本地音乐，尝试删除文件
    if (record.isLocal && record.url) {
      try {
        const filePath = record.url.startsWith('/') ? record.url.slice(1) : record.url;
        const absPath = path.resolve(process.cwd(), filePath);
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } catch (e) {
        console.error('删除文件失败:', e);
      }
    }

    await record.destroy();
    return res.status(200).json({ message: '删除成功' });
  } catch (err) {
    console.error('deleteMusic error:', err);
    return res.status(500).json({ message: err.message || '服务器内部错误' });
  }
};

module.exports = LikedSongController;