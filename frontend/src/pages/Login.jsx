import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAgent, setIsAgent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if agent param exists in URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('agent') === 'true') {
      setIsAgent(true);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isAgent 
        ? 'http://localhost:5000/api/auth/agent-login' 
        : 'http://localhost:5000/api/auth/login';
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          role: isAgent ? 'agent' : 'user' 
        }),
      });

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', isAgent ? 'agent' : 'user');
      
      if (isAgent) {
        navigate('/agent/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Navbar />

      {/* Background image from Unsplash */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-24 px-4">
        <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            {isAgent ? 'Agent Login' : 'Login to TourNet'}
          </h2>
          {isAgent && (
            <p className="text-white text-center mb-6">Access your travel agent portal</p>
          )}
          {!isAgent && (
            <p className="text-white text-center mb-6">Welcome back, explorer!</p>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm text-white mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className={`w-full font-semibold py-2 rounded-md ${
                isAgent 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAgent ? 'Agent Login' : 'Login'}
            </button>

            <p className="text-center text-sm text-white mt-4">
              {isAgent ? (
                <>
                  Not an agent?{' '}
                  <a href="/login" className="text-blue-300 hover:underline font-semibold">
                    User Login
                  </a>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <a href="/signup" className="text-blue-300 hover:underline font-semibold">
                    Sign up
                  </a>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
