const marked = require('marked');
const fs = require('fs');
require('dotenv').config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

/**
 * Convert text to speech using ElevenLabs API.
 * @param {string} text - The text to convert to speech.
 * @param {string} voice - The voice ID to use for the TTS.
 * @param {string} outputPath - The path to save the output audio file.
 */
async function textToSpeech(text, voice, outputPath) {
     text = marked.parse(text)
    const requestBody = JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          use_speaker_boost: false
        }
      });
    
      const options = {
        method: 'POST',
        headers: {
          "Accept": "audio/mpeg",
          'Content-Type': 'application/json',
          'xi-api-key': `${ELEVENLABS_API_KEY}`
        },
        body: requestBody
      };
    try {
    
        const response = await fetch(`${ELEVENLABS_API_URL}/${voice}`, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`Audio file saved to ${outputPath}`);
  } catch (error) {
    console.error('Error during text-to-speech conversion:', error);
  }
}

module.exports = {
  textToSpeech,
};