import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Credit card form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });
  
  // Billing address state
  const [billingAddress, setBillingAddress] = useState({
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    // In a real app, we would get the booking ID from URL params or location state
    const bookingId = location.state?.bookingId || 'sample-booking-id';
    
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        
        // This would be a real API call in production
        // For now, simulate API response with dummy data
        // await axios.get(`http://localhost:5000/api/bookings/${bookingId}`)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock booking data
        const mockBooking = {
          _id: bookingId,
          hotel: {
            name: "Seaside Resort & Spa",
            price: 850,
            image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format"
          },
          checkInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          nights: 5,
          guests: {
            adults: 2,
            children: 1
          },
          activities: [
            {
              name: "Guided City Tour",
              price: 120
            },
            {
              name: "Sunset Cruise",
              price: 95
            }
          ],
          transportation: {
            type: "Airport Transfer",
            price: 65
          },
          totalAmount: 1130, // hotel + activities + transportation
          currency: "USD",
          status: "pending"
        };
        
        setBooking(mockBooking);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Unable to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [location.state]);

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingAddressChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!booking) return;
    
    setProcessing(true);
    setError('');
    
    try {
      // This would be a real API call in production
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock API call
      /*
      const response = await axios.post('http://localhost:5000/api/payments', {
        bookingId: booking._id,
        amount: booking.totalAmount,
        currency: booking.currency,
        paymentMethod,
        paymentProvider: 'stripe',
        billingAddress
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      */
      
      console.log('Payment processed with:', {
        booking: booking._id,
        amount: booking.totalAmount,
        paymentMethod,
        billingAddress
      });
      
      setSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/booking-history');
      }, 2000);
      
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('Unable to process payment. Please check your details and try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Format credit card number with spaces
  const formatCardNumber = (value) => {
    const regex = /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/g;
    const onlyNumbers = value.replace(/[^\d]/g, '');
    
    return onlyNumbers.replace(regex, (regex, $1, $2, $3, $4) =>
      [$1, $2, $3, $4].filter(group => !!group).join(' ')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          <Link to="/booking-history">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              View My Bookings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold text-blue-700">TourNet</h1>
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
          <p className="text-gray-600">Secure payment processing for your travel booking</p>
        </div>
        
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">Payment Method</h3>
              
              {/* Payment Method Selection */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-4">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Credit / Debit Card
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span className="text-blue-600 font-bold mr-1">Pay</span><span className="text-blue-800 font-bold">Pal</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Credit Card Form (only show if card payment method selected) */}
                {paymentMethod === 'card' && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Card Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          id="nameOnCard"
                          name="nameOnCard"
                          value={cardDetails.nameOnCard}
                          onChange={handleCardDetailsChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John Smith"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formatCardNumber(cardDetails.cardNumber)}
                          onChange={(e) => handleCardDetailsChange({
                            target: {
                              name: 'cardNumber',
                              value: e.target.value.replace(/\s/g, '')
                            }
                          })}
                          required
                          maxLength="19" // 16 digits + 3 spaces
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date (MM/YY)
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardDetailsChange}
                            required
                            maxLength="5"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardDetailsChange}
                            required
                            maxLength="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* PayPal Message (only show if PayPal payment method selected) */}
                {paymentMethod === 'paypal' && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-md">
                    <p className="text-blue-800">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}
                
                {/* Billing Address */}
                <div className="mb-6">
                  <h4 className="font-medium mb-4">Billing Address</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="streetAddress"
                        name="streetAddress"
                        value={billingAddress.streetAddress}
                        onChange={handleBillingAddressChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingAddressChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="New York"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={billingAddress.state}
                          onChange={handleBillingAddressChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={billingAddress.postalCode}
                          onChange={handleBillingAddressChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="10001"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={billingAddress.country}
                          onChange={handleBillingAddressChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="IN">India</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full mt-6 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {processing ? 'Processing Payment...' : `Pay ${booking?.currency || 'USD'} ${booking?.totalAmount?.toFixed(2) || '0.00'}`}
                </button>
                
                {/* Security Notice */}
                <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure payment processed with bank-level encryption
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">Order Summary</h3>
              
              {booking && (
                <div>
                  {/* Hotel Info */}
                  {booking.hotel && (
                    <div className="mb-6">
                      <div className="flex items-start mb-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden mr-4 flex-shrink-0">
                          {booking.hotel.image && (
                            <img src={booking.hotel.image} alt={booking.hotel.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{booking.hotel.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.nights} nights, {booking.guests.adults} adults
                            {booking.guests.children > 0 && `, ${booking.guests.children} children`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    {booking.hotel && (
                      <div className="flex justify-between text-gray-700">
                        <span>Hotel ({booking.nights} nights)</span>
                        <span>{booking.currency} {booking.hotel.price.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {booking.activities && booking.activities.length > 0 && (
                      <>
                        <div className="flex justify-between text-gray-700">
                          <span>Activities ({booking.activities.length})</span>
                          <span>{booking.currency} {booking.activities.reduce((sum, activity) => sum + activity.price, 0).toFixed(2)}</span>
                        </div>
                        <div className="pl-4 text-sm text-gray-600">
                          {booking.activities.map((activity, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{activity.name}</span>
                              <span>{booking.currency} {activity.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {booking.transportation && (
                      <div className="flex justify-between text-gray-700">
                        <span>Transportation ({booking.transportation.type})</span>
                        <span>{booking.currency} {booking.transportation.price.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{booking.currency} {booking.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Cancellation Policy */}
              <div className="text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Cancellation Policy</h4>
                <p>Free cancellation up to 48 hours before check-in. Cancellations within 48 hours of check-in are subject to a one-night charge.</p>
              </div>
              
              {/* Need Help? */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Need Help?</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Our customer support team is available 24/7. <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link> for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-600 text-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-6 mb-4">
            <Link to="/contact" className="hover:text-blue-600 transition">Contact Us</Link>
            <a href="#" className="hover:text-blue-600 transition">Terms & Conditions</a>
            <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
          </div>
          <p>© 2025 TourNet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Payment; 