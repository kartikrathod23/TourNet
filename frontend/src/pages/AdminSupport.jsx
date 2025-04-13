import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminSupport = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch chat sessions from the backend
    const fetchChatSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/chat-support/sessions');
        setChatSessions(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching chat sessions:', err);
        setError('Failed to load chat sessions');
        
        // Fallback to simulated data if the API fails
        setChatSessions([
          { 
            sessionId: 'session_demo_1', 
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            userInfo: { referrer: '/dashboard' },
            messageCount: 8
          },
          { 
            sessionId: 'session_demo_2', 
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            userInfo: { referrer: '/my-bookings' },
            messageCount: 5
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
  }, []);

  const fetchSessionHistory = async (sessionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/chat-support/${sessionId}/history`);
      setSessionHistory(response.data);
      setSelectedSessionId(sessionId);
      setError('');
    } catch (err) {
      console.error('Error fetching session history:', err);
      setError('Failed to load chat history');
      setSessionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-gray-300/80 backdrop-blur-md shadow-md px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-700">TourNet Admin</h1>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <a href="/dashboard" className="hover:text-blue-600 transition">Dashboard</a>
          <a href="/admin-support" className="text-blue-600 transition">Support Chats</a>
          <a href="/my-bookings" className="hover:text-blue-600 transition">Bookings</a>
        </nav>
        
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-md cursor-pointer">
          <span className="text-purple-600 text-lg">🔒</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Support Chats</h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="md:col-span-1 border-r border-gray-200 pr-4">
              <h3 className="font-semibold text-gray-700 mb-3">Recent Sessions</h3>
              
              {loading && chatSessions.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : chatSessions.length === 0 ? (
                <p className="text-gray-500 py-4">No chat sessions available</p>
              ) : (
                <ul className="space-y-2">
                  {chatSessions.map((session) => (
                    <li key={session.sessionId}>
                      <button
                        onClick={() => fetchSessionHistory(session.sessionId)}
                        className={`w-full text-left px-3 py-2 rounded 
                          ${selectedSessionId === session.sessionId 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100'}`}
                      >
                        <p className="font-medium truncate">Session {session.sessionId.substring(8, 16)}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Page: {session.userInfo.referrer}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Chat History */}
            <div className="md:col-span-2">
              {selectedSessionId ? (
                <>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Chat History - Session {selectedSessionId.substring(8, 16)}
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : sessionHistory.length === 0 ? (
                    <p className="text-gray-500 py-4">No messages in this chat session</p>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                      <div className="space-y-4">
                        {sessionHistory.map((message, index) => (
                          <div key={index} className="flex flex-col">
                            <p className="text-xs text-gray-500 mb-1">
                              {message.role === 'user' ? 'Customer' : 'AI Assistant'}
                            </p>
                            <div 
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.role === 'user' 
                                  ? 'bg-blue-600 text-white ml-auto' 
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-gray-500">Select a chat session to view its history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 text-center text-gray-600 py-4 mt-12">
        © 2025 TourNet · Admin Panel
      </footer>
    </div>
  );
};

export default AdminSupport; 