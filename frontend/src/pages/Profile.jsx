import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    preferences: {
      travelStyle: 'leisure',
      budget: 'moderate',
      notificationPreferences: ['email', 'app']
    }
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    // Check for auth token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // In a real app, this would fetch from your backend API
      // Mocking the API response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUserData = {
        id: '123456',
        fullName: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Traveler Street',
        city: 'San Francisco',
        country: 'United States',
        profileImage: 'https://randomuser.me/api/portraits/men/44.jpg',
        preferences: {
          travelStyle: 'adventure',
          budget: 'moderate',
          notificationPreferences: ['email', 'app']
        },
        stats: {
          totalBookings: 12,
          countries: 8,
          reviewsSubmitted: 5,
          pointsEarned: 3450
        },
        memberSince: '2022-05-15'
      };
      
      setUser(mockUserData);
      setFormData({
        fullName: mockUserData.fullName,
        email: mockUserData.email,
        phone: mockUserData.phone || '',
        address: mockUserData.address || '',
        city: mockUserData.city || '',
        country: mockUserData.country || '',
        preferences: {
          ...mockUserData.preferences
        }
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: value
      }
    });
  };
  
  const handleNotificationPreferenceChange = (type) => {
    const currentPreferences = [...formData.preferences.notificationPreferences];
    
    if (currentPreferences.includes(type)) {
      // Remove if already selected
      const updated = currentPreferences.filter(pref => pref !== type);
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          notificationPreferences: updated
        }
      });
    } else {
      // Add if not selected
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          notificationPreferences: [...currentPreferences, type]
        }
      });
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // In a real app, this would be an API call to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user state with the new information
      setUser({
        ...user,
        ...formData,
        preferences: {
          ...formData.preferences
        }
      });
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    // Simple validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match');
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    try {
      // In a real app, this would be an API call to update the password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update your password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {loading && !user ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error && !user ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
              <button 
                onClick={fetchUserProfile} 
                className="ml-4 text-blue-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : user ? (
            <>
              {/* Profile Header */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 relative">
                  {/* Profile Image */}
                  <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                    <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                      <img
                        src={user.profileImage || 'https://via.placeholder.com/150'}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-16 pb-6 px-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">{user.fullName}</h1>
                      <p className="text-gray-600">
                        Member since {formatDate(user.memberSince)}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      {isEditing ? (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            form="profile-form"
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{user.stats.totalBookings}</div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{user.stats.countries}</div>
                      <div className="text-sm text-gray-600">Countries</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-700">{user.stats.reviewsSubmitted}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-700">{user.stats.pointsEarned}</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 flex justify-between">
                  {successMessage}
                  <button 
                    onClick={() => setSuccessMessage('')}
                    className="text-green-700 hover:text-green-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex justify-between">
                  {error}
                  <button 
                    onClick={() => setError('')}
                    className="text-red-700 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Tabs */}
              <div className="mb-8 border-b border-gray-200">
                <div className="flex space-x-8">
                  <button
                    className={`py-4 px-1 font-medium ${activeTab === 'profile' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Details
                  </button>
                  <button
                    className={`py-4 px-1 font-medium ${activeTab === 'security' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('security')}
                  >
                    Security
                  </button>
                  <button
                    className={`py-4 px-1 font-medium ${activeTab === 'preferences' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('preferences')}
                  >
                    Preferences
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="bg-white rounded-xl shadow-md p-8">
                {activeTab === 'profile' && (
                  <form id="profile-form" onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  </form>
                )}
                
                {activeTab === 'security' && (
                  <form onSubmit={handleUpdatePassword}>
                    <div className="max-w-md mx-auto">
                      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 8 characters long.
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
                
                {activeTab === 'preferences' && (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Travel Preferences</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Travel Style
                          </label>
                          <select
                            name="travelStyle"
                            value={formData.preferences.travelStyle}
                            onChange={handlePreferenceChange}
                            disabled={!isEditing}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                              !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          >
                            <option value="leisure">Leisure</option>
                            <option value="adventure">Adventure</option>
                            <option value="business">Business</option>
                            <option value="luxury">Luxury</option>
                            <option value="budget">Budget</option>
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget
                          </label>
                          <select
                            name="budget"
                            value={formData.preferences.budget}
                            onChange={handlePreferenceChange}
                            disabled={!isEditing}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                              !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          >
                            <option value="budget">Budget</option>
                            <option value="moderate">Moderate</option>
                            <option value="luxury">Luxury</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                        
                        <div className="space-y-3">
                          <label className={`flex items-center ${!isEditing ? 'opacity-75' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.preferences.notificationPreferences.includes('email')}
                              onChange={() => handleNotificationPreferenceChange('email')}
                              disabled={!isEditing}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">Email Notifications</span>
                          </label>
                          
                          <label className={`flex items-center ${!isEditing ? 'opacity-75' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.preferences.notificationPreferences.includes('sms')}
                              onChange={() => handleNotificationPreferenceChange('sms')}
                              disabled={!isEditing}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">SMS Notifications</span>
                          </label>
                          
                          <label className={`flex items-center ${!isEditing ? 'opacity-75' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.preferences.notificationPreferences.includes('app')}
                              onChange={() => handleNotificationPreferenceChange('app')}
                              disabled={!isEditing}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">App Notifications</span>
                          </label>
                          
                          <label className={`flex items-center ${!isEditing ? 'opacity-75' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.preferences.notificationPreferences.includes('marketing')}
                              onChange={() => handleNotificationPreferenceChange('marketing')}
                              disabled={!isEditing}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">Marketing Emails</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="mt-8 flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Save Preferences
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Profile; 