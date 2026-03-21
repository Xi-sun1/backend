const mongoose = require('mongoose');

const playlistSongSchema = new mongoose.Schema({
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Playlist'
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Song'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'playlist_songs'
});

const PlaylistSong = mongoose.model('PlaylistSong', playlistSongSchema);

module.exports = PlaylistSong;