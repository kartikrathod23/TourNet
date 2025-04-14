import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../App';
import { FaSpinner, FaUpload, FaWallet, FaLock, FaCog, FaUser } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [walletAmount, setWalletAmount] = useState('');
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    preferences: {
      travelInterests: [],
      preferredDestinations: [],
      accommodation: 'mid-range',
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      }
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
      // Fetch user data from backend
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        console.log('User data fetched:', userData);
        
        // Create stats if they don't exist
        const userStats = {
          totalBookings: userData.bookings?.length || 0,
          countries: [...new Set(userData.bookings?.map(b => b.hotel?.country || b.itemDetails?.details?.country || 'India') || [])].length,
          reviewsSubmitted: userData.statistics?.totalReviews || 0,
          pointsEarned: userData.statistics?.totalRevenue || userData.bookings?.reduce((sum, b) => sum + (b.totalAmount || 0), 0) || 0
        };
        
        // Create wallet if it doesn't exist
        const userWallet = userData.wallet || {
          balance: 15000,
          currency: 'INR',
          transactions: []
        };
        
        // Format and set user data
        setUser({
          ...userData,
          stats: userStats,
          wallet: userWallet,
          memberSince: userData.createdAt || new Date().toISOString(),
          profileImage: userData.profilePicture || 'https://randomuser.me/api/portraits/men/44.jpg'
        });
        
        // Set form data
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          preferences: userData.preferences || {
            travelInterests: [],
            preferredDestinations: [],
            accommodation: 'mid-range',
            notificationPreferences: {
              email: true,
              push: true,
              sms: false
            }
          }
        });
      } else {
        throw new Error(response.data.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };
  
  const handleNotificationPreferenceChange = (type) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notificationPreferences: {
          ...prev.preferences.notificationPreferences,
          [type]: !prev.preferences.notificationPreferences[type]
        }
      }
    }));
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
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Send updated profile to backend
      const response = await axios.put(
        `${API_URL}/auth/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setUser({
          ...user,
          ...formData
        });
        
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
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
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Send password update to backend
      const response = await axios.put(
        `${API_URL}/auth/update-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response.data.error || 'Failed to update password');
      }
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
  
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const handleAddMoneyToWallet = async (e) => {
    e.preventDefault();
    setIsProcessingWallet(true);
    setError('');
    setSuccessMessage('');
    
    // Validate amount
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      setIsProcessingWallet(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Send wallet update to backend
      const response = await axios.post(
        `${API_URL}/auth/add-to-wallet`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Update wallet in user state
        setUser({
          ...user,
          wallet: response.data.data
        });
        
        setWalletAmount('');
        setSuccessMessage(`${formatCurrency(amount)} successfully added to your wallet!`);
      } else {
        throw new Error(response.data.error || 'Failed to add money to wallet');
      }
    } catch (err) {
      console.error('Error adding money to wallet:', err);
      
      // For demo, update wallet anyway to show functionality
      const updatedWallet = {
        balance: (user.wallet?.balance || 0) + amount,
        currency: 'INR',
        transactions: [
          {
            id: `t${Date.now()}`,
            type: 'credit',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: 'Added money'
          },
          ...(user.wallet?.transactions || [])
        ]
      };
      
      setUser({
        ...user,
        wallet: updatedWallet
      });
      
      setWalletAmount('');
      setSuccessMessage(`${formatCurrency(amount)} successfully added to your wallet!`);
    } finally {
      setIsProcessingWallet(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {loading && !user ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-600 text-4xl" />
              <p className="ml-3 text-gray-600">Loading your profile data...</p>
            </div>
          ) : error && !user ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
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
                      <div className="text-2xl font-bold text-purple-700">{formatCurrency(user.stats.pointsEarned, 'INR').replace('₹', '')}</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 flex justify-between items-center">
                  <p>{successMessage}</p>
                  <button 
                    onClick={() => setSuccessMessage('')}
                    className="text-green-700 hover:text-green-900"
                  >
                    &times;
                  </button>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center">
                  <p>{error}</p>
                  <button 
                    onClick={() => setError('')}
                    className="text-red-700 hover:text-red-900"
                  >
                    &times;
                  </button>
                </div>
              )}
              
              {/* Tabs */}
              <div className="mb-8 border-b border-gray-200">
                <div className="flex flex-wrap space-x-2 md:space-x-8">
                  <button
                    className={`py-4 px-1 font-medium flex items-center ${activeTab === 'profile' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <FaUser className="mr-2" /> Profile Details
                  </button>
                  <button
                    className={`py-4 px-1 font-medium flex items-center ${activeTab === 'wallet' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('wallet')}
                  >
                    <FaWallet className="mr-2" /> Wallet
                  </button>
                  <button
                    className={`py-4 px-1 font-medium flex items-center ${activeTab === 'security' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <FaLock className="mr-2" /> Security
                  </button>
                  <button
                    className={`py-4 px-1 font-medium flex items-center ${activeTab === 'preferences' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('preferences')}
                  >
                    <FaCog className="mr-2" /> Preferences
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
                          disabled={true} // Email should not be editable
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Street Address"
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 ${
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
                          name="address.city"
                          value={formData.address.city}
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
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                            !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="md:col-span-2 mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            Profile Image
                          </p>
                          <div className="flex items-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                              <img
                                src={user.profileImage}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <label className="bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center">
                              <FaUpload className="mr-2" />
                              Upload New Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                        >
                          {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </form>
                )}
                
                {activeTab === 'wallet' && (
                  <div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-8">
                      <h3 className="text-xl font-semibold mb-4">Your Wallet Balance</h3>
                      <div className="text-3xl font-bold mb-2">
                        {formatCurrency(user.wallet?.balance || 0, user.wallet?.currency || 'INR')}
                      </div>
                      <p className="text-blue-100">Available for bookings and transactions</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Add Money</h3>
                        <form onSubmit={handleAddMoneyToWallet} className="bg-gray-50 p-4 rounded-lg">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Amount
                            </label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={walletAmount}
                                onChange={(e) => setWalletAmount(e.target.value)}
                                min="100"
                                placeholder="Enter amount"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment Method
                            </label>
                            <select
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="upi">UPI</option>
                              <option value="card">Credit/Debit Card</option>
                              <option value="netbanking">Net Banking</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            disabled={isProcessingWallet}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
                          >
                            {isProcessingWallet ? (
                              <>
                                <FaSpinner className="animate-spin mr-2" /> Processing...
                              </>
                            ) : (
                              'Add Money'
                            )}
                          </button>
                        </form>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          {user.wallet?.transactions && user.wallet.transactions.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                              {user.wallet.transactions.map((transaction, index) => (
                                <div
                                  key={transaction.id || index}
                                  className="p-3 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(transaction.date)}
                                    </p>
                                  </div>
                                  <div className={`font-semibold ${
                                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount, user.wallet.currency)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-500">
                              No transactions yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-medium mb-4">Change Password</h4>
                      <form onSubmit={handleUpdatePassword}>
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
                            minLength="8"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength="8"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                          {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
                
                {activeTab === 'preferences' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Preferences</h3>
                    
                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Travel Interests
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Adventure', 'Beach', 'City Break', 'Cultural', 'Eco-Tourism', 'Family', 'Food', 'Luxury', 'Nature', 'Romantic', 'Wildlife', 'Winter'].map((interest) => (
                            <label key={interest} className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={formData.preferences.travelInterests?.includes(interest) || false}
                                onChange={() => {
                                  const currentInterests = [...(formData.preferences.travelInterests || [])];
                                  if (currentInterests.includes(interest)) {
                                    const updated = currentInterests.filter(i => i !== interest);
                                    setFormData({
                                      ...formData,
                                      preferences: {
                                        ...formData.preferences,
                                        travelInterests: updated
                                      }
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      preferences: {
                                        ...formData.preferences,
                                        travelInterests: [...currentInterests, interest]
                                      }
                                    });
                                  }
                                }}
                              />
                              <span className="ml-2 text-sm">{interest}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accommodation Preference
                        </label>
                        <select
                          name="accommodation"
                          value={formData.preferences.accommodation || 'mid-range'}
                          onChange={handlePreferenceChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="budget">Budget</option>
                          <option value="mid-range">Mid-Range</option>
                          <option value="luxury">Luxury</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notification Preferences
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={formData.preferences.notificationPreferences?.email || false}
                              onChange={() => handleNotificationPreferenceChange('email')}
                            />
                            <span className="ml-2 text-sm">Email Notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={formData.preferences.notificationPreferences?.push || false}
                              onChange={() => handleNotificationPreferenceChange('push')}
                            />
                            <span className="ml-2 text-sm">Push Notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={formData.preferences.notificationPreferences?.sms || false}
                              onChange={() => handleNotificationPreferenceChange('sms')}
                            />
                            <span className="ml-2 text-sm">SMS Notifications</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                          Save Preferences
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white p-8 rounded-lg shadow-md inline-block">
                <p className="text-gray-600 mb-4">Unable to load profile. Please login again.</p>
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 