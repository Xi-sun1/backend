const express = require('express');
const multer = require('multer');
const router = express.Router();
const gestureController = require('../controllers/gestureController');

const upload = multer({ dest: 'uploads/' });

// POST /api/gesture/recognize
router.post('/recognize', upload.single('image'), gestureController.recognize);

module.exports = router;
