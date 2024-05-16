// src/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

const upload = require('../services/fileService');
router.post('/chatModel', upload, apiController.chatModel);

router.get('/youtubeIntent',apiController.determineYoutubeIntent)


module.exports = router;