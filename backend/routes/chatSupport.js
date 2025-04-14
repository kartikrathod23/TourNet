const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Store chat sessions in memory (in a production app, this would be in a database)
const chatSessions = new Map();

// Gemini API endpoint
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta3/models/gemini-pro:generateContent';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key

// Verify API key on startup
const verifyApiKey = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || 
      !process.env.GEMINI_API_KEY.startsWith('AIza')) {
    console.warn('[Chat Support] WARNING: Invalid or missing Gemini API key. Chat support will not function correctly.');
    return false;
  }
  return true;
};

// Check if API key is valid
const isApiKeyValid = verifyApiKey();

// Fallback responses for when the API is unavailable
const fallbackResponses = {
  greeting: [
    "Hello! Welcome to TourNet support. How can I help you plan your trip today?",
    "Hi there! I'm here to help with your travel needs. What are you looking for?"
  ],
  booking: [
    "You can make a booking directly on our website. Just search for your destination, select your dates, and follow the booking process. If you need more help, please let me know.",
    "Booking is easy! Search for your destination, choose your preferred hotel or travel option, and click 'Book Now'. You can manage all your bookings in the 'My Bookings' section."
  ],
  payment: [
    "We accept various payment methods including credit/debit cards, UPI, and net banking. All payments are secure and encrypted.",
    "Our payment options include most major credit cards, debit cards, UPI, and net banking. You can see all available options during checkout."
  ],
  cancellation: [
    "You can cancel your booking through the 'My Bookings' section. Cancellation policies vary depending on the hotel or service provider.",
    "To cancel a booking, go to 'My Bookings', find your reservation, and click the 'Cancel' button. Remember to check the cancellation policy as fees might apply depending on how close you are to the travel date."
  ],
  support: [
    "For additional support, you can email us at support@tournet.com or call our 24/7 helpline at 1-800-TOURNET.",
    "Our support team is available 24/7. You can reach us via email at support@tournet.com or by phone at 1-800-TOURNET."
  ],
  default: [
    "I'm sorry, I couldn't process your specific query right now. You might want to try our FAQ section or contact our support team at support@tournet.com for further assistance.",
    "I'm having trouble understanding your request. Could you try rephrasing your question, or check our Help Center for more information?"
  ]
};

// Function to get a fallback response based on message content
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.length < 10) {
    return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('reservation')) {
    return fallbackResponses.booking[Math.floor(Math.random() * fallbackResponses.booking.length)];
  }
  
  if (lowerMessage.includes('pay') || lowerMessage.includes('payment') || lowerMessage.includes('credit card') || lowerMessage.includes('debit card')) {
    return fallbackResponses.payment[Math.floor(Math.random() * fallbackResponses.payment.length)];
  }
  
  if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
    return fallbackResponses.cancellation[Math.floor(Math.random() * fallbackResponses.cancellation.length)];
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
    return fallbackResponses.support[Math.floor(Math.random() * fallbackResponses.support.length)];
  }
  
  return fallbackResponses.default[Math.floor(Math.random() * fallbackResponses.default.length)];
};

