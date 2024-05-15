// src/services/apiService.js
const axios = require('axios');
const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const { response } = require('../app');
require('dotenv').config();

// Constants for project and location should be defined at the top level.
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = 'us-central1';

// Initialize Vertex AI with the necessary project and location information once.
const vertexAiOptions = { project: PROJECT_ID, location: LOCATION };
const vertex_ai = new VertexAI(vertexAiOptions);

// Define model names as constants to avoid magic strings and improve readability.
const GEMINI_PRO_MODEL_NAME = 'gemini-pro';

// Safety settings can be moved outside of the model instantiation,
// if they are static and reused across multiple instances.
const safetySettings = [{
  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}];

// Instantiate models once outside of functions to avoid repeated initializations.
const generativeModelOptions = {
  model: GEMINI_PRO_MODEL_NAME,
  safety_settings: safetySettings,
  generation_config: { max_output_tokens: 4000 },
};

const generativeModel = vertex_ai.preview.getGenerativeModel(generativeModelOptions);
// The streamGenerateContent function does not need to be an async declaration since it returns a Promise implicitly.
async function streamGenerateContent(userQuery) {
    const request = {
      contents: [{ role: 'user', parts: [{ text: userQuery }] }],
    };

    try {
      const streamingResp = await generativeModel.generateContentStream(request);
      const responseData = [];

      for await (const item of streamingResp.stream) {
        if (item.candidates[0].content.parts && item.candidates[0].content.parts.length > 0) {
          responseData.push(item.candidates[0].content.parts[0].text);
        }
      }

      // formatter la réponse retournée de Gemini
      responseData.trim('"');
      return responseData.join(',');

    } catch (error) {
      console.error('An error occurred during content generation:', error);
      throw new Error('Content generation failed');
    }
  }

exports.callExternalApi = async (userQuery) => {
  try {

    // Invoking the function to start the content generation process.
    return await streamGenerateContent(userQuery);
  } catch (error) {
    throw new Error(`Error in callExternalApi: ${error.message}`);
  }
};

