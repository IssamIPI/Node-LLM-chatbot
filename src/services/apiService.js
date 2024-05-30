// src/services/apiService.js
const axios = require('axios');
const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const { response } = require('../app');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');
const { extractTextFromPDF, extractTextFromDOCX, extractTextFromTXT } = require('./textExtractionService');
require('dotenv').config();
const { textToSpeech } = require('./elevenLabsService'); 
const { v4: uuidv4 } = require('uuid');
// Constants for project and location should be defined at the top level.
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = 'us-central1';

// Initialize Vertex AI with the necessary project and location information once.
const vertexAiOptions = { project: PROJECT_ID, location: LOCATION };
const vertex_ai = new VertexAI(vertexAiOptions);

// Define model names as constants to avoid magic strings and improve readability.
const GEMINI_PRO_MODEL_NAME = 'gemini-1.5-pro-preview-0409';
const voice = 'XRlny9TzSxQhHzOusWWe'; // Replace with actual voice ID

// Safety settings can be moved outside of the model instantiation,
// if they are static and reused across multiple instances.
const safetySettings = [{
  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}];
const GEMINI_VERIFICATION_MODEL_NAME = 'gemini-1.5-flash-001';

// Options for the second model
const verificationModelOptions = {
  model: GEMINI_VERIFICATION_MODEL_NAME,
  safety_settings: safetySettings,
  generation_config: {  'maxOutputTokens': 8192,
  'temperature': 0,
  'topP': 0.95, },
};

const verificationModel = vertex_ai.preview.getGenerativeModel(verificationModelOptions);
async function verifyResponse(response) {
  const verificationChat = verificationModel.startChat({
    system_instruction: "Enhance the following response for accuracy, coherence, and eliminate any hallucinations. Do not mention that this response has been verified or enhanced, If the following response is accurate enough return it without any modifications"
  });
  const verificationInput = `Enhance the following response for accuracy, coherence, and eliminate any hallucinations. Do not mention that this response has been verified or enhanced, If the following response is accurate enough return it without any modifications: "${response}"`;
  const verificationResult = await verificationChat.sendMessage(verificationInput);
  const verificationResponse = verificationResult.response.candidates[0].content.parts[0].text;

  return verificationResponse;
}
// Instantiate models once outside of functions to avoid repeated initializations.
const generativeModelOptions = {
  model: GEMINI_PRO_MODEL_NAME,
  safety_settings: safetySettings,
  generation_config: { max_output_tokens: 8000 },
};
var chat = null
const generativeModel = vertex_ai.preview.getGenerativeModel(generativeModelOptions);
// The streamGenerateContent function does not need to be an async declaration since it returns a Promise implicitly.
async function getChatResponse(userQuery,googleSearchRetrievalTool) {
  

    try {
     
    if(!chat){
      chat = generativeModel.startChat({
        tools: [googleSearchRetrievalTool],
      });
    }
    const chatInput = userQuery ;
    const result = await chat.sendMessage(chatInput);
    const response = result.response.candidates[0].content.parts[0].text;
      // Convert the response to speech using ElevenLabs TTS

    // const groundingMetadata = result.response.candidates[0].groundingMetadata;
    const verifiedResponse = await verifyResponse(response);
    return { summary: verifiedResponse };
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
  
    const {summary} = await getChatResponse(request.parts[0].text);
    return summary;
  }
  
  async function detectYouTubeSummaryIntent(userQuery) {
    const request = {
      role: 'user',
      parts: [{ text: `Analyze the following query and determine if it requests a YouTube video summary. Extract the YouTube link if present: ${userQuery}` }]
    };
    
    const {summary}= await getChatResponse(request.parts[0].text);
    return summary;
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
    const {summary} = await getChatResponse(`Answer the user question using the following text: ${text} , here is the user question : ${userQuery}`);
    return summary;
  }
exports.getModelResponse = async (userQuery,file) => {
  const audioFileName = `audio_${uuidv4()}.mp3`;
  const outputPath = path.join(__dirname, '..','..', 'public', 'output', audioFileName); // Path to save the audio file
  const audioPath = `/output/${audioFileName}`;
  try {
    if (file) {
      const summary = await handleFileUpload(userQuery,file.path, file.mimetype);
     
      return { summary: summary };
    }
    const intentAnalysis = await detectYouTubeSummaryIntent(userQuery);
    const youtubeLinkMatch = intentAnalysis.match(/(?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?.*?(v=[^&\s]+).*)|(?:v(\/.*))|(channel\/.+)|(?:user\/(.+))|(?:results\?(search_query=.+))))?)|(?:youtu\.be(\/.*)?))/i);
   
    if (youtubeLinkMatch) {
      const videoId = youtubeLinkMatch[1].split('v=')[1];
      const transcript = await getYouTubeTranscript(videoId);
      const summary = await summarizeTranscript(transcript);
     

      return { summary: summary };
      // return summary;
    }
    const googleSearchRetrievalTool = {
      googleSearchRetrieval: {
        disableAttribution: false,
      },
    };
    const {summary} = await getChatResponse(userQuery,googleSearchRetrievalTool)
   
    // Invoking the function to start the content generation process.
    return { summary: summary};
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