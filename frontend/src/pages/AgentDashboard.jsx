import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaEye, FaExclamationTriangle, FaCheck, FaUser, FaBriefcase, FaChartBar, FaDollarSign, FaExclamationCircle, FaCheckCircle, FaClock } from 'react-icons/fa';

const AgentDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('myPackages');
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalBookings: 0,
    activePackages: 0,
    revenue: 0
  });
  const [agentProfile, setAgentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login?agent=true');
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if user is an agent
        if (response.data.data.role !== 'agent' && response.data.data.role !== 'admin') {
          navigate('/');
          return;
        }

        // Set agent profile data
        setAgentProfile(response.data.data);
        setProfileLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login?agent=true');
      }
    };
    
    checkAuth();
    fetchPackages();
    fetchStats();
    fetchAgentBookings();
  }, [navigate]);
  
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/tour-packages/my-packages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPackages(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to fetch your packages. Please try again.');
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // This would be replaced with an actual API call to get agent stats
      // For now we'll calculate from the packages data
      const packagesRes = await axios.get('http://localhost:5000/api/tour-packages/my-packages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const myPackages = packagesRes.data.data;
      const activePackages = myPackages.filter(pkg => pkg.isActive).length;
      
      // This would be a separate API call in a real implementation
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/agent-bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => ({ data: { data: [] } })); // Fallback if API doesn't exist yet
      
      const bookings = bookingsRes.data.data || [];
      
      const revenue = bookings.reduce((total, booking) => {
        return total + (booking.totalAmount || 0);
      }, 0);
      
      setStats({
        totalPackages: myPackages.length,
        totalBookings: bookings.length,
        activePackages,
        revenue
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error for stats, just log it
    }
  };

  const fetchAgentBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch bookings for agent packages
      const response = await axios.get('http://localhost:5000/api/bookings/agent-bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => {
        // If endpoint doesn't exist yet, use mock data
        return { 
          data: { 
            success: true,
            data: [
              {
                _id: 'b1',
                packageId: 'p1',
                packageTitle: 'Golden Triangle Tour',
                customerName: 'John Smith',
                bookingDate: '2023-07-15',
                startDate: '2023-08-10',
                totalAmount: 35000,
                status: 'confirmed',
                numberOfPeople: 2
              },
              {
                _id: 'b2',
                packageId: 'p2',
                packageTitle: 'Kerala Backwaters Tour',
                customerName: 'Emma Watson',
                bookingDate: '2023-07-20',
                startDate: '2023-09-05',
                totalAmount: 42000,
                status: 'pending',
                numberOfPeople: 3
              }
            ]
          } 
        };
      });
      
      setBookings(response.data.data);
      setBookingsLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setBookingsLoading(false);
    }
  };
  
  const handleDeletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/tour-packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh packages
      setPackages(prevPackages => prevPackages.filter(pkg => pkg._id !== id));
      alert('Package deleted successfully');
      
      // Update stats
      fetchStats();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. Please try again.');
    }
  };
  
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/tour-packages/${id}`, 
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setPackages(prevPackages => 
        prevPackages.map(pkg => 
          pkg._id === id ? { ...pkg, isActive: !currentStatus } : pkg
        )
      );
      
      // Update stats
      fetchStats();
    } catch (error) {
      console.error('Error toggling package status:', error);
      alert('Failed to update package status. Please try again.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // This would be replaced with an actual API call
      // For now we'll just update the local state
      /*
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      */
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      
      alert(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };
  
  const renderVerificationStatus = () => {
    if (profileLoading || !agentProfile) {
      return <div>Loading verification status...</div>;
    }

    const verificationStatus = agentProfile.agencyDetails?.verificationStatus || 'pending';
    
    return (
      <div className="mb-6 p-4 rounded-lg border">
        <h3 className="text-xl font-semibold mb-2">Agency Verification Status</h3>
        
        {verificationStatus === 'pending' && (
          <div className="flex items-center text-yellow-600">
            <FaClock className="mr-2" />
            <span>Your agent account is pending verification. You can still create and manage tour packages, but they might have limited visibility until your account is verified.</span>
          </div>
        )}
        
        {verificationStatus === 'verified' && (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" />
            <span>Your agent account is verified! You have full access to all features.</span>
          </div>
        )}
        
        {verificationStatus === 'rejected' && (
          <div className="flex items-center text-red-600">
            <FaExclamationCircle className="mr-2" />
            <span>Your agent verification was rejected. Please update your agency details and contact support for assistance.</span>
          </div>
        )}
        
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            Agency Name: <span className="font-medium">{agentProfile.agencyDetails?.name || 'Not provided'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Business Address: <span className="font-medium">{agentProfile.agencyDetails?.address || 'Not provided'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Business Phone: <span className="font-medium">{agentProfile.agencyDetails?.phone || 'Not provided'}</span>
          </p>
        </div>
      </div>
    );
  };
  
  const renderPackagesList = () => {
    if (loading) {
      return <div className="text-center py-4">Loading your packages...</div>;
    }
    
    if (error) {
      return (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <FaExclamationTriangle className="inline mr-2" />
          {error}
        </div>
      );
    }
    
    if (packages.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't created any tour packages yet.</p>
          <Link 
            to="/agent/create-package" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Create Your First Package
          </Link>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Package Name</th>
              <th className="py-3 px-4 text-left">Destinations</th>
              <th className="py-3 px-4 text-left">Duration</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {packages.map(pkg => (
              <tr key={pkg._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{pkg.title}</div>
                </td>
                <td className="py-3 px-4">
                  {pkg.destinations && pkg.destinations.map(dest => dest.name).join(', ')}
                </td>
                <td className="py-3 px-4">
                  {pkg.duration?.days} days / {pkg.duration?.nights} nights
                </td>
                <td className="py-3 px-4">
                  {pkg.price?.currency} {pkg.price?.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold 
                    ${pkg.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}`}
                  >
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/packages/${pkg._id}`} 
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View"
                    >
                      <FaEye />
                    </Link>
                    <Link 
                      to={`/agent/edit-package/${pkg._id}`} 
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleToggleActive(pkg._id, pkg.isActive)}
                      className={`${pkg.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                      title={pkg.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {pkg.isActive ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBookingsList = () => {
    if (bookingsLoading) {
      return <div className="text-center py-4">Loading bookings...</div>;
    }
    
    if (bookings.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You don't have any bookings yet.</p>
          <p className="text-gray-600 mt-2">Once customers book your tour packages, they will appear here.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Package</th>
              <th className="py-3 px-4 text-left">Customer</th>
              <th className="py-3 px-4 text-left">Booking Date</th>
              <th className="py-3 px-4 text-left">Travel Date</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{booking.packageTitle}</div>
                </td>
                <td className="py-3 px-4">
                  {booking.customerName}
                  <div className="text-xs text-gray-500">{booking.numberOfPeople} people</div>
                </td>
                <td className="py-3 px-4">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {new Date(booking.startDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 font-medium">
                  ₹{booking.totalAmount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold 
                    ${booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                      disabled={booking.status === 'confirmed'}
                      className={`text-green-600 hover:text-green-900 ${booking.status === 'confirmed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Confirm"
                    >
                      <FaCheck />
                    </button>
                    <Link 
                      to={`/agent/booking-details/${booking._id}`} 
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaBriefcase className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Packages</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalPackages}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaCheck className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Active Packages</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activePackages}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaUser className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
              <FaDollarSign className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
              <p className="text-3xl font-bold text-amber-600">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgentProfile = () => {
    if (profileLoading) {
      return <div className="text-center py-4">Loading profile information...</div>;
    }
    
    if (!agentProfile) {
      return (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <FaExclamationTriangle className="inline mr-2" />
          Failed to load profile information
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{agentProfile.fullName}</h2>
              <p className="text-gray-600">{agentProfile.email}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/agent/edit-profile" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Edit Profile
              </Link>
            </div>
          </div>
          
          <hr className="my-6" />
          
          <h3 className="text-xl font-semibold mb-4">Agency Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-500 uppercase mb-1">Agency Name</h4>
              <p className="text-gray-800 font-medium">
                {agentProfile.agencyDetails?.name || 'Not provided'}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500 uppercase mb-1">Business Phone</h4>
              <p className="text-gray-800 font-medium">
                {agentProfile.agencyDetails?.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500 uppercase mb-1">Business Address</h4>
              <p className="text-gray-800 font-medium">
                {agentProfile.agencyDetails?.address || 'Not provided'}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500 uppercase mb-1">Business License</h4>
              <p className="text-gray-800 font-medium">
                {agentProfile.agencyDetails?.license || 'Not provided'}
              </p>
            </div>
          </div>
          
          <hr className="my-6" />
          
          <h3 className="text-xl font-semibold mb-4">Account Status</h3>
          <div className="flex items-center mb-6">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              agentProfile.agencyDetails?.verificationStatus === 'verified' 
                ? 'bg-green-500' 
                : agentProfile.agencyDetails?.verificationStatus === 'pending' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700">
              {agentProfile.agencyDetails?.verificationStatus === 'verified' 
                ? 'Verified Account' 
                : agentProfile.agencyDetails?.verificationStatus === 'pending' 
                  ? 'Pending Verification' 
                  : 'Verification Rejected'}
            </span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Account Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Packages</p>
                <p className="text-2xl font-bold">{stats.totalPackages}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Tours</p>
                <p className="text-2xl font-bold">{stats.activePackages}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Revenue</p>
                <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myPackages':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Tour Packages</h2>
              <Link 
                to="/agent/create-package" 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center font-semibold py-2 px-4 rounded"
              >
                <FaPlus className="mr-2" /> Create New Package
              </Link>
            </div>
            {renderPackagesList()}
          </>
        );
      case 'bookings':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bookings Management</h2>
            </div>
            {renderBookingsList()}
          </>
        );
      case 'profile':
        return (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Agent Profile</h2>
            </div>
            {renderAgentProfile()}
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tour Agent Dashboard</h1>
      
      {/* Verification Status Alert */}
      {renderVerificationStatus()}
      
      {/* Stats Cards */}
      {renderStats()}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'myPackages'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('myPackages')}
          >
            My Packages
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'bookings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </nav>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AgentDashboard; 