const db = require('../models');

// helper: 将相对路径（以 / 开头）转换为绝对 HTTP URL
function toAbsoluteUrl(req, value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  const host = `${req.protocol}://${req.get('host')}`;
  return value.startsWith('/') ? host + value : host + '/' + value;
}

// 情绪音乐映射关系
const emotionMusicMap = {
  happy: {
    keywords: ['happy', 'upbeat', 'energetic', 'positive'],
    matchScore: 0.9
  },
  sad: {
    keywords: ['sad', 'melancholy', 'slow', 'emotional'],
    matchScore: 0.9
  },
  angry: {
    keywords: ['angry', 'intense', 'rock', 'heavy'],
    matchScore: 0.85
  },
  fearful: {
    keywords: ['fearful', 'suspense', 'dark', 'atmospheric'],
    matchScore: 0.8
  },
  disgusted: {
    keywords: ['experimental', 'industrial', 'abstract'],
    matchScore: 0.7
  },
  surprised: {
    keywords: ['surprised', 'energetic', 'dynamic', 'unexpected'],
    matchScore: 0.8
  },
  neutral: {
    keywords: ['calm', 'neutral', 'peaceful', 'relaxing'],
    matchScore: 0.85
  }
};

const SongController = {
  // 获取歌曲列表
  async getSongs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 查询歌曲列表和总数
      const [songs, count] = await Promise.all([
        db.Song.find().select('id title artist cover url duration').skip(skip).limit(limit).exec(),
        db.Song.countDocuments().exec()
      ]);
      
      // 确保返回的 url/cover 为可访问的 HTTP 地址
      const formatted = songs.map(song => {
        return {
          id: song._id,
          title: song.title,
          artist: song.artist,
          cover: toAbsoluteUrl(req, song.cover),
          url: toAbsoluteUrl(req, song.url),
          duration: song.duration
        };
      });

      return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          list: formatted,
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
  
  // 获取歌曲详情
  async getSongById(req, res) {
    try {
      const { id } = req.params;
      
      // 查询歌曲详情
      const song = await db.Song.findById(id).exec();
      
      if (!song) {
        return res.status(404).json({
          code: 404,
          message: '歌曲不存在' 
        });
      }
      
      const formatted = {
        id: song._id,
        title: song.title,
        artist: song.artist,
        cover: toAbsoluteUrl(req, song.cover),
        url: toAbsoluteUrl(req, song.url),
        duration: song.duration,
        lyrics: song.lyrics
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
  },
  
  // 根据情绪获取推荐音乐
  async getRecommendByEmotion(req, res) {
    try {
      const { primaryEmotion, emotionScore, emotions, userId } = req.body;
      
      // 验证必要参数
      if (!primaryEmotion || !emotionScore) {
        return res.status(400).json({
          code: 400,
          message: 'Invalid emotion data'
        });
      }
      
      // 获取情绪配置
      const emotionConfig = emotionMusicMap[primaryEmotion] || emotionMusicMap.neutral;
      
      // 查询歌曲（这里简化处理，实际应该根据情绪配置进行更复杂的查询）
      let songs = await db.Song.find().select('id title artist cover url duration').limit(20).exec();
      
      // 格式化结果
      const formatted = songs.map(song => {
        // 计算匹配得分（这里简化处理，实际应该根据情绪和音乐特征计算）
        let matchScore = emotionConfig.matchScore;
        
        // 根据情绪置信度调整匹配得分
        matchScore *= emotionScore;
        
        return {
          id: song._id,
          title: song.title,
          artist: song.artist,
          cover: toAbsoluteUrl(req, song.cover),
          audio: toAbsoluteUrl(req, song.url),
          duration: song.duration,
          emotion: primaryEmotion,
          matchScore: parseFloat(matchScore.toFixed(2))
        };
      });
      
      // 按匹配得分排序
      formatted.sort((a, b) => b.matchScore - a.matchScore);
      
      // 限制返回数量
      const recommendedSongs = formatted.slice(0, 10);

      return res.status(200).json({
        code: 200,
        message: '获取推荐音乐成功',
        data: recommendedSongs
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = SongController;