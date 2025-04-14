import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrain, FaPlane, FaBus, FaCar, FaShip, FaSubway, FaBicycle, FaTimes } from 'react-icons/fa';

const TravelOptions = ({ options, loading, error, city }) => {
  const navigate = useNavigate();
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState({
    url: '',
    provider: '',
    type: ''
  });

  // Function to convert USD to INR
  const convertToRupees = (amount, currency) => {
    // If already in INR, return as is
    if (currency === 'INR') return amount;
    
    // Approximate conversion rate (1 USD = 83 INR)
    const usdToInrRate = 83;
    
    // For other currencies, convert via USD (simplified approach)
    return Math.round(amount * usdToInrRate);
  };

  // Get icon based on transport type
  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'train': return <FaTrain className="text-blue-600" />;
      case 'flight': return <FaPlane className="text-blue-600" />;
      case 'bus': return <FaBus className="text-blue-600" />;
      case 'car_rental': return <FaCar className="text-blue-600" />;
      case 'boat': return <FaShip className="text-blue-600" />;
      case 'ferry': return <FaShip className="text-blue-600" />;
      case 'subway': return <FaSubway className="text-blue-600" />;
      case 'tram': return <FaSubway className="text-blue-600" />;
      case 'cycling': return <FaBicycle className="text-blue-600" />;
      default: return <FaCar className="text-blue-600" />;
    }
  };

  // Group options by type
  const groupedOptions = options?.reduce((acc, option) => {
    if (!acc[option.type]) {
      acc[option.type] = [];
    }
    acc[option.type].push(option);
    return acc;
  }, {}) || {};

  // Function to handle booking intent - shows confirmation dialog instead of redirecting immediately
  const handleBookingIntent = (option, type) => {
    // Get external booking URL based on transport type
    let bookingUrl = '';
    const origin = encodeURIComponent(option.details?.origin || city || 'Delhi');
    const destination = encodeURIComponent(option.details?.destination || 'Mumbai');
    const departDate = encodeURIComponent(option.details?.departureDate || new Date().toISOString().split('T')[0]);
    const airline = option.details?.airline?.toLowerCase() || '';
    
    switch(type) {
      case 'flight':
        // Check for specific airlines
        if (airline.includes('indigo') || airline.includes('6e')) {
          bookingUrl = `https://www.goindigo.in/flight/search/${origin}-${destination}-${departDate}`;
        } else if (airline.includes('air india') || airline.includes('ai')) {
          bookingUrl = 'https://www.airindia.com/';
        } else if (airline.includes('vistara') || airline.includes('uk')) {
          bookingUrl = 'https://www.airvistara.com/';
        } else if (airline.includes('spicejet') || airline.includes('sg')) {
          bookingUrl = 'https://www.spicejet.com/';
        } else if (airline.includes('akasa') || airline.includes('qp')) {
          bookingUrl = 'https://www.akasaair.com/';
        } else {
          // MakeMyTrip Flight Booking
          bookingUrl = `https://www.makemytrip.com/flight/search?tripType=O&itinerary=${origin}-${destination}-${departDate}&paxType=A-1_C-0_I-0&cabinClass=E`;
        }
        break;
      case 'train':
        // IRCTC Booking
        bookingUrl = 'https://www.irctc.co.in/nget/train-search';
        break;
      case 'bus':
        // Check if it's a city tour bus
        if (option.name?.toLowerCase().includes('city tour') || option.description?.toLowerCase().includes('sightseeing')) {
          bookingUrl = 'https://www.viator.com/India/d723-ttd';
        } else {
          // RedBus for intercity
          const sourceCity = origin.split(' ')[0].toLowerCase();
          const destCity = destination.split(' ')[0].toLowerCase();
          bookingUrl = `https://www.redbus.in/bus-tickets/${sourceCity}-to-${destCity}?srcCountry=IND&destCountry=IND&onward=${departDate}`;
        }
        break;
      case 'car_rental':
        // Zoomcar Booking
        bookingUrl = 'https://www.zoomcar.com/';
        break;
      default:
        // MakeMyTrip as fallback
        bookingUrl = 'https://www.makemytrip.com/';
    }
    
    // Store booking intent in localStorage (for returning users)
    const bookingDetails = {
      type: 'travel',
      itemDetails: {
        itemId: option.id || `${type}-${Date.now()}`,
        name: option.name || `${type} to ${option.details?.destination || city}`,
        transportType: type,
        origin: option.details?.origin || city || 'Delhi',
        destination: option.details?.destination || 'Mumbai',
        departureTime: option.details?.departureTime || '10:30',
        provider: option.details?.airline || option.provider || 'IndiGo',
      },
      price: {
        amount: option.price.amount || 3500,
        currency: 'INR'
      },
      date: departDate
    };
    
    localStorage.setItem('lastBookingIntent', JSON.stringify(bookingDetails));
    
    // Open confirmation dialog instead of opening directly
    setRedirectInfo({
      url: bookingUrl,
      provider: option.details?.airline || option.provider || (type === 'train' ? 'IRCTC' : 'Travel Provider'),
      type: type
    });
    setShowRedirectModal(true);
  };

  // Function to handle external redirect after confirmation
  const handleExternalRedirect = () => {
    window.open(redirectInfo.url, '_blank');
    setShowRedirectModal(false);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Finding the best travel options for {city}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-3">
        <h5 className="font-bold mb-1">Error loading travel options</h5>
        <p>{error}</p>
      </div>
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded my-3">
        <h5 className="font-bold mb-1">No travel options found</h5>
        <p>Please try another city or check back later.</p>
      </div>
    );
  }

  return (
    <div className="travel-options-container">
      {/* Redirect Confirmation Modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Booking</h3>
              <button 
                onClick={() => setShowRedirectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              You'll be redirected to {redirectInfo.provider}'s website to complete your {redirectInfo.type.replace('_', ' ')} booking. Continue?
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRedirectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExternalRedirect}
                className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(groupedOptions).map((type) => (
        <div key={type} className="mb-8">
          <h4 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
            <span className="mr-2">{getIcon(type)}</span>
            <span>{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Options</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedOptions[type].map((option, index) => {
              // Convert price to INR
              const priceInRupees = convertToRupees(option.price.amount, option.price.currency);
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5">
                  {/* Special header format for flights */}
                  {type === 'flight' ? (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <h5 className="font-bold text-blue-700 text-lg mr-2">
                            {option.details.airline || 'IndiGo'}
                          </h5>
                          {option.details.flightNumber && (
                            <span className="text-sm text-gray-500">
                              ({option.details.flightNumber || '6E 2135'})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            option.details.nonstop 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {option.details.nonstop ? 'Non-stop' : `${option.details.stops || 1} stop${option.details.stops > 1 ? 's' : ''}`}
                          </span>
                          {option.details.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              option.details.status === 'On Time' 
                                ? 'bg-green-100 text-green-800'
                                : option.details.status === 'Delayed'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {option.details.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{option.details.departureTime || '06:45'}</span>
                          <span className="text-xs text-gray-500">{option.details.origin || 'Delhi (DEL)'}</span>
                          {option.details.departureTerminal && (
                            <span className="text-xs text-gray-500">Terminal: {option.details.departureTerminal || 'T3'}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-1 items-center px-2">
                          <div className="h-0.5 flex-1 bg-gray-300"></div>
                          <span className="mx-2 text-xs text-gray-500">{option.duration || '2h 30m'}</span>
                          <div className="h-0.5 flex-1 bg-gray-300"></div>
                        </div>
                        
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-gray-800">{option.details.arrivalTime || '09:15'}</span>
                          <span className="text-xs text-gray-500">{option.details.destination || 'Mumbai (BOM)'}</span>
                          {option.details.arrivalTerminal && (
                            <span className="text-xs text-gray-500">Terminal: {option.details.arrivalTerminal || 'T2'}</span>
                          )}
                        </div>
                      </div>
                      
                      {option.details.aircraft && (
                        <div className="text-xs text-gray-500 mb-2">
                          Aircraft: {option.details.aircraft || 'Airbus A320neo'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-bold text-blue-700 text-lg">{option.name || 'Rajdhani Express'}</h5>
                      <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">
                        ₹{priceInRupees || 2450}
                      </span>
                    </div>
                  )}
                  
                  {type !== 'flight' && (
                    <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                  )}
                  
                  {/* Pricing for flights displayed differently */}
                  {type === 'flight' && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Price:</span>
                        <span className="text-xl font-bold text-green-700">₹{priceInRupees}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">One way • Economy</p>
                    </div>
                  )}
                  
                  <div className="text-gray-700 text-sm space-y-1">
                    {type !== 'flight' && (
                      <>
                        <p><span className="font-semibold">Duration:</span> {option.duration}</p>
                        <p><span className="font-semibold">Frequency:</span> {option.frequency}</p>
                      </>
                    )}
                    
                    {option.details && type !== 'flight' && (
                      <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {option.details.airline && <p className="mb-1">Airline: {option.details.airline}</p>}
                        {option.details.flightNumber && <p className="mb-1">Flight: {option.details.flightNumber}</p>}
                        {option.details.departureTime && <p className="mb-1">Departure: {option.details.departureTime}</p>}
                        {option.details.stops !== undefined && <p>Stops: {option.details.stops}</p>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <button className="flex-1 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition text-sm font-medium mr-2">
                      View Details
                    </button>
                    <button 
                      onClick={() => handleBookingIntent(option, type)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TravelOptions; 