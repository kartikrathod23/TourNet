import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../App';
import { FaSpinner } from 'react-icons/fa';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to view your booking history');
        setLoading(false);
        return;
      }
      
      console.log('Starting booking history fetch...');
      let userBookings = [];
      let hasBookingError = false;
      
      // First, try to fetch bookings from multiple sources
      try {
        // Try traditional bookings endpoint first (most reliable)
        console.log('Fetching from main bookings API');
        const mainResponse = await axios.get(`${API_URL}/bookings/my-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (mainResponse.data.success) {
          userBookings = mainResponse.data.data || [];
          console.log(`Found ${userBookings.length} bookings in main API`);
          
          // If we have bookings, no need to continue checking other sources
          if (userBookings.length > 0) {
            setBookings(userBookings);
            setError('');
          } else {
            // Try user document fallback
            throw new Error('No bookings found in main API');
          }
        } else {
          throw new Error(mainResponse.data.error || 'Failed to fetch bookings from main API');
        }
      } catch (mainApiError) {
        console.error('Error fetching from main API:', mainApiError);
        
        // Fallback to user document API
        try {
          console.log('Falling back to user document API');
          
          const userResponse = await axios.get(`${API_URL}/auth/user-bookings`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (userResponse.data.success) {
            userBookings = userResponse.data.data || [];
            console.log(`Found ${userBookings.length} bookings in user document`);
            
            if (userBookings.length > 0) {
              setBookings(userBookings);
              setError('');
            } else {
              throw new Error('No bookings found in user document');
            }
          } else {
            throw new Error(userResponse.data.error || 'Failed to fetch bookings from user document');
          }
        } catch (userApiError) {
          console.error('Error fetching from user document:', userApiError);
          hasBookingError = true;
          
          // Try loading from localStorage as a last resort
          const localBookings = JSON.parse(localStorage.getItem('myLocalBookings') || '[]');
          
          if (localBookings.length > 0) {
            console.log('Using local bookings from localStorage:', localBookings.length);
            setBookings(localBookings);
            setError('Unable to connect to server. Showing locally saved bookings only.');
          } else {
            const savedBookingIds = JSON.parse(localStorage.getItem('myBookings') || '[]');
            
            if (savedBookingIds.length > 0) {
              // Create placeholder bookings from IDs
              const placeholderBookings = savedBookingIds.map(id => ({
                _id: id,
                confirmationNumber: id.substring(0, 10),
                status: 'confirmed',
                paymentStatus: 'completed',
                bookingType: 'hotel',
                itemDetails: { name: 'Placeholder Booking' },
                createdAt: new Date().toISOString()
              }));
              
              console.log('Created placeholder bookings from IDs:', placeholderBookings.length);
              setBookings(placeholderBookings);
              setError('Limited booking data available. Please refresh or try again later.');
            } else {
              setError('Failed to load your booking history. Please try again later.');
              setBookings([]);
            }
          }
        }
      }
      
      // Sort bookings by date (most recent first)
      if (userBookings.length > 0) {
        userBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.bookingDate || 0);
          const dateB = new Date(b.createdAt || b.bookingDate || 0);
          return dateB - dateA;
        });
      }
      
      // Fetch payments (optional - can fail gracefully)
      try {
        const paymentsResponse = await axios.get(`${API_URL}/payments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setPayments(paymentsResponse.data?.data || []);
        console.log(`Found ${paymentsResponse.data?.data?.length || 0} payments`);
      } catch (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        setPayments([]);
        // Don't set error for payments - let the bookings still show
      }
    } catch (err) {
      console.error('Global error in fetchData:', err);
      setError('Failed to load your booking history. Please try again later.');
      setBookings([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to cancel a booking');
        return;
      }
      
      // Try new cancel endpoint first
      try {
        await axios.put(`${API_URL}/auth/cancel-booking/${bookingId}`, 
          { reason: 'User requested cancellation' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (userCancelError) {
        console.error('User document cancel failed, trying fallback:', userCancelError);
        
        // Fall back to original endpoint
        await axios.put(`${API_URL}/bookings/${bookingId}/status`, 
          { 
            status: 'cancelled',
            reason: 'User requested cancellation'
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Refresh the data
      fetchData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const downloadInvoice = (paymentId) => {
    alert(`Invoice download for payment ${paymentId} would start here.`);
    // Actual implementation would connect to a payment API
  };

  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) 
      ? date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : 'N/A';
  };

  // Helper to handle different booking types and formats
  const getBookingDetails = (booking) => {
    // Normalize booking object to handle different formats
    return {
      id: booking._id || booking.id || '',
      confirmationNumber: booking.confirmationNumber || '',
      bookingType: booking.bookingType || 'tour',
      itemName: booking.itemDetails?.name || booking.item?.name || booking.name || 'Unknown',
      itemImage: booking.itemDetails?.image || booking.item?.image || booking.image || '/default-placeholder.jpg',
      price: booking.totalAmount || booking.price || 0,
      currency: booking.currency || 'USD',
      checkInDate: booking.checkInDate || booking.dateFrom || booking.travelDates?.start,
      checkOutDate: booking.checkOutDate || booking.dateTo || booking.travelDates?.end,
      status: booking.status || 'confirmed',
      guests: booking.guests || { adults: 1, children: 0 },
      createdAt: booking.bookingDate || booking.createdAt,
      hotel: booking.hotel || booking.itemDetails?.hotel || null,
      paymentStatus: booking.paymentInfo?.status || 'completed',
      canCancel: ['confirmed', 'pending'].includes(booking.status || 'confirmed')
    };
  };

  // Get appropriate status badge color class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
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

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    const bookingStatus = booking.status?.toLowerCase() || 'confirmed';
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['confirmed', 'pending'].includes(bookingStatus);
    if (filter === 'completed') return bookingStatus === 'completed';
    if (filter === 'cancelled') return bookingStatus === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Travel History</h2>
            <p className="text-gray-600">View and manage your bookings and payments</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm font-medium transition">
                Book New Trip
              </button>
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button 
              className="ml-2 underline" 
              onClick={() => setError('')}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 font-medium ${activeTab === 'bookings' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings
            </button>
            <button
              className={`py-4 px-1 font-medium ${activeTab === 'payments' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Filters (only for bookings tab) */}
        {activeTab === 'bookings' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              className={`px-4 py-2 rounded-md ${filter === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilter('all')}
            >
              All Bookings
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${filter === 'upcoming' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${filter === 'completed' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${filter === 'cancelled' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled/Refunded
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'bookings' ? (
          // Bookings Tab Content
          filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {filter !== 'all' 
                  ? `You don't have any ${filter} bookings.` 
                  : "You haven't made any bookings yet."}
              </p>
              <Link to="/dashboard">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                  Start Planning Your Trip
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredBookings.map((originalBooking) => {
                // Normalize booking to handle different formats
                const booking = getBookingDetails(originalBooking);
                
                return (
                  <div 
                    key={booking.id || Math.random().toString()} 
                    className={`bg-white p-6 rounded-lg shadow-md border-l-4 
                      ${booking.status === 'cancelled' || booking.status === 'refunded'
                        ? 'border-red-500' 
                        : booking.status === 'completed'
                          ? 'border-green-500'
                          : 'border-blue-500'}`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-gray-800 mr-3">
                            {booking.itemName}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Booking ID:</span> {booking.confirmationNumber || booking.id?.substring(0, 8)}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Booked on:</span> {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className="text-lg font-bold text-blue-700 mb-2">
                          {booking.price 
                            ? `${booking.currency} ${booking.price.toFixed(2)}` 
                            : 'Price not available'}
                        </p>
                        <div className="flex space-x-3">
                          {/* Only show cancel button for bookings that can be cancelled */}
                          {booking.canCancel && (
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="text-red-600 text-sm font-medium hover:text-red-800 transition"
                            >
                              Cancel Booking
                            </button>
                          )}
                          
                          {/* View Details button would link to a detailed booking page */}
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-1 rounded-md transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left column: details */}
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Dates:</span> {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Guests:</span> {booking.guests.adults} Adults
                            {booking.guests.children > 0 && `, ${booking.guests.children} Children`}
                          </p>
                          {booking.hotel && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {booking.hotel.location || booking.hotel.address?.city || 'N/A'}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Booked on:</span> {formatDate(booking.createdAt)}
                          </p>
                        </div>
                        
                        {/* Right column: payment details */}
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Type:</span> {booking.bookingType?.charAt(0).toUpperCase() + booking.bookingType?.slice(1) || 'Tour'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Payment:</span> {booking.price ? `${booking.currency} ${booking.price.toFixed(2)}` : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Payment Status:</span> 
                            <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                              booking.paymentStatus === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : booking.paymentStatus === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Payments Tab Content
          <>
            {payments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No payment history</h3>
                <p className="text-gray-600 mb-6">You haven't made any payments yet.</p>
                <Link to="/dashboard">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                    Start Planning Your Trip
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.transactionId || payment._id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.paymentDate || payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.booking ? (
                            <Link to={`/bookings/${payment.booking}`} className="text-blue-600 hover:text-blue-800">
                              View Booking
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.currency || 'USD'} {payment.amount?.toFixed(2) || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'completed' || payment.status === 'succeeded'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => downloadInvoice(payment._id)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Invoice
                            </button>
                            {payment.receiptUrl && (
                              <a
                                href={payment.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Receipt
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingHistory; 