import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatSupport = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnectionIssue, setIsConnectionIssue] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "How do I cancel my booking?",
    "What's your refund policy?",
    "Can I modify my travel dates?",
    "What payment methods do you accept?"
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  // Start a new chat session when the component is mounted
  useEffect(() => {
    if (isChatOpen && !sessionId) {
      startChatSession();
    }
  }, [isChatOpen]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle clicks outside the chat window to minimize it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isChatOpen && !isMinimized) {
        setIsMinimized(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChatSession = async () => {
    try {
      setIsLoading(true);
      setError('');
      setIsConnectionIssue(false);
      
      const response = await axios.post('http://localhost:5000/api/chat-support/start', {
        userInfo: {
          // You could add user info here if available
          // userId: currentUser?.id,
          // name: currentUser?.name,
          referrer: window.location.pathname
        }
      });

      setSessionId(response.data.sessionId);
      
      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! 👋 Welcome to TourNet support. How can I help you with your travel plans today?'
        }
      ]);
    } catch (err) {
      console.error('Error starting chat session:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setIsConnectionIssue(true);
        setError('Unable to connect to the chat server. Please check your connection and try again.');
      } else if (err.response) {
        // Server responded with an error
        if (err.response.data && err.response.data.details === 'Missing or invalid API key') {
          // This is an API key configuration issue - show a message for administrators
          setError(
            'The chat support feature requires a valid API key. ' +
            'Administrators: Please check the backend/.env file and add a valid API key.'
          );
        } else {
          setError(`Chat support error: ${err.response.data.error || 'Unknown server error'}`);
        }
      } else {
        setError('Unable to start chat support. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content = newMessage) => {
    if (!content.trim() || !sessionId) return;
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: content
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setError('');
    
    try {
      // Add typing indicator
      setMessages(prev => [...prev, { role: 'assistant', content: '...', isTyping: true }]);
      
      const response = await axios.post('http://localhost:5000/api/chat-support/message', {
        sessionId,
        message: userMessage.content
      });
      
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          role: 'assistant',
          content: response.data.reply
        }];
      });
      
      // Show a helpful tip if there was an error from the service
      if (response.data.error) {
        const errorType = response.data.errorType || 'unknown';
        
        let errorMessage = '';
        
        switch (errorType) {
          case 'quota':
            errorMessage = 'The AI service has reached its usage limit. This is typically a temporary issue.';
            break;
          case 'timeout':
            errorMessage = 'The response took too long. Consider asking shorter or simpler questions.';
            break;
          case 'service':
            errorMessage = 'There are temporary issues with the AI service. This usually resolves quickly.';
            break;
          default:
            errorMessage = 'There was an issue with the chat service. Please try again later.';
        }
        
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }];
      });
      
      if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else if (err.response && err.response.status === 404) {
        // Session likely expired
        setError('Your chat session has expired. Please refresh the page to start a new session.');
      }
      
    } finally {
      setIsLoading(false);
      // Focus on input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const expandChat = () => {
    setIsMinimized(false);
    // Focus input when expanding
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const retryConnection = () => {
    startChatSession();
  };

  const endChatSession = async () => {
    if (sessionId) {
      try {
        await axios.delete(`http://localhost:5000/api/chat-support/${sessionId}`);
      } catch (err) {
        console.error('Error ending chat session:', err);
      }
    }
    
    setIsChatOpen(false);
    setSessionId('');
    setMessages([]);
    setError('');
    setIsConnectionIssue(false);
    setIsMinimized(false);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Format timestamp for each message
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    // If the message was sent today, just show the time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise, show the date and time
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + 
           messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isChatOpen && (
        <div 
          ref={chatRef}
          className={`bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden mb-4 transition-all duration-300 ease-in-out ${
            isMinimized 
              ? 'w-72 h-16' 
              : 'w-80 sm:w-96 h-[32rem] max-h-[calc(100vh-2rem)]'
          }`}
        >
          {/* Chat Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">💬</span>
              </div>
              <div>
                <h3 className="font-semibold">TourNet Support</h3>
                {!isMinimized && <p className="text-xs text-blue-100">We're here to help</p>}
              </div>
            </div>
            <div className="flex items-center">
              {isMinimized ? (
                <button 
                  onClick={expandChat}
                  className="text-white hover:text-blue-200 transition p-1"
                  aria-label="Expand chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              ) : (
                <>
                  <button 
                    onClick={minimizeChat}
                    className="text-white hover:text-blue-200 transition p-1 mr-1"
                    aria-label="Minimize chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={endChatSession}
                    className="text-white hover:text-red-200 transition p-1"
                    aria-label="Close chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Error Message */}
          {error && !isMinimized && (
            <div className="bg-red-100 text-red-600 px-4 py-3 text-sm flex items-center justify-between">
              <span>{error}</span>
              {isConnectionIssue && (
                <button 
                  onClick={retryConnection}
                  className="ml-2 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          
          {!isMinimized && (
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length === 0 && isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      {error ? 'Unable to load chat support' : 'Start chatting with our AI assistant'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : message.isTyping 
                                ? 'bg-gray-200 text-gray-500 rounded-bl-none animate-pulse' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {message.isTyping ? (
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          ) : (
                            <>
                              <div className="mb-1 text-xs opacity-70">
                                {message.role === 'user' ? 'You' : 'TourNet Support'} • {formatTime(message.timestamp || new Date())}
                              </div>
                              <div className="whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            
              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-gray-200">
                {/* Suggested Questions */}
                {messages.length > 0 && suggestions.length > 0 && (
                  <div className="mb-3 overflow-x-auto whitespace-nowrap pb-2 flex gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 border border-blue-100 flex-shrink-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 py-2 px-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className={`bg-blue-600 text-white px-4 py-2 rounded-r-md ${
                      isLoading || !newMessage.trim() 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-blue-700'
                    }`}
                    disabled={isLoading || !newMessage.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`${
          isChatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:shadow-xl`}
        aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
      >
        {isChatOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatSupport; 