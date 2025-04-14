import React from 'react';
import { FaTrain, FaPlane, FaBus, FaCar, FaShip } from 'react-icons/fa';

const TravelModal = ({ travelOption, isOpen, onClose, onBook }) => {
  if (!isOpen || !travelOption) return null;

  const handleBookNow = () => {
    onBook(travelOption);
    onClose();
  };

  // Get appropriate icon based on transport type
  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'train': return <FaTrain className="text-blue-600" />;
      case 'flight': return <FaPlane className="text-blue-600" />;
      case 'bus': return <FaBus className="text-blue-600" />;
      case 'car_rental': return <FaCar className="text-blue-600" />;
      case 'boat': 
      case 'ferry': return <FaShip className="text-blue-600" />;
      default: return <FaCar className="text-blue-600" />;
    }
  };

  // Format price display
  const formatPrice = () => {
    if (travelOption.price) {
      const currency = travelOption.price.currency || 'INR';
      const amount = travelOption.price.amount || 0;
      return `₹${amount.toLocaleString()}`;
    }
    return 'Price unavailable';
  };

  // Get the modal content based on travel type
  const renderFlightDetails = () => {
    const details = travelOption.details || {};
    
    return (
      <>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                <FaPlane className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{details.airline}</h4>
                <p className="text-gray-600 text-sm">{details.flightNumber || 'Flight number unavailable'}</p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {details.nonstop ? 'Non-stop' : `${details.stops} stop${details.stops !== 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{details.departureTime}</p>
              <p className="text-gray-600">{details.origin || ''}</p>
            </div>
            
            <div className="flex-1 mx-4 px-4">
              <div className="relative">
                <div className="h-0.5 bg-gray-300 w-full absolute top-1/2"></div>
                <div className="flex justify-between relative">
                  <div className="w-3 h-3 rounded-full bg-blue-600 -mt-1"></div>
                  <div className="text-center -mt-6">
                    <p className="text-gray-600 text-sm">{travelOption.duration}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-blue-600 -mt-1"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">{details.arrivalTime}</p>
              <p className="text-gray-600">{details.destination || ''}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-600 text-sm">Price</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Class</p>
                <p className="font-semibold">Economy</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">Booking Details</h4>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Date
                </label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date (optional)
                </label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passengers
                </label>
                <input 
                  type="number" 
                  min="1"
                  defaultValue="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Class
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </>
    );
  };

  const renderOtherTransportDetails = () => {
    return (
      <>
        <div className="mt-4">
          <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <p className="text-gray-500">Vehicle Image Placeholder</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-gray-700">Price</h4>
              <p className="text-green-600 font-semibold">{formatPrice()}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Duration</h4>
              <p className="text-gray-600">{travelOption.duration}</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-700">Description</h4>
            <p className="text-gray-600">{travelOption.description}</p>
          </div>

          {travelOption.details && Object.keys(travelOption.details).length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Details</h4>
              <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                {Object.entries(travelOption.details).map(([key, value]) => (
                  typeof value === 'string' || typeof value === 'number' ? (
                    <div key={key} className="grid grid-cols-2 mb-1">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold text-gray-700">Booking Details</h4>
            <form className="mt-3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passengers
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    defaultValue="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <span className="mr-2 text-xl">{getIcon(travelOption.type)}</span>
              <h3 className="text-2xl font-bold text-blue-700">
                {travelOption.name}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          {travelOption.type === 'flight' ? renderFlightDetails() : renderOtherTransportDetails()}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition mr-2"
            >
              Close
            </button>
            <button
              onClick={handleBookNow}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelModal; 