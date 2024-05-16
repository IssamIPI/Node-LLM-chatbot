// src/services/apiService.js
const axios = require('axios');
const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const { response } = require('../app');
const { YoutubeTranscript } = require('youtube-transcript');
const { extractTextFromPDF, extractTextFromDOCX, extractTextFromTXT } = require('./textExtractionService');
require('dotenv').config();

// Constants for project and location should be defined at the top level.
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = 'us-central1';

// Initialize Vertex AI with the necessary project and location information once.
const vertexAiOptions = { project: PROJECT_ID, location: LOCATION };
const vertex_ai = new VertexAI(vertexAiOptions);

// Define model names as constants to avoid magic strings and improve readability.
const GEMINI_PRO_MODEL_NAME = 'gemini-1.5-pro-preview-0409';

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
  generation_config: { max_output_tokens: 8000 },
};
var chat = null
const generativeModel = vertex_ai.preview.getGenerativeModel(generativeModelOptions);
// The streamGenerateContent function does not need to be an async declaration since it returns a Promise implicitly.
async function getChatResponse(userQuery) {
  

    try {
   
    if(!chat){
      chat = generativeModel.startChat();
    }
    const chatInput = userQuery ;
    const result = await chat.sendMessage(chatInput);
    const response = result.response.candidates[0].content.parts[0].text;
    return response;

    } catch (error) {
      console.error('An error occurred during content generation:', error);
      throw new Error('Content generation failed');
    }
  }
  async function getYouTubeTranscript(videoId) {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(entry => entry.text).join(' ');
  }
  
  async function summarizeTranscript(transcript) {
    const request = {
      role: 'user',
      parts: [{ text: `Summarize the following transcript: ${transcript}` }]
    };
  
    const result = await getChatResponse(request.parts[0].text);
    return result;
  }
  
  async function detectYouTubeSummaryIntent(userQuery) {
    const request = {
      role: 'user',
      parts: [{ text: `Analyze the following query and determine if it requests a YouTube video summary. Extract the YouTube link if present: ${userQuery}` }]
    };
    
    const result = await getChatResponse(request.parts[0].text);
    return result;
  }
  async function handleFileUpload(userQuery,filePath, fileType) {
    let text = '';
    if (fileType === 'application/pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(filePath);
    } else if (fileType === 'text/plain') {
      text = await extractTextFromTXT(filePath);
    }
    const summary = await getChatResponse(`Answer the user question using the following text: ${text} , here is the user question : ${userQuery}`);
    return summary;
  }
exports.getModelResponse = async (userQuery,file) => {
  try {
    if (file) {
      const summary = await handleFileUpload(userQuery,file.path, file.mimetype);
      return summary;
    }
    const intentAnalysis = await detectYouTubeSummaryIntent(userQuery);
    const youtubeLinkMatch = intentAnalysis.match(/(?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?.*?(v=[^&\s]+).*)|(?:v(\/.*))|(channel\/.+)|(?:user\/(.+))|(?:results\?(search_query=.+))))?)|(?:youtu\.be(\/.*)?))/i);
   
    if (youtubeLinkMatch) {
      const videoId = youtubeLinkMatch[1].split('v=')[1];
      const transcript = await getYouTubeTranscript(videoId);
      const summary = await summarizeTranscript(transcript);
      return summary;
    }
    // Invoking the function to start the content generation process.
    return await getChatResponse(userQuery);
  } catch (error) {
    throw new Error(`Error in callExternalApi: ${error.message}`);
  }
};

exports.determineYoutubeIntent = async (userQuery) => {
  try {
    // Invoking the function to start the content generation process.
    return await detectYouTubeSummaryIntent(userQuery);
  } catch (error) {
    throw new Error(`Error in determineYoutubeIntent: ${error.message}`);
  }
} 