// Initialize a new chat session
router.post('/start', async (req, res) => {
  try {
    // Check if API key is valid
    if (!isApiKeyValid) {
      return res.status(500).json({ 
        error: 'Chat support is not configured correctly. Please contact the administrator.',
        details: 'Missing or invalid API key'
      });
    }

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    
    chatSessions.set(sessionId, {
      history: [],
      createdAt: new Date(),
      userInfo: req.body.userInfo || {}
    });
    
    res.status(200).json({
      sessionId,
      message: 'Chat session started'
    });
  } catch (error) {
    console.error('[Chat Support] Error starting chat session:', error.message);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Send a message to the chat
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // Add user message to history
    session.history.push({
      role: 'user',
      content: message
    });
    
    // Don't attempt to use Gemini API if we know the API key is invalid
    if (!isApiKeyValid) {
      console.log('[Chat Support] Using fallback mode due to invalid API key');
      const fallbackResponse = getFallbackResponse(message);
      
      // Add fallback response to history
      session.history.push({
        role: 'assistant',
        content: fallbackResponse
      });
      
      return res.status(200).json({
        reply: fallbackResponse,
        error: true,
        errorType: 'configuration',
        isFallback: true
      });
    }
    
    // Prepare context for Gemini
    const websiteContext = `
      You are a helpful travel assistant for TourNet, a travel booking website.
      TourNet offers:
      - Hotel bookings in various destinations
      - Tour packages with guided experiences
      - Travel options like flights, trains, and car rentals
      - Activity recommendations for destinations
      
      Assist users with finding destinations, comparing travel options, booking procedures, 
      payment methods, and general travel advice. Be friendly, concise, and helpful.
      Only provide information related to travel and the services provided by TourNet.
      
      If asked about booking cancellations, tell users they can cancel on their My Bookings page.
      If asked about payment methods, tell users we accept credit cards, debit cards, UPI, and net banking.
      If asked about support, tell users they can reach us 24/7 through this chat or email at support@tournet.com.
    `;
    
    // Format the chat history for Gemini
    const formattedMessages = session.history.map(msg => {
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });
    
    // Add the context message at the beginning if this is the first message
    if (session.history.length === 1) {
      formattedMessages.unshift({
        role: 'model',
        parts: [{ text: websiteContext }]
      });
    }
    
    // Try using Gemini API
    try {
      // Call Gemini API
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: formattedMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        },
        {
          timeout: 10000 // 10 second timeout
        }
      );
      
      let aiResponse = "I'm sorry, I couldn't process your request. Please try again.";
      
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
      }
      
      // Add AI response to history
      session.history.push({
        role: 'assistant',
        content: aiResponse
      });
      
      // Return the response
      res.status(200).json({
        reply: aiResponse
      });
    } catch (apiError) {
      console.error('[Chat Support] Gemini API error:', apiError.message);
      
      // If there's a response from the API with error details
      if (apiError.response && apiError.response.data) {
        console.error('[Chat Support] API error details:', JSON.stringify(apiError.response.data));
        
        // Check for common API key issues
        if (apiError.response.status === 400 && apiError.response.data.error) {
          const errorMessage = apiError.response.data.error.message || '';
          
          if (errorMessage.includes('API key')) {
            return res.status(500).json({ 
              error: 'Invalid API key. Please contact the administrator.',
              details: errorMessage
            });
          }
        }
        
        // Check for quota or rate limiting issues
        if (apiError.response.status === 429) {
          const fallbackResponse = "I've exceeded my usage limits right now. Please try again in a few minutes.";
          
          // Add fallback response to history
          session.history.push({
            role: 'assistant',
            content: fallbackResponse
          });
          
          return res.status(200).json({
            reply: fallbackResponse,
            error: true,
            errorType: 'quota'
          });
        }
      }
      
      // Check if it's a timeout error
      if (apiError.code === 'ECONNABORTED' || apiError.message.includes('timeout')) {
        const fallbackResponse = "I'm taking longer than usual to respond. Please try a simpler question or try again later.";
        
        // Add fallback response to history
        session.history.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return res.status(200).json({
          reply: fallbackResponse,
          error: true,
          errorType: 'timeout'
        });
      }
      
      // Generic service error fallback message
      const fallbackResponse = "I'm having temporary issues with my knowledge service. This usually resolves quickly, so please try again in a moment.";
      
      // Add fallback response to history
      session.history.push({
        role: 'assistant',
        content: fallbackResponse
      });
      
      // Return the fallback response
      res.status(200).json({
        reply: fallbackResponse,
        error: true,
        errorType: 'service'
      });
    }
    
  } catch (error) {
    console.error('[Chat Support] Error processing message:', error.message);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history
router.get('/:sessionId/history', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.status(200).json(session.history);
  } catch (error) {
    console.error('[Chat Support] Error retrieving chat history:', error.message);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// End chat session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    chatSessions.delete(sessionId);
    
    res.status(200).json({ message: 'Chat session ended' });
  } catch (error) {
    console.error('[Chat Support] Error ending chat session:', error.message);
    res.status(500).json({ error: 'Failed to end chat session' });
  }
});

// Get all chat sessions (for admin panel)
router.get('/sessions', async (req, res) => {
  try {
    const sessions = Array.from(chatSessions).map(([sessionId, data]) => ({
      sessionId,
      createdAt: data.createdAt,
      userInfo: data.userInfo,
      messageCount: data.history.length
    }));
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error('[Chat Support] Error getting sessions:', error.message);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check if API key is valid
    if (!isApiKeyValid) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Invalid API key configuration'
      });
    }
    
    res.status(200).json({
      status: 'ok',
      message: 'Chat support service is running',
      sessionCount: chatSessions.size
    });
  } catch (error) {
    console.error('[Chat Support] Health check error:', error.message);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Test API key endpoint
router.get('/test-api-key', async (req, res) => {
  try {
    console.log('[Chat Support] Testing Gemini API key');
    
    if (!isApiKeyValid) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Invalid API key format. API key should start with "AIza"'
      });
    }
    
    // Make a simple request to the Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello, can you respond with "API key is working correctly"?' }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50
        }
      }
    );
    
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content) {
      
      const reply = response.data.candidates[0].content.parts[0].text;
      
      res.status(200).json({
        status: 'ok',
        message: 'API key is working',
        reply
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Unexpected API response format',
        response: response.data
      });
    }
  } catch (error) {
    console.error('[Chat Support] API key test error:', error.message);
    
    // Check if there's a response with error details
    if (error.response && error.response.data) {
      console.error('[Chat Support] API error details:', JSON.stringify(error.response.data));
      
      return res.status(500).json({ 
        status: 'error',
        message: 'API key test failed',
        details: error.response.data
      });
    }
    
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

module.exports = router; 