import React, { useState } from 'react';
import axios from 'axios';

const BookingModal = ({ item, type, isOpen, onClose }) => {
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'credit',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: 2,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [bookingError, setBookingError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setBookingError('');

    try {
      // Prepare the booking data
      const bookingData = {
        ...bookingDetails,
        itemId: item.id || item._id || `${type}-${Date.now()}`,
        itemName: getItemName(),
        itemPrice: getItemPrice(),
        itemType: type,
        itemDetails: { ...item }
      };

      // Send to the API
      const response = await axios.post('http://localhost:5000/api/bookings', bookingData);
      
      if (response.data && response.data.confirmationNumber) {
        setConfirmationNumber(response.data.confirmationNumber);
        setBookingStep(2);
      } else {
        throw new Error('No confirmation received from server');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.error || 'Failed to complete booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getItemName = () => {
    if (!item) return '';
    return item.highlighted_name || item.name;
  };

  const getItemPrice = () => {
    if (!item) return '';
    
    if (type === 'hotel') {
      return '₹5,999 per night';
    } else if (type === 'travel') {
      return `${item.currency} ${item.price} ${item.unit}`;
    } else {
      return `₹${item.price}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-blue-700">
              {bookingStep === 1 ? 'Complete Your Booking' : 'Booking Confirmed!'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          {bookingStep === 1 ? (
            <div className="mt-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-700 mb-2">Booking Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Item:</p>
                    <p className="font-medium">{getItemName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price:</p>
                    <p className="font-medium">{getItemPrice()}</p>
                  </div>
                </div>
              </div>

              {bookingError && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                      First Name
                    </label>
                    <input 
                      id="firstName"
                      name="firstName"
                      type="text" 
                      value={bookingDetails.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                      Last Name
                    </label>
                    <input 
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={bookingDetails.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email
                    </label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      value={bookingDetails.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      Phone
                    </label>
                    <input 
                      id="phone"
                      name="phone"
                      type="tel"
                      value={bookingDetails.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                {type === 'hotel' || type === 'package' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dateFrom">
                        Check-in Date
                      </label>
                      <input 
                        id="dateFrom"
                        name="dateFrom"
                        type="date" 
                        value={bookingDetails.dateFrom}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dateTo">
                        Check-out Date
                      </label>
                      <input 
                        id="dateTo"
                        name="dateTo"
                        type="date"
                        value={bookingDetails.dateTo}
                        onChange={handleInputChange}
                        min={bookingDetails.dateFrom}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="guests">
                    Number of {type === 'travel' ? 'Passengers' : 'Guests'}
                  </label>
                  <input 
                    id="guests"
                    name="guests"
                    type="number"
                    value={bookingDetails.guests}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentMethod">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={bookingDetails.paymentMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:bg-green-400"
                  >
                    {isLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-green-100 text-green-600 rounded-full p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Thank you for your booking!
              </h4>
              <p className="text-gray-600 mb-6">
                Your booking for {getItemName()} has been confirmed.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h5 className="font-semibold text-blue-700 mb-2">Booking Details</h5>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Confirmation Number:</span> {confirmationNumber}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Name:</span> {bookingDetails.firstName} {bookingDetails.lastName}
                </p>
                {type === 'hotel' || type === 'package' ? (
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Dates:</span> {bookingDetails.dateFrom} to {bookingDetails.dateTo}
                  </p>
                ) : null}
                <p className="text-gray-700">
                  <span className="font-medium">{type === 'travel' ? 'Passengers' : 'Guests'}:</span> {bookingDetails.guests}
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                A confirmation email has been sent to {bookingDetails.email}.
                Please check your inbox for more details.
              </p>
              
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 