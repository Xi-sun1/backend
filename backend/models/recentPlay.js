const mongoose = require('mongoose');

const recentPlaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Song'
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'recent_plays'
});

const RecentPlay = mongoose.model('RecentPlay', recentPlaySchema);

module.exports = RecentPlay;