const db = require('../models');

const PlaylistController = {
  // 获取用户歌单列表
  async getUserPlaylists(req, res) {
    try {
      const userId = req.user.id;
      
      // 查询用户的歌单列表
      const playlists = await db.Playlist.findAll({
        where: { userId },
        include: [
          {
            model: db.PlaylistSong,
            attributes: ['id'],
            duplicating: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // 计算每个歌单的歌曲数量
      const host = `${req.protocol}://${req.get('host')}`;
      const formattedPlaylists = playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        cover: playlist.cover && playlist.cover.startsWith('/') ? host + playlist.cover : playlist.cover,
        songCount: playlist.PlaylistSongs.length,
        createdAt: playlist.createdAt
      }));
      
      return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          list: formattedPlaylists,
          total: formattedPlaylists.length
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

module.exports = PlaylistController;