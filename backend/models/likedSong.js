const mongoose = require('mongoose');

const likedSongSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  },
  // 本地音乐字段（当isLocal为true时使用）
  title: {
    type: String
  },
  artist: {
    type: String,
    default: '本地音乐'
  },
  cover: {
    type: String
  },
  url: {
    type: String
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number
  },
  fileSize: {
    type: Number
  }
}, {
  timestamps: true,
  collection: 'liked_songs'
});

const LikedSong = mongoose.model('LikedSong', likedSongSchema);

module.exports = LikedSong;