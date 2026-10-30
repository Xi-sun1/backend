const db = require('../models');

function toAbsoluteUrl(req, value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  const host = `${req.protocol}://${req.get('host')}`;
  return value.startsWith('/') ? host + value : host + '/' + value;
}

const emotionMapping = {
  happy: { types: ['happy','excited'], description: '欢快的音乐' },
  excited: { types: ['happy','excited'], description: '欢快的音乐' },
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

function formatSong(req, song) {
  return {
    id: song.id,
    title: song.song_name,
    artist: song.artist || 'Unknown Artist',
    cover: toAbsoluteUrl(req, song.cover_url) || '',
    url: toAbsoluteUrl(req, song.music_url),
    bg_url: toAbsoluteUrl(req, song.bg_url),
    mood_type: song.mood_type,
    duration: song.duration || 0
  };
}

const MusicController = {
  async recommendMusic(req, res) {
    try {
      const { emotion, confidence, userId } = req.body;
      
      if (!emotion || typeof confidence !== 'number' || !Number.isFinite(confidence)) {
        return res.status(400).json({
          code: 400,
          message: '参数错误'
        });
      }
      
      if (!emotionMapping[emotion]) {
        return res.status(400).json({
          code: 400,
          message: '无效的情绪值'
        });
      }
      
      if (confidence < 0 || confidence > 1) {
        return res.status(400).json({
          code: 400,
          message: '置信度应在0-1之间'
        });
      }
      
      const emotionConfig = emotionMapping[emotion];
      
      let categoryQuery = [];
      if (['happy,excited','happy','excited'].includes(emotion)) {
        categoryQuery = ['happy', 'excited'];
      } else if (emotion === 'sad') {
        categoryQuery = ['sad'];
      } else if (emotion === 'calm') {
        categoryQuery = ['calm'];
      }
      
      let songs = await db.Song.findByMood(categoryQuery, 10);
      
      if (songs.length === 0) {
        songs = await db.Song.findAll({ limit: 10 });
      }
      
      const recommendedSongs = songs.map(song => {
        const formatted = formatSong(req, song);
        return {
          ...formatted,
          emotion: song.mood_type || emotion.split(',')[0]
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
  
  async getMusicById(req, res) {
    try {
      const { id } = req.params;
      
      const song = await db.Song.findById(id);
      
      if (!song) {
        return res.status(404).json({
          code: 404,
          message: '未找到资源'
        });
      }
      
      const formatted = {
        id: song.id,
        title: song.song_name,
        artist: song.artist || 'Unknown Artist',
        cover: toAbsoluteUrl(req, song.cover_url) || '',
        url: toAbsoluteUrl(req, song.music_url),
        bg_url: toAbsoluteUrl(req, song.bg_url),
        mood_type: song.mood_type,
        duration: song.duration || 0,
        emotion: 'neutral',
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
  },
  

  async generateMusic(req, res) {
    try {
    // 1. 获取前端传递过来的参数
    const {  prompt } = req.body; 
    
    console.log("用户音乐描述：",prompt);
 
    const mockSongUrl = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
    
    // 4. 返回结果
    return res.status(200).json({
      code: 200,
      message: "生成成功",
      song_url: mockSongUrl // 对应你图片里要求的返回字段
    });
    
  } catch (error) {
    // 5. 异常捕获
    console.error("生成音乐报错：", error);
    return res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      error: error.message
    });
  }
}
};

module.exports = MusicController;
