// src/controllers/apiController.js
const apiService = require('../services/apiService');

exports.chatModel = async (req, res) => {

      try {
        const userQuery = req.body.q;
        const file = req.file;
        const result = await apiService.getModelResponse(userQuery, file);
        res.json(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
  
};
exports.determineYoutubeIntent = async (req, res) => {
  try {
    const userQuery = req.query.q;
    const result = await apiService.determineYoutubeIntent(userQuery);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
