const db = require('../models');

const SearchController = {
  // 搜索歌曲
  async searchSongs(req, res) {
    try {
      const { keyword, type = 'song', page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      let whereCondition = {};
      
      if (keyword) {
        switch (type) {
          case 'song':
            whereCondition = {
              [db.Sequelize.Op.or]: [
                { title: { [db.Sequelize.Op.like]: `%${keyword}%` } },
                { artist: { [db.Sequelize.Op.like]: `%${keyword}%` } }
              ]
            };
            break;
          case 'artist':
            whereCondition = {
              artist: { [db.Sequelize.Op.like]: `%${keyword}%` }
            };
            break;
          case 'album':
            // 目前没有专辑表，暂时返回空结果
            whereCondition = { id: null };
            break;
          default:
            whereCondition = {
              [db.Sequelize.Op.or]: [
                { title: { [db.Sequelize.Op.like]: `%${keyword}%` } },
                { artist: { [db.Sequelize.Op.like]: `%${keyword}%` } }
              ]
            };
        }
      }
      
      // 查询搜索结果
      const { count, rows } = await db.Song.findAndCountAll({
        where: whereCondition,
        attributes: ['id', 'title', 'artist', 'cover', 'url', 'duration'],
        limit,
        offset
      });
      
      // 确保 url/cover 为绝对 URL
      const formatted = rows.map(r => {
        const s = r.dataValues || r;
        const host = `${req.protocol}://${req.get('host')}`;
        return {
          id: s.id,
          title: s.title,
          artist: s.artist,
          cover: s.cover && s.cover.startsWith('/') ? host + s.cover : s.cover,
          url: s.url && s.url.startsWith('/') ? host + s.url : s.url,
          duration: s.duration
        };
      });

      return res.status(200).json({
        code: 200,
        message: '搜索成功',
        data: {
          list: formatted,
          total: count
        }
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

module.exports = SearchController;