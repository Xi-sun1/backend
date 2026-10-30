const db = require('../models');

function toAbsoluteUrl(req, value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  const host = `${req.protocol}://${req.get('host')}`;
  return value.startsWith('/') ? host + value : host + '/' + value;
}

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

function formatSong(req, song) {
  return {
    id: song.id,
    title: song.song_name,
    artist: song.artist || 'Unknown',
    cover: toAbsoluteUrl(req, song.cover_url),
    url: toAbsoluteUrl(req, song.music_url),
    bg_url: toAbsoluteUrl(req, song.bg_url),
    mood_type: song.mood_type,
    duration: song.duration || 0
  };
}

const SongController = {
  async getSongs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const [songs, total] = await Promise.all([
        db.Song.findAll({ limit, offset }),
        db.Song.count()
      ]);
      
      const formatted = songs.map(song => formatSong(req, song));

      return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          list: formatted,
          total: total,
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
  
  async getSongById(req, res) {
    try {
      const { id } = req.params;
      
      const song = await db.Song.findById(id);
      
      if (!song) {
        return res.status(404).json({
          code: 404,
          message: '歌曲不存在' 
        });
      }
      
      const formatted = {
        id: song.id,
        title: song.song_name,
        artist: song.artist || 'Unknown',
        cover: toAbsoluteUrl(req, song.cover_url),
        url: toAbsoluteUrl(req, song.music_url),
        bg_url: toAbsoluteUrl(req, song.bg_url),
        mood_type: song.mood_type,
        duration: song.duration || 0,
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
  
  async getRecommendByEmotion(req, res) {
    try {
      const { primaryEmotion, emotionScore, emotions, userId } = req.body;
      
      if (!primaryEmotion || !emotionScore) {
        return res.status(400).json({
          code: 400,
          message: 'Invalid emotion data'
        });
      }
      
      const emotionConfig = emotionMusicMap[primaryEmotion] || emotionMusicMap.neutral;
      
      const moodMapping = {
        happy: ['happy', 'upbeat', 'energetic'],
        sad: ['sad', 'melancholy'],
        angry: ['angry', 'intense'],
        fearful: ['fearful', 'dark'],
        disgusted: ['experimental'],
        surprised: ['surprised', 'energetic'],
        neutral: ['calm', 'neutral', 'peaceful']
      };
      
      const moodTypes = moodMapping[primaryEmotion] || moodMapping.neutral;
      
      let songs = await db.Song.findByMood(moodTypes, 20);
      
      if (songs.length === 0) {
        songs = await db.Song.findAll({ limit: 20 });
      }
      
      const formatted = songs.map(song => {
        let matchScore = emotionConfig.matchScore;
        matchScore *= emotionScore;
        
        const formattedSong = formatSong(req, song);
        return {
          ...formattedSong,
          audio: formattedSong.url,
          emotion: primaryEmotion,
          matchScore: parseFloat(matchScore.toFixed(2))
        };
      });
      
      formatted.sort((a, b) => b.matchScore - a.matchScore);
      
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
