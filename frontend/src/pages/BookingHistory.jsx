import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      
      // Fetch bookings
      const bookingsResponse = await axios.get('http://localhost:5000/api/bookings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Fetch payments
      const paymentsResponse = await axios.get('http://localhost:5000/api/payments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setBookings(bookingsResponse.data);
      setPayments(paymentsResponse.data?.data || []);
      
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load your booking history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh the data
      fetchData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const downloadInvoice = async (paymentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/payments/${paymentId}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice. Please try again.');
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter bookings based on selected filter
  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    
    return bookings.filter(booking => {
      switch (filter) {
        case 'upcoming':
          return ['pending', 'confirmed', 'paid'].includes(booking.status);
        case 'completed':
          return booking.status === 'completed';
        case 'cancelled':
          return ['cancelled', 'refunded'].includes(booking.status);
        default:
          return true;
      }
    });
  };

  // Status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          getFilteredBookings().length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
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
              {getFilteredBookings().map((booking) => (
                <div 
                  key={booking._id || booking.bookingId} 
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
                          {booking.hotel?.name || booking.itemName || 'Booking'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Booking ID:</span> {booking._id || booking.bookingId}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Booked on:</span> {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <p className="text-lg font-bold text-blue-700 mb-2">
                        {booking.totalAmount 
                          ? `${booking.currency || 'USD'} ${booking.totalAmount.toFixed(2)}` 
                          : booking.itemPrice || 'Price not available'}
                      </p>
                      <div className="flex space-x-3">
                        {/* Only show cancel button for bookings that can be cancelled */}
                        {['pending', 'confirmed', 'paid'].includes(booking.status) && (
                          <button
                            onClick={() => cancelBooking(booking._id || booking.bookingId)}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Booking details */}
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Dates:</span> {formatDate(booking.checkInDate || booking.dateFrom)} - {formatDate(booking.checkOutDate || booking.dateTo)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Guests:</span> {booking.guests?.adults || booking.guests || '1'} Adults
                          {(booking.guests?.children > 0) && `, ${booking.guests.children} Children`}
                        </p>
                      </div>

                      {/* Hotel/Room details if available */}
                      {booking.hotel && (
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Hotel:</span> {booking.hotel.name}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Nights:</span> {booking.nights || '1'}
                          </p>
                        </div>
                      )}

                      {/* Activities if available */}
                      {booking.activities && booking.activities.length > 0 && (
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Activities:</span> {booking.activities.length}
                          </p>
                          <p className="text-gray-600 truncate">
                            <span className="font-medium">Includes:</span> {booking.activities.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Transportation if available */}
                      {booking.transportation && (
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Transportation:</span> {booking.transportation.type}
                          </p>
                          {booking.transportation.details && (
                            <p className="text-gray-600">
                              <span className="font-medium">Details:</span> {booking.transportation.details}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Payments Tab Content
          payments.length === 0 ? (
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.booking ? (
                          <Link 
                            to="#" 
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Booking
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                          {payment.status.replace('_', ' ').charAt(0).toUpperCase() + payment.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => downloadInvoice(payment.id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline mr-3"
                        >
                          Download Invoice
                        </button>
                        {payment.receiptUrl && (
                          <a 
                            href={payment.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Receipt
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BookingHistory; 