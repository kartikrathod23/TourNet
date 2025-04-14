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
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    roomType: 'single',
    price: {
      amount: 0,
      currency: 'INR'
    },
    capacity: {
      adults: 1,
      children: 0
    },
    amenities: [],
    description: '',
    isAvailable: true,
    isActive: true
  });
  const [addingRoom, setAddingRoom] = useState(false);
  const [addRoomSuccess, setAddRoomSuccess] = useState(false);
  const [addRoomError, setAddRoomError] = useState('');
  
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
      // For now, we'll use mock data with more diverse statuses
      
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
          numberOfGuests: 2,
          paymentStatus: 'paid',
          specialRequests: 'Early check-in requested'
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
          numberOfGuests: 3,
          paymentStatus: 'partial',
          specialRequests: 'Extra bed needed'
        },
        {
          _id: 'b3',
          roomNumber: '310',
          roomType: 'Single',
          guestName: 'David Chen',
          checkInDate: '2023-10-12',
          checkOutDate: '2023-10-14',
          totalAmount: 12000,
          status: 'completed',
          numberOfGuests: 1,
          paymentStatus: 'paid',
          specialRequests: ''
        },
        {
          _id: 'b4',
          roomNumber: '402',
          roomType: 'Family Suite',
          guestName: 'Priya Sharma',
          checkInDate: '2023-10-20',
          checkOutDate: '2023-10-26',
          totalAmount: 55000,
          status: 'pending',
          numberOfGuests: 4,
          paymentStatus: 'unpaid',
          specialRequests: 'Airport pickup required'
        },
        {
          _id: 'b5',
          roomNumber: '150',
          roomType: 'Deluxe',
          guestName: 'Michael Johnson',
          checkInDate: '2023-10-22',
          checkOutDate: '2023-10-24',
          totalAmount: 18000,
          status: 'cancelled',
          numberOfGuests: 2,
          paymentStatus: 'refunded',
          specialRequests: ''
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
  
  const handleRoomInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewRoom(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else if (type === 'checkbox') {
      setNewRoom(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'amenities') {
      // Handle amenities as an array
      const amenitiesArray = value.split(',').map(item => item.trim());
      setNewRoom(prev => ({
        ...prev,
        amenities: amenitiesArray
      }));
    } else {
      setNewRoom(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };
  
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setAddingRoom(true);
    setAddRoomSuccess(false);
    setAddRoomError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/hotel-rooms', newRoom, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Reset form
        setNewRoom({
          roomNumber: '',
          roomType: 'single',
          price: {
            amount: 0,
            currency: 'INR'
          },
          capacity: {
            adults: 1,
            children: 0
          },
          amenities: [],
          description: '',
          isAvailable: true,
          isActive: true
        });
        
        // Show success message
        setAddRoomSuccess(true);
        
        // Refresh rooms list
        fetchRooms();
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding room:', error);
      setAddRoomError(error.response?.data?.error || 'Failed to add room. Please try again.');
    } finally {
      setAddingRoom(false);
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
      return (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mx-auto mb-4"></div>
          <p>Loading bookings...</p>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div className="text-center py-10">
          <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
          <p className="text-gray-600">You don't have any bookings yet.</p>
        </div>
      );
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getPaymentStatusBadgeClass = (status) => {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800';
        case 'partial':
          return 'bg-yellow-100 text-yellow-800';
        case 'unpaid':
          return 'bg-red-100 text-red-800';
        case 'refunded':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="overflow-x-auto">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Booking Requests</h3>
          <div className="flex space-x-2">
            <button 
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => fetchBookings()}
            >
              Refresh
            </button>
            <select 
              className="bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 px-4 py-2"
              onChange={(e) => console.log('Filter by:', e.target.value)}
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">#{booking._id.slice(-4)}</div>
                    <div className="text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                    <div className="text-sm text-gray-500">Guests: {booking.numberOfGuests}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Room {booking.roomNumber}</div>
                    <div className="text-sm text-gray-500">{booking.roomType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">to {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{booking.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.specialRequests && (
                      <div className="mt-1 text-xs text-gray-500 italic">
                        Note: {booking.specialRequests}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                          className="text-green-600 hover:text-green-900 rounded-md px-2 py-1 bg-green-50 hover:bg-green-100"
                          title="Approve Booking"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900 rounded-md px-2 py-1 bg-red-50 hover:bg-red-100"
                          title="Reject Booking"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => alert(`View details for booking #${booking._id}`)}
                      className="text-blue-600 hover:text-blue-900 rounded-md px-2 py-1 bg-blue-50 hover:bg-blue-100"
                      title="View Booking Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderStats = () => {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {profileLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {hotelProfile?.name || 'Hotel'} Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your hotel, rooms, and bookings with ease.
              </p>
            </header>
            
            {renderVerificationStatus()}
            
            {/* Hotel Stats */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Rooms */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-full p-3 bg-blue-100">
                      <FaHotel className="text-blue-600 text-xl" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{stats.totalRooms}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Total Rooms</h3>
                  <p className="text-sm text-gray-500 mt-1">All rooms in your property</p>
                </div>
                
                {/* Available Rooms */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-full p-3 bg-green-100">
                      <FaBed className="text-green-600 text-xl" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{stats.availableRooms}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Available Rooms</h3>
                  <p className="text-sm text-gray-500 mt-1">Rooms ready for booking</p>
                </div>
                
                {/* Occupied Rooms */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-full p-3 bg-yellow-100">
                      <FaChartBar className="text-yellow-600 text-xl" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{stats.occupiedRooms}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Occupied Rooms</h3>
                  <p className="text-sm text-gray-500 mt-1">Currently booked rooms</p>
                </div>
                
                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-full p-3 bg-purple-100">
                      <FaDollarSign className="text-purple-600 text-xl" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">₹{stats.revenue.toLocaleString()}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
                  <p className="text-sm text-gray-500 mt-1">This month's earnings</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('myRooms')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'myRooms'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Rooms
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'bookings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'availability'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Room Availability
                </button>
                <button
                  onClick={() => setActiveTab('addRoom')}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'addRoom'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Add New Room
                </button>
              </nav>
            </div>
            
            {renderTabContent()}
          </>
        )}
      </div>
    );
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myRooms':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Rooms</h2>
              <button
                onClick={() => setActiveTab('addRoom')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              >
                <FaPlus className="mr-2" />
                Add New Room
              </button>
            </div>
            {renderRoomsList()}
          </div>
        );
      case 'addRoom':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Add New Room</h2>
              <p className="text-gray-600">Fill in the details below to add a new room to your hotel.</p>
            </div>
            {renderAddRoomForm()}
          </div>
        );
      case 'bookings':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Manage Bookings</h2>
            {renderBookingsList()}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Room Availability Calendar</h3>
              {renderCalendarView()}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Hotel Profile</h2>
            {renderHotelProfile()}
          </div>
        );
      case 'stats':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
            {renderStats()}
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">My Rooms</h2>
            {renderRoomsList()}
          </div>
        );
    }
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
  
  const renderCalendarView = () => {
    // Get current date and create a calendar for the current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create a calendar grid
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarDays = Array(firstDayOfMonth).fill(null).concat(days);
    
    // Group into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    // Fill the last week if needed
    const lastWeek = weeks[weeks.length - 1];
    if (lastWeek.length < 7) {
      weeks[weeks.length - 1] = lastWeek.concat(Array(7 - lastWeek.length).fill(null));
    }
    
    // Find which days have bookings (simplified for demo)
    const bookedDays = bookings.reduce((acc, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      
      // Only consider days in the current month
      if (checkIn.getMonth() === currentMonth || checkOut.getMonth() === currentMonth) {
        // Get all dates between check-in and check-out
        const dates = [];
        const currentDate = new Date(checkIn);
        
        while (currentDate <= checkOut) {
          if (currentDate.getMonth() === currentMonth) {
            dates.push(currentDate.getDate());
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Add to accumulator with booking status
        dates.forEach(date => {
          if (!acc[date]) acc[date] = [];
          acc[date].push({
            id: booking._id,
            status: booking.status,
            room: booking.roomNumber
          });
        });
      }
      
      return acc;
    }, {});
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const getDayClass = (day) => {
      if (!day) return 'opacity-0';
      
      const isToday = day === today.getDate() && currentMonth === today.getMonth();
      let classes = 'relative flex flex-col items-center justify-center h-12 rounded-lg ';
      
      if (isToday) {
        classes += 'border-2 border-blue-500 font-bold ';
      }
      
      if (bookedDays[day]) {
        const hasConfirmed = bookedDays[day].some(b => b.status === 'confirmed');
        const hasPending = bookedDays[day].some(b => b.status === 'pending');
        
        if (hasConfirmed) {
          classes += 'bg-green-100 hover:bg-green-200 ';
        } else if (hasPending) {
          classes += 'bg-yellow-100 hover:bg-yellow-200 ';
        }
      } else {
        classes += 'bg-white hover:bg-gray-100 ';
      }
      
      return classes;
    };
    
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Room Availability Calendar</h3>
          <div className="text-lg font-medium">
            {monthNames[currentMonth]} {currentYear}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-gray-500 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((day, i) => (
            <div 
              key={i} 
              className={getDayClass(day)}
              onClick={() => day && alert(`Manage bookings for ${monthNames[currentMonth]} ${day}, ${currentYear}`)}
            >
              {day && (
                <>
                  <span className="text-sm">{day}</span>
                  {bookedDays[day] && (
                    <div className="absolute bottom-1 flex space-x-0.5">
                      {bookedDays[day].length > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-800"></span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-100 rounded-full mr-1"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-yellow-100 rounded-full mr-1"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 border border-blue-500 rounded-full mr-1"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderAddRoomForm = () => {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Room</h3>
        </div>
        
        <form onSubmit={handleAddRoom} className="p-6">
          {addRoomSuccess && (
            <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">
              <FaCheck className="inline mr-2" />
              Room added successfully!
            </div>
          )}
          
          {addRoomError && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
              <FaExclamationTriangle className="inline mr-2" />
              {addRoomError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roomNumber"
                value={newRoom.roomNumber}
                onChange={handleRoomInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                name="roomType"
                value={newRoom.roomType}
                onChange={handleRoomInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="twin">Twin Room</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="family">Family Room</option>
                <option value="presidential">Presidential Suite</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (per night) <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="number"
                  name="price.amount"
                  value={newRoom.price.amount}
                  onChange={handleRoomInputChange}
                  required
                  min="0"
                  className="w-2/3 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  name="price.currency"
                  value={newRoom.price.currency}
                  onChange={handleRoomInputChange}
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Adults</label>
                  <input
                    type="number"
                    name="capacity.adults"
                    value={newRoom.capacity.adults}
                    onChange={handleRoomInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Children</label>
                  <input
                    type="number"
                    name="capacity.children"
                    value={newRoom.capacity.children}
                    onChange={handleRoomInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                name="amenities"
                value={newRoom.amenities.join(', ')}
                onChange={handleRoomInputChange}
                placeholder="Wi-Fi, TV, Air Conditioning, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newRoom.description}
                onChange={handleRoomInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={newRoom.isAvailable}
                onChange={handleRoomInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                Available for booking
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={newRoom.isActive}
                onChange={handleRoomInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active (visible to guests)
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={addingRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
            >
              {addingRoom ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Room...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Add Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotel Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/hotel/login');
              }}
              className="text-sm text-red-600 hover:text-red-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderStats()}
      </main>
    </div>
  );
};

export default HotelDashboard; 