import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agencyName: '',
    businessAddress: '',
    businessPhone: '',
    businessLicense: '',
    website: '',
    licenseNumber: '',
    yearsInBusiness: ''
  });

  const [error, setError] = useState('');
  const [isAgentSignup, setIsAgentSignup] = useState(false);
  const navigate = useNavigate();

  const { fullName, email, password, confirmPassword, role, agencyName, businessAddress, businessPhone, businessLicense, website, licenseNumber, yearsInBusiness } = formData;

  useEffect(() => {
    // Check if the user intended to sign up as an agent
    const intent = localStorage.getItem('intent');
    if (intent === 'agent') {
      setIsAgentSignup(true);
      localStorage.removeItem('intent');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAgentSignup = () => {
    setIsAgentSignup(!isAgentSignup);
    setFormData({
      ...formData,
      role: !isAgentSignup ? 'agent' : 'user',
      agencyName: '',
      businessAddress: '',
      businessPhone: '',
      businessLicense: '',
      website: '',
      licenseNumber: '',
      yearsInBusiness: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate agent fields if agent signup
    if (isAgentSignup) {
      if (!agencyName || !businessAddress || !businessPhone) {
        setError('Please fill all the required agent fields');
        return;
      }
    }

    try {
      // Prepare data based on user type
      const userData = {
        fullName,
        email,
        password,
        role
      };

      // Add agent-specific fields if agent signup
      if (isAgentSignup) {
        userData.agencyDetails = {
          name: agencyName,
          address: businessAddress,
          phone: businessPhone,
          license: businessLicense,
          website,
          licenseNumber,
          yearsInBusiness: parseInt(yearsInBusiness) || 0
        };
      }

      // Call the appropriate endpoint
      const endpoint = isAgentSignup 
        ? 'http://localhost:5000/api/auth/agent-signup' 
        : 'http://localhost:5000/api/auth/signup';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // On successful signup, add token to local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', isAgentSignup ? 'agent' : 'user');
      
      // Redirect based on user type
      navigate(isAgentSignup ? '/agent/dashboard' : '/dashboard');
    } catch (err) {
      setError('Server error. Please try again.');
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
            "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Signup form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-24 px-4">
        <div className="w-full max-w-lg bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            {isAgentSignup ? 'Register as a Travel Agent' : 'Create Your Account'}
          </h2>
          <p className="text-white text-center mb-6">
            {isAgentSignup 
              ? 'Join our platform to offer your travel packages to customers' 
              : 'Join the TourNet community and start exploring!'
            }
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Basic details */}
            <div>
              <label className="block text-sm text-white mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Account Type Toggle */}
            <div className="flex items-center justify-center mt-4">
              <button
                type="button"
                onClick={toggleAgentSignup}
                className="bg-transparent text-white px-4 py-2 border border-white rounded-full hover:bg-white/10 transition flex items-center space-x-2"
              >
                <span>{isAgentSignup ? 'Switch to Regular User' : 'I want to register as a Travel Agent'}</span>
              </button>
            </div>

            {/* Agent-specific fields */}
            {isAgentSignup && (
              <div className="space-y-4 p-4 bg-white/10 rounded-lg mt-4">
                <h3 className="text-lg font-semibold text-white">Travel Agency Details</h3>
                
                <div>
                  <label className="block text-sm text-white mb-1">Agency Name</label>
                  <input
                    type="text"
                    name="agencyName"
                    value={agencyName}
                    onChange={handleChange}
                    placeholder="Your travel agency name"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                    required={isAgentSignup}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white mb-1">Business Address</label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={businessAddress}
                    onChange={handleChange}
                    placeholder="Your business address"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                    required={isAgentSignup}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white mb-1">Business Phone</label>
                  <input
                    type="text"
                    name="businessPhone"
                    value={businessPhone}
                    onChange={handleChange}
                    placeholder="Your business phone number"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                    required={isAgentSignup}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white mb-1">Business License (optional)</label>
                  <input
                    type="text"
                    name="businessLicense"
                    value={businessLicense}
                    onChange={handleChange}
                    placeholder="Your business license number"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white mb-1">Website (Optional)</label>
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={handleChange}
                    placeholder="www.youragency.com"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white mb-1">License Number (Optional)</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={licenseNumber}
                    onChange={handleChange}
                    placeholder="TL-12345"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white mb-1">Years in Business (Optional)</label>
                  <input
                    type="number"
                    name="yearsInBusiness"
                    value={yearsInBusiness}
                    onChange={handleChange}
                    min="0"
                    placeholder="5"
                    className="w-full px-4 py-2 rounded-md bg-white/70 text-black placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className={`w-full font-semibold py-3 rounded-md ${
                isAgentSignup 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAgentSignup ? 'Register as Agent' : 'Sign Up'}
            </button>

            <p className="text-center text-sm text-white mt-4">
              Already have an account?{' '}
              <Link 
                to={isAgentSignup ? "/login?agent=true" : "/login"} 
                className="text-blue-300 hover:underline font-semibold"
              >
                {isAgentSignup ? 'Agent Login' : 'Login'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
