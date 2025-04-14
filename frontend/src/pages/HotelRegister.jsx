import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHotel, FaSpinner, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const HotelRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    starRating: '',
    amenities: '',
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellationPolicy: 'Standard 24-hour cancellation policy applies',
      petsAllowed: false
    },
    contactPerson: {
      name: '',
      position: '',
      email: '',
      phone: ''
    },
    licenseNumber: ''
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    setError('');
  };
  
  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    if (!formData.phone || !formData.description || !formData.address.street || 
        !formData.address.city || !formData.address.country || 
        !formData.address.postalCode || !formData.starRating) {
      setError('Please fill in all required fields');
      return false;
    }
    
    const starRating = parseInt(formData.starRating);
    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
      setError('Star rating must be a number between 1 and 5');
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError('');
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setError('');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 3) {
      if (!formData.contactPerson.name) {
        setError('Contact person name is required');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Process amenities array
        let amenitiesArray = [];
        if (formData.amenities) {
          amenitiesArray = formData.amenities.split(',').map(item => item.trim());
        }
        
        // Prepare data for API
        const hotelData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          description: formData.description,
          address: formData.address,
          starRating: parseInt(formData.starRating),
          amenities: amenitiesArray,
          policies: formData.policies,
          contactPerson: formData.contactPerson,
          licenseNumber: formData.licenseNumber
        };
        
        const response = await axios.post('http://localhost:5000/api/hotel-auth/register', hotelData);
        
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userType', 'hotel');
          
          // Redirect to hotel dashboard
          navigate('/hotel/dashboard');
        } else {
          setError(response.data.error || 'Registration failed. Please try again.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Server error. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      nextStep();
    }
  };

  const renderStep1 = () => (
    <>
      <div className="mb-6">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Hotel Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Hotel Grand Palace"
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your-hotel@example.com"
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="mb-6">
        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Hotel Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of your hotel..."
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Hotel Address <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="Street Address"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="City"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="State/Province"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
          </div>
          
          <div>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              placeholder="Country"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="starRating" className="block text-gray-700 text-sm font-bold mb-2">
          Star Rating <span className="text-red-500">*</span>
        </label>
        <select
          id="starRating"
          name="starRating"
          value={formData.starRating}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Star Rating</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label htmlFor="amenities" className="block text-gray-700 text-sm font-bold mb-2">
          Amenities (Comma separated)
        </label>
        <input
          type="text"
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          placeholder="WiFi, Swimming Pool, Restaurant, Spa, etc."
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Hotel Policies
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <label htmlFor="checkInTime" className="block text-gray-700 text-sm mb-1">
              Check-in Time
            </label>
            <input
              type="time"
              id="checkInTime"
              name="policies.checkInTime"
              value={formData.policies.checkInTime}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="checkOutTime" className="block text-gray-700 text-sm mb-1">
              Check-out Time
            </label>
            <input
              type="time"
              id="checkOutTime"
              name="policies.checkOutTime"
              value={formData.policies.checkOutTime}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-2">
          <label htmlFor="cancellationPolicy" className="block text-gray-700 text-sm mb-1">
            Cancellation Policy
          </label>
          <input
            type="text"
            id="cancellationPolicy"
            name="policies.cancellationPolicy"
            value={formData.policies.cancellationPolicy}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="petsAllowed"
            name="policies.petsAllowed"
            checked={formData.policies.petsAllowed}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="petsAllowed" className="text-gray-700 text-sm">
            Pets Allowed
          </label>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Contact Person <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="contactPerson.name"
              value={formData.contactPerson.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              name="contactPerson.position"
              value={formData.contactPerson.position}
              onChange={handleChange}
              placeholder="Position/Title"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
          </div>
          
          <div>
            <input
              type="email"
              name="contactPerson.email"
              value={formData.contactPerson.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
          </div>
          
          <div>
            <input
              type="tel"
              name="contactPerson.phone"
              value={formData.contactPerson.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="licenseNumber" className="block text-gray-700 text-sm font-bold mb-2">
          License Number
        </label>
        <input
          type="text"
          id="licenseNumber"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
          placeholder="Hotel License/Registration Number"
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <FaHotel className="mx-auto text-5xl text-blue-600 mb-2" />
          <h2 className="text-3xl font-bold text-gray-900">Hotel Registration</h2>
          <p className="mt-2 text-gray-600">Join our platform to showcase your hotel and manage bookings</p>
        </div>
        
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`h-1 w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 px-2">
            <span>Account</span>
            <span>Hotel Details</span>
            <span>Additional Info</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FaArrowLeft className="inline mr-1" /> Back
                </button>
              ) : (
                <Link 
                  to="/hotel/login"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FaArrowLeft className="inline mr-1" /> Login
                </Link>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? (
                  <FaSpinner className="animate-spin inline" />
                ) : step < 3 ? (
                  <>Next <FaArrowRight className="inline ml-1" /></>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HotelRegister; 