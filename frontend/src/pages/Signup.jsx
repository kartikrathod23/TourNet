import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Navbar />
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Signup Form Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-24 px-4">
        <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Create your TourNet Account
          </h2>
          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm text-white mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                required
              />
            </div>
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
                placeholder="Create a secure password"
                className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
            >
              Sign Up
            </button>

            <p className="text-center text-sm text-white mt-4">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-blue-300 hover:underline font-semibold"
              >
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
