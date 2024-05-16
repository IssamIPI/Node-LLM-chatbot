// src/services/textExtractionService.js
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function extractTextFromDOCX(filePath) {
  const data = await mammoth.extractRawText({ path: filePath });
  return data.value;
}

async function extractTextFromTXT(filePath) {
  return fs.promises.readFile(filePath, 'utf8');
}

module.exports = {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractTextFromTXT,
};
