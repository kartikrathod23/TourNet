import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaEye, FaExclamationTriangle, FaCheck, FaHotel, FaBed, FaChartBar, FaDollarSign, FaExclamationCircle, FaCheckCircle, FaClock } from 'react-icons/fa';

const HotelDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('myRooms');
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    revenue: 0
  });
  const [hotelProfile, setHotelProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/hotel/login');
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/hotel-auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Set hotel profile data
        setHotelProfile(response.data.data);
        setProfileLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/hotel/login');
      }
    };
    
    checkAuth();
    fetchRooms();
    fetchStats();
    fetchBookings();
  }, [navigate]);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/hotel-rooms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRooms(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch your rooms. Please try again.');
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      // In a real application, you would have a dedicated API for stats
      // For now, we'll calculate based on rooms data
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hotel-rooms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const roomsData = response.data.data;
      const availableRooms = roomsData.filter(room => room.isAvailable).length;
      const occupiedRooms = roomsData.length - availableRooms;
      
      // This would be a separate API call in a real implementation for bookings
      const mockRevenue = Math.floor(Math.random() * 100000) + 50000;
      
      setStats({
        totalRooms: roomsData.length,
        availableRooms,
        occupiedRooms,
        revenue: mockRevenue
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error for stats, just log it
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      
      // In a real application, you would fetch actual booking data
      // For now, we'll use mock data
      
      // Mock booking data
      const mockBookings = [
        {
          _id: 'b1',
          roomNumber: '101',
          roomType: 'Deluxe',
          guestName: 'John Smith',
          checkInDate: '2023-10-15',
          checkOutDate: '2023-10-20',
          totalAmount: 25000,
          status: 'confirmed',
          numberOfGuests: 2
        },
        {
          _id: 'b2',
          roomNumber: '205',
          roomType: 'Suite',
          guestName: 'Emma Watson',
          checkInDate: '2023-10-18',
          checkOutDate: '2023-10-25',
          totalAmount: 42000,
          status: 'pending',
          numberOfGuests: 3
        }
      ];
      
      setBookings(mockBookings);
      setBookingsLoading(false);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setBookingsLoading(false);
    }
  };
  
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/hotel-rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh rooms
      setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      alert('Room deleted successfully');
      
      // Update stats
      fetchStats();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room. Please try again.');
    }
  };
  
  const handleToggleAvailability = async (roomId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/hotel-rooms/${roomId}`, 
        { isAvailable: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room._id === roomId ? { ...room, isAvailable: !currentStatus } : room
        )
      );
      
      // Update stats
      fetchStats();
    } catch (error) {
      console.error('Error toggling room availability:', error);
      alert('Failed to update room availability. Please try again.');
    }
  };
  
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      // In a real application, you would call an API to update the booking status
      // For now, we'll just update the local state
      
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
    if (profileLoading || !hotelProfile) {
      return <div>Loading verification status...</div>;
    }

    const verificationStatus = hotelProfile.verificationStatus || 'pending';
    
    return (
      <div className="mb-6 p-4 rounded-lg border">
        <h3 className="text-xl font-semibold mb-2">Hotel Verification Status</h3>
        
        {verificationStatus === 'pending' && (
          <div className="flex items-center text-yellow-600">
            <FaClock className="mr-2" />
            <span>Your hotel account is pending verification. You can still manage your rooms, but they might have limited visibility until your account is verified.</span>
          </div>
        )}
        
        {verificationStatus === 'verified' && (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" />
            <span>Your hotel account is verified! You have full access to all features.</span>
          </div>
        )}
        
        {verificationStatus === 'rejected' && (
          <div className="flex items-center text-red-600">
            <FaExclamationCircle className="mr-2" />
            <span>Your hotel verification was rejected. Please update your details and contact support for assistance.</span>
          </div>
        )}
        
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            Hotel Name: <span className="font-medium">{hotelProfile.name || 'Not provided'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Address: <span className="font-medium">{hotelProfile.address?.city || 'Not provided'}, {hotelProfile.address?.country || ''}</span>
          </p>
          <p className="text-sm text-gray-600">
            Star Rating: <span className="font-medium">{hotelProfile.starRating || 'Not provided'} ⭐</span>
          </p>
        </div>
      </div>
    );
  };
  
  const renderRoomsList = () => {
    if (loading) {
      return <div className="text-center py-4">Loading your rooms...</div>;
    }
    
    if (error) {
      return (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <FaExclamationTriangle className="inline mr-2" />
          {error}
        </div>
      );
    }
    
    if (rooms.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't added any rooms yet.</p>
          <Link 
            to="/hotel/add-room" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Add Your First Room
          </Link>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Room Number</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Capacity</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map(room => (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{room.roomNumber}</div>
                </td>
                <td className="py-3 px-4">
                  {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
                </td>
                <td className="py-3 px-4">
                  {room.capacity.adults} Adults, {room.capacity.children} Children
                </td>
                <td className="py-3 px-4">
                  {room.price.currency} {room.price.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold 
                    ${room.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}`}
                  >
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/hotel/room/${room._id}`} 
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View"
                    >
                      <FaEye />
                    </Link>
                    <Link 
                      to={`/hotel/edit-room/${room._id}`} 
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleToggleAvailability(room._id, room.isAvailable)}
                      className={`${room.isAvailable ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                      title={room.isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
                    >
                      {room.isAvailable ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
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
          <p className="text-gray-600 mt-2">Once guests book your rooms, they will appear here.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Room</th>
              <th className="py-3 px-4 text-left">Guest</th>
              <th className="py-3 px-4 text-left">Check-in</th>
              <th className="py-3 px-4 text-left">Check-out</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{booking.roomNumber}</div>
                  <div className="text-xs text-gray-500">{booking.roomType}</div>
                </td>
                <td className="py-3 px-4">
                  {booking.guestName}
                  <div className="text-xs text-gray-500">{booking.numberOfGuests} guests</div>
                </td>
                <td className="py-3 px-4">
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
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
                      to={`/hotel/booking-details/${booking._id}`} 
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
              <FaHotel size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Rooms</p>
              <p className="text-2xl font-bold">{stats.totalRooms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaBed size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Available Rooms</p>
              <p className="text-2xl font-bold">{stats.availableRooms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <FaChartBar size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Occupied Rooms</p>
              <p className="text-2xl font-bold">{stats.occupiedRooms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaDollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderHotelProfile = () => {
    if (profileLoading || !hotelProfile) {
      return <div className="text-center py-4">Loading profile...</div>;
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold">Hotel Profile</h3>
          <Link 
            to="/hotel/edit-profile" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Edit Profile
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Hotel Name</p>
              <p className="font-medium">{hotelProfile.name}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="font-medium">{hotelProfile.email}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Phone Number</p>
              <p className="font-medium">{hotelProfile.phone || 'Not provided'}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Star Rating</p>
              <p className="font-medium">{hotelProfile.starRating} ⭐</p>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Address</p>
              <p className="font-medium">
                {hotelProfile.address?.street}, {hotelProfile.address?.city}, {hotelProfile.address?.state}, {hotelProfile.address?.country} - {hotelProfile.address?.postalCode}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Verification Status</p>
              <p className={`font-medium ${
                hotelProfile.verificationStatus === 'verified'
                  ? 'text-green-600'
                  : hotelProfile.verificationStatus === 'rejected'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}>
                {hotelProfile.verificationStatus.charAt(0).toUpperCase() + hotelProfile.verificationStatus.slice(1)}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm">License Number</p>
              <p className="font-medium">{hotelProfile.licenseNumber || 'Not provided'}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Joined On</p>
              <p className="font-medium">
                {new Date(hotelProfile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-500 text-sm mb-2">Description</p>
          <p className="text-gray-700">{hotelProfile.description || 'No description provided.'}</p>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-500 text-sm mb-2">Amenities</p>
          {hotelProfile.amenities && hotelProfile.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {hotelProfile.amenities.map((amenity, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">No amenities listed.</p>
          )}
        </div>
        
        <div className="mt-6">
          <p className="text-gray-500 text-sm mb-2">Hotel Policies</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700 text-sm">Check-in Time: <span className="font-medium">{hotelProfile.policies?.checkInTime || 'Not specified'}</span></p>
            </div>
            <div>
              <p className="text-gray-700 text-sm">Check-out Time: <span className="font-medium">{hotelProfile.policies?.checkOutTime || 'Not specified'}</span></p>
            </div>
            <div>
              <p className="text-gray-700 text-sm">Pets Allowed: <span className="font-medium">{hotelProfile.policies?.petsAllowed ? 'Yes' : 'No'}</span></p>
            </div>
            <div>
              <p className="text-gray-700 text-sm">Cancellation Policy: <span className="font-medium">{hotelProfile.policies?.cancellationPolicy || 'Not specified'}</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myRooms':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Rooms</h2>
              <Link 
                to="/hotel/add-room" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Room
              </Link>
            </div>
            {renderRoomsList()}
          </div>
        );
      
      case 'bookings':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Bookings</h2>
            {renderBookingsList()}
          </div>
        );
      
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Hotel Profile</h2>
            {renderHotelProfile()}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotel Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/hotel/login');
              }}
              className="text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Verification Status Banner */}
        {renderVerificationStatus()}
        
        {/* Stats */}
        {renderStats()}
        
        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'myRooms'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('myRooms')}
            >
              My Rooms
            </button>
            
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings
            </button>
            
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Hotel Profile
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default HotelDashboard; 