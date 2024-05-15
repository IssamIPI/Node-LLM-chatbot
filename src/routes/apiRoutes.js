// src/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/example', apiController.exampleFunction);




module.exports = router;