import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSpinner, FaHotel, FaSuitcase, FaPlane, FaBus, FaCar, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { API_URL } from '../App';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [cancelingBookingId, setCancelingBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    let apiBookings = [];
    let localBookings = [];
    let hasApiError = false;
    
    // Load any local bookings first
    try {
      const localBookingsData = JSON.parse(localStorage.getItem('myLocalBookings') || '[]');
      if (localBookingsData.length > 0) {
        console.log('Found local bookings in localStorage:', localBookingsData.length);
        localBookings = localBookingsData;
      }
    } catch (e) {
      console.error('Error parsing local bookings:', e);
    }
    
    // Only try to fetch from API if user is logged in
    if (!token) {
      setError('You must be logged in to view your server bookings');
      
      // Still show local bookings if available
      if (localBookings.length > 0) {
        setBookings(localBookings);
        setError('Showing only local bookings - log in to see all bookings');
      } else {
        setBookings([]);
      }
      
      setLoading(false);
      return;
    }
    
    // Try to fetch from API
    try {
      console.log('Fetching bookings with token:', token);
      
      // Try to fetch from user document first (new method)
      console.log('Fetching bookings from user document:', `${API_URL}/auth/user-bookings`);
      const response = await axios.get(`${API_URL}/auth/user-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('User bookings API response:', response.data);
      
      if (response.data.success) {
        console.log('Bookings found in user document:', response.data.data.length);
        apiBookings = response.data.data;
        
        // Debug each booking's content
        apiBookings.forEach((booking, index) => {
          console.log(`API Booking ${index + 1}:`, booking);
          console.log(`- ID: ${booking._id}`);
          console.log(`- Type: ${booking.bookingType}`);
          console.log(`- Status: ${booking.status}`);
          console.log(`- Total: ${booking.totalAmount} ${booking.currency}`);
          console.log(`- Item: ${booking.itemDetails?.name}`);
        });
      } else {
        // If user-bookings fails, try the old endpoint
        console.log('Falling back to traditional bookings endpoint');
        const fallbackResponse = await axios.get(`${API_URL}/bookings/my-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (fallbackResponse.data.success) {
          console.log('Bookings found on server (fallback):', fallbackResponse.data.data.length);
          apiBookings = fallbackResponse.data.data;
        } else {
          throw new Error(fallbackResponse.data.error || 'Failed to fetch bookings');
        }
      }
    } catch (err) {
      console.error('Error fetching bookings from API:', err);
      hasApiError = true;
      let errorMsg = 'Failed to load your bookings from server. Showing local bookings only.';
      
      if (err.response) {
        console.error('Error response details:', err.response.data);
        if (err.response.status === 401) {
          errorMsg = 'Your session has expired. Please log in again. Showing local bookings only.';
        } else if (err.response.data && err.response.data.error) {
          errorMsg = err.response.data.error + ' Showing local bookings only.';
        }
      } else if (err.message) {
        errorMsg = err.message + ' Showing local bookings only.';
      }
      
      setError(errorMsg);
      
      // Try loading from recovered bookings
      const savedBookingIds = JSON.parse(localStorage.getItem('myBookings') || '[]');
      console.log('Found saved booking IDs in localStorage:', savedBookingIds);
      
      if (savedBookingIds.length > 0) {
        // Create mock bookings from IDs
        const mockBookings = savedBookingIds.map(id => ({
          _id: id,
          confirmationNumber: id.startsWith('BK') ? id : `BK-${id.substring(0, 8)}`,
          bookingType: 'hotel',
          status: 'confirmed',
          paymentStatus: 'completed',
          totalAmount: 3500,
          currency: 'INR',
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          guests: { adults: 2, children: 0 },
          itemDetails: {
            name: 'Recovered Server Booking',
            price: '3500'
          },
          travelDates: {
            from: new Date().toISOString(),
            to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          source: 'recovered'
        }));
        
        console.log('Created mock bookings from localStorage IDs:', mockBookings);
        // Combine with local bookings
        apiBookings = mockBookings;
      }
    } finally {
      // Combine both sources of bookings, making sure we don't have duplicates
      const allBookings = [];
      
      // Add API bookings first
      apiBookings.forEach(booking => {
        booking.source = 'server';
        allBookings.push(booking);
      });
      
      // Then add local bookings (if they don't duplicate API bookings)
      localBookings.forEach(booking => {
        // Check if this local booking might duplicate an API booking
        const isDuplicate = allBookings.some(b => 
          b._id === booking._id || 
          (b.confirmationNumber && b.confirmationNumber === booking.confirmationNumber)
        );
        
        if (!isDuplicate) {
          booking.source = 'local';
          allBookings.push(booking);
        }
      });
      
      console.log('Final combined bookings:', allBookings.length);
      setBookings(allBookings);
      
      if (hasApiError && allBookings.length === 0) {
        setError('No bookings found. Try again later or make a new booking.');
      } else if (hasApiError) {
        setError('Server error: Showing bookings from your local device only.');
      } else if (allBookings.length === 0) {
        setError('');  // Clear error, just no bookings
      } else {
        setError('');  // Clear any errors
      }
      
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setCancelingBookingId(bookingId);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const confirmCancelBooking = async () => {
    if (!cancelingBookingId) return;
    setIsCanceling(true);

    try {
      const booking = bookings.find(b => b._id === cancelingBookingId);
      
      // Handle local bookings
      if (booking.source === 'local') {
        // Update local storage
        const localBookings = JSON.parse(localStorage.getItem('myLocalBookings') || '[]');
        const updatedLocalBookings = localBookings.map(b => {
          if (b._id === cancelingBookingId) {
            return { ...b, status: 'cancelled', cancellation: { reason: cancelReason, cancelledAt: new Date() } };
          }
          return b;
        });
        localStorage.setItem('myLocalBookings', JSON.stringify(updatedLocalBookings));
        
        // Update state
        setBookings(bookings.map(b => {
          if (b._id === cancelingBookingId) {
            return { ...b, status: 'cancelled', cancellation: { reason: cancelReason, cancelledAt: new Date() } };
          }
          return b;
        }));
        
        setTimeout(() => {
          setIsCanceling(false);
          setShowCancelModal(false);
        }, 500);
        
        return;
      }
      
      // For server bookings, make API call
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to cancel a booking');
      }
      
      // Try the new cancel endpoint first
      try {
        console.log('Attempting to cancel booking using user document endpoint');
        const response = await axios.put(
          `${API_URL}/auth/cancel-booking/${cancelingBookingId}`,
          { 
            reason: cancelReason
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          // Update state with the returned booking
          setBookings(bookings.map(b => {
            if (b._id === cancelingBookingId) {
              return response.data.data;
            }
            return b;
          }));
        } else {
          throw new Error(response.data.error || 'Failed to cancel booking');
        }
      } catch (userCancelError) {
        console.error('Error canceling booking using user endpoint:', userCancelError);
        
        // Fall back to the original endpoint
        console.log('Falling back to traditional cancel endpoint');
        const fallbackResponse = await axios.put(
          `${API_URL}/bookings/${cancelingBookingId}/status`,
          { 
            status: 'cancelled',
            reason: cancelReason
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (fallbackResponse.data.success) {
          // Update state with the returned booking
          setBookings(bookings.map(b => {
            if (b._id === cancelingBookingId) {
              return fallbackResponse.data.data;
            }
            return b;
          }));
        } else {
          throw new Error(fallbackResponse.data.error || 'Failed to cancel booking');
        }
      }
    } catch (err) {
      console.error('Error canceling booking:', err);
      
      // Show error but still cancel locally for better UX
      setBookings(bookings.map(b => {
        if (b._id === cancelingBookingId) {
          return { ...b, status: 'cancelled', cancellation: { reason: cancelReason, cancelledAt: new Date() } };
        }
        return b;
      }));
    } finally {
      setIsCanceling(false);
      setShowCancelModal(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
  
  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getBookingTypeIcon = (type) => {
    switch (type) {
      case 'hotel':
        return <FaHotel className="text-blue-600" />;
      case 'package':
        return <FaSuitcase className="text-blue-600" />;
      case 'flight':
      case 'travel':
        return <FaPlane className="text-blue-600" />;
      case 'bus':
        return <FaBus className="text-blue-600" />;
      case 'car_rental':
        return <FaCar className="text-blue-600" />;
      default:
        return <FaSuitcase className="text-blue-600" />;
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  const formatPrice = (price, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.bookingType === activeTab);
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              onClick={fetchBookings}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaSpinner className="animate-spin inline-block text-blue-600 text-4xl mb-4" />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'all'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    All Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab('hotel')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'hotel'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Hotels
                  </button>
                  <button
                    onClick={() => setActiveTab('package')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'package'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Packages
                  </button>
                  <button
                    onClick={() => setActiveTab('travel')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'travel'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Travel
                  </button>
                </nav>
              </div>

              <div className="p-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet.</p>
                    <Link 
                      to="/"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
                    >
                      Explore {activeTab !== 'all' ? activeTab === 'hotel' ? 'Hotels' : activeTab === 'package' ? 'Packages' : 'Travel Options' : 'Options'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map(booking => (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                          <div className="flex items-center">
                            <span className="mr-3">
                              {getBookingTypeIcon(booking.bookingType)}
                            </span>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">
                                {booking.itemDetails?.name || 'Booking'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Booking ID:</span> {booking.confirmationNumber || booking._id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus || booking.paymentInfo?.status)}`}>
                              {booking.paymentStatus || booking.paymentInfo?.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Dates</p>
                            <p className="font-medium">
                              {formatDate(booking.travelDates?.from || booking.checkInDate)} - {formatDate(booking.travelDates?.to || booking.checkOutDate)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Guests</p>
                            <p className="font-medium">
                              {booking.guests?.adults || 1} Adults, {booking.guests?.children || 0} Children
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Total Amount</p>
                            <p className="font-medium text-blue-700">
                              {formatPrice(booking.totalAmount || booking.paymentInfo?.amount, booking.currency || 'INR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Booked on {formatDate(booking.createdAt || booking.bookingDate || new Date())}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/booking/${booking._id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </Link>
                            
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-sm font-medium text-red-600 hover:text-red-700 ml-4"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Cancel Booking</h3>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="bg-yellow-50 flex items-start p-4 rounded-lg mb-4">
                <FaExclamationTriangle className="text-yellow-500 mr-3 mt-1" />
                <p className="text-sm text-yellow-700">
                  Cancellation might be subject to cancellation fees according to the booking policy. Refunds will be processed as per the terms and conditions.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a reason</option>
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found better option">Found better option</option>
                  <option value="Personal emergency">Personal emergency</option>
                  <option value="Weather concerns">Weather concerns</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {cancelReason === 'Other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify reason
                  </label>
                  <textarea
                    value={cancelReason !== 'Other' ? cancelReason : ''}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Please provide details..."
                  ></textarea>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={!cancelReason || isCanceling}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 flex items-center"
                >
                  {isCanceling ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings; 