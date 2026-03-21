const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  cover: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  lyrics: {
    type: String
  },
  category: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'songs'
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;