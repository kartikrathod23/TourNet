import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch bookings when component mounts
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/bookings');
      setBookings(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`);
      // Refresh the bookings list
      fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">You don't have any bookings yet.</p>
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Find Your Next Destination
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.bookingId} 
                className={`bg-white p-6 rounded-lg shadow-md 
                  ${booking.status === 'cancelled' ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between flex-wrap">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {booking.itemName}
                      {booking.status === 'cancelled' && (
                        <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      <span className="font-medium">Booking ID:</span> {booking.bookingId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Booked on:</span> {formatDate(booking.bookingDate)}
                    </p>
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelBooking(booking.bookingId)}
                        className="mt-2 text-red-600 text-sm hover:text-red-800 transition"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Name:</span> {booking.firstName} {booking.lastName}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {booking.email}
                      </p>
                      {booking.phone && (
                        <p className="text-gray-600">
                          <span className="font-medium">Phone:</span> {booking.phone}
                        </p>
                      )}
                    </div>

                    {booking.dateFrom && booking.dateTo && (
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Check-in:</span> {formatDate(booking.dateFrom)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Check-out:</span> {formatDate(booking.dateTo)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Guests:</span> {booking.guests}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Type:</span> {booking.itemType}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Price:</span> {booking.itemPrice}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Payment:</span> {booking.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings; 