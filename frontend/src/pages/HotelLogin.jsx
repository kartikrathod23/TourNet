import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHotel, FaSpinner } from 'react-icons/fa';

const HotelLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:5000/api/hotel-auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'hotel');
        
        // Redirect to hotel dashboard
        navigate('/hotel/dashboard');
      } else {
        setError(response.data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Server error. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-8 text-center">
          <FaHotel className="mx-auto text-5xl mb-2" />
          <h2 className="text-3xl font-bold">Hotel Login</h2>
          <p className="mt-2 text-blue-100">Access your hotel management portal</p>
        </div>
        
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="your-hotel@example.com"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="••••••••"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm">
                <Link to="/hotel/forgot-password" className="text-blue-600 hover:text-blue-800">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              {loading ? (
                <FaSpinner className="animate-spin mx-auto" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have a hotel account?{' '}
              <Link to="/hotel/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                Register Now
              </Link>
            </p>
            
            <p className="mt-4 text-sm text-gray-500">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                ← Return to home page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelLogin; 