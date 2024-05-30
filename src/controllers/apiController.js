// src/controllers/apiController.js
const apiService = require('../services/apiService');
const { textToSpeech } = require('../services/elevenLabsService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
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
exports.textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;
    const voice = 'XRlny9TzSxQhHzOusWWe'; // Replace with actual voice ID
    const audioFileName = `audio_${uuidv4()}.mp3`;
    const outputPath = path.join(__dirname, '..','..', 'public', 'output', audioFileName); // Path to save the audio file
    const audioPath = `/output/${audioFileName}`;

    await textToSpeech(text, voice, outputPath);

    res.json({ audioPath: audioPath });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
