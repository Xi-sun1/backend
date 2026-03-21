const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  cover: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'playlists'
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;