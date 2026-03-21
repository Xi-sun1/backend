const db = require('../models');

// helper: 将相对路径（以 / 开头）转换为绝对 HTTP URL
function toAbsoluteUrl(req, value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  const host = `${req.protocol}://${req.get('host')}`;
  return value.startsWith('/') ? host + value : host + '/' + value;
}

// 情绪映射规则
const emotionMapping = {
  'happy,excited': {
    types: ['happy', 'excited'],
    description: '欢快、积极的音乐'
  },
  'sad': {
    types: ['sad'],
    description: '舒缓、忧郁的音乐'
  },
  'calm': {
    types: ['calm'],
    description: '轻松、冥想的音乐'
  }
};

const MusicController = {
  // 根据情绪推荐音乐
  async recommendMusic(req, res) {
    try {
      const { emotion, confidence, userId } = req.body;
      
      // 验证必要参数
      if (!emotion || !confidence) {
        return res.status(400).json({
          code: 400,
          message: '参数错误'
        });
      }
      
      // 验证情绪值
      if (!emotionMapping[emotion]) {
        return res.status(400).json({
          code: 400,
          message: '无效的情绪值'
        });
      }
      
      // 验证置信度范围
      if (confidence < 0 || confidence > 1) {
        return res.status(400).json({
          code: 400,
          message: '置信度应在0-1之间'
        });
      }
      
      // 获取情绪配置
      const emotionConfig = emotionMapping[emotion];
      
      // 根据情绪类型查询对应的歌曲
      let categoryQuery = [];
      if (emotion === 'happy,excited') {
        categoryQuery = ['happy', 'excited'];
      } else if (emotion === 'sad') {
        categoryQuery = ['sad'];
      } else if (emotion === 'calm') {
        categoryQuery = ['calm'];
      }
      
      // 查询推荐音乐
      let songs = await db.Song.find({ category: { $in: categoryQuery } }).select('id title artist cover url duration category').limit(10).exec();
      
      // 如果没有找到对应类别的歌曲，使用默认查询
      if (songs.length === 0) {
        songs = await db.Song.find().select('id title artist cover url duration category').limit(10).exec();
      }
      
      // 格式化结果
      const recommendedSongs = songs.map(song => {
        return {
          id: song._id,
          title: song.title,
          artist: song.artist || 'Unknown Artist',
          cover: toAbsoluteUrl(req, song.cover) || '',
          url: toAbsoluteUrl(req, song.url),
          duration: song.duration || 0,
          emotion: song.category || emotion.split(',')[0] // 使用歌曲的实际类别作为情绪标签
        };
      });

      return res.status(200).json({
        code: 200,
        message: '推荐成功',
        data: {
          recommendedSongs
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
  
  // 获取音乐详情
  async getMusicById(req, res) {
    try {
      const { id } = req.params;
      
      // 查询音乐详情
      const song = await db.Song.findById(id).exec();
      
      if (!song) {
        return res.status(404).json({
          code: 404,
          message: '未找到资源'
        });
      }
      
      const formatted = {
        id: song._id,
        title: song.title,
        artist: song.artist || 'Unknown Artist',
        cover: toAbsoluteUrl(req, song.cover) || '',
        url: toAbsoluteUrl(req, song.url),
        duration: song.duration || 0,
        emotion: 'neutral', // 默认情绪，实际应该根据音乐特征分析
        lyrics: song.lyrics || ''
      };

      return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: formatted
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  }
};

module.exports = MusicController;