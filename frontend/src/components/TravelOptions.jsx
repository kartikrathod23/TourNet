import React from 'react';
import { FaTrain, FaPlane, FaBus, FaCar, FaShip, FaSubway, FaBicycle } from 'react-icons/fa';

const TravelOptions = ({ options, loading, error, city }) => {
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
                          <h5 className="font-bold text-blue-700 text-lg mr-2">{option.details.airline}</h5>
                          {option.details.flightNumber && (
                            <span className="text-sm text-gray-500">({option.details.flightNumber})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            option.details.nonstop 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {option.details.nonstop ? 'Non-stop' : `${option.details.stops} stop${option.details.stops > 1 ? 's' : ''}`}
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
                          <span className="font-bold text-gray-800">{option.details.departureTime}</span>
                          <span className="text-xs text-gray-500">{option.details.origin || ''}</span>
                          {option.details.departureTerminal && (
                            <span className="text-xs text-gray-500">Terminal: {option.details.departureTerminal}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-1 items-center px-2">
                          <div className="h-0.5 flex-1 bg-gray-300"></div>
                          <span className="mx-2 text-xs text-gray-500">{option.duration}</span>
                          <div className="h-0.5 flex-1 bg-gray-300"></div>
                        </div>
                        
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-gray-800">{option.details.arrivalTime}</span>
                          <span className="text-xs text-gray-500">{option.details.destination || ''}</span>
                          {option.details.arrivalTerminal && (
                            <span className="text-xs text-gray-500">Terminal: {option.details.arrivalTerminal}</span>
                          )}
                        </div>
                      </div>
                      
                      {option.details.aircraft && (
                        <div className="text-xs text-gray-500 mb-2">
                          Aircraft: {option.details.aircraft}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-bold text-blue-700 text-lg">{option.name}</h5>
                      <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md">
                        ₹{priceInRupees}
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
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium">
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