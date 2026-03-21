const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// 搜索歌曲
router.get('/', searchController.searchSongs);

module.exports = router;