/**
 * This script tests the Gemini API key directly.
 * Run it with: node test-gemini.js
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';


// Verify API key format
if (!GEMINI_API_KEY || !GEMINI_API_KEY.startsWith('AIza')) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Invalid Gemini API key format'); 
  console.log('Your API key:', GEMINI_API_KEY);
  console.log('API keys should start with "AIza" followed by a long string');
  console.log('Get a valid key from: https://makersuite.google.com/app/apikey');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', 'Testing Gemini API connection...');
console.log('API Key found in .env file:', GEMINI_API_KEY.substring(0, 8) + '...');

async function testGeminiAPI() {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello, please respond with a short greeting to confirm you are working.' }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 30
        }
      }
    );
    
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content) {
      
      const reply = response.data.candidates[0].content.parts[0].text;
      
      console.log('\x1b[32m%s\x1b[0m', 'SUCCESS: Gemini API is working!');
      console.log('Response from API:', reply);
      return true;
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'ERROR: Unexpected API response format'); 
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: Failed to connect to Gemini API');
    
    if (error.response && error.response.data) {
      console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.error && error.response.data.error.message) {
        if (error.response.data.error.message.includes('API key')) {
          console.log('\x1b[33m%s\x1b[0m', 'This appears to be an API key issue. Make sure:');
          console.log('1. Your key is valid and active');
          console.log('2. You have enabled the Gemini API in your Google Cloud project');
          console.log('3. You have billing set up (if required)');
        }
      }
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
testGeminiAPI()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 