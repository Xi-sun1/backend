const db = require('../models');

const RecentPlayController = {
  // 获取最近听过的歌曲列表
  async getRecentPlays(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      
      // 查询最近播放的歌曲
      const recentPlays = await db.RecentPlay.findAll({
        where: { userId },
        include: [
          {
            model: db.Song,
            attributes: ['id', 'title', 'artist', 'cover', 'url', 'duration']
          }
        ],
        limit,
        order: [['playedAt', 'DESC']]
      });
      
      // 提取歌曲信息并添加播放时间，确保 url/cover 为绝对地址
      const host = `${req.protocol}://${req.get('host')}`;
      const songs = recentPlays.map(item => {
        const s = item.Song.dataValues || {};
        return {
          id: s.id,
          title: s.title,
          artist: s.artist,
          cover: s.cover && s.cover.startsWith('/') ? host + s.cover : s.cover,
          url: s.url && s.url.startsWith('/') ? host + s.url : s.url,
          duration: s.duration,
          playedAt: item.playedAt
        };
      });
      
      return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          list: songs,
          total: songs.length
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
  
  // 添加到最近听过
  async addRecentPlay(req, res) {
    try {
      const userId = req.user.id;
      const { songId } = req.body;
      
      // 检查歌曲是否存在
      const song = await db.Song.findByPk(songId);
      if (!song) {
        return res.status(404).json({
          code: 404,
          message: '歌曲不存在' 
        });
      }
      
      // 查找是否已存在记录
      const existing = await db.RecentPlay.findOne({
        where: { userId, songId }
      });
      
      if (existing) {
        // 更新播放时间
        await existing.update({
          playedAt: new Date()
        });
      } else {
        // 创建新记录
        await db.RecentPlay.create({
          userId,
          songId,
          playedAt: new Date()
        });
      }
      
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
  }
};

module.exports = RecentPlayController;