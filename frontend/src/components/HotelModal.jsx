import React from 'react';

const HotelModal = ({ hotel, isOpen, onClose, onBook }) => {
  if (!isOpen) return null;

  const handleBookNow = () => {
    onBook(hotel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-blue-700">{hotel.highlighted_name || hotel.name}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="mt-4">
            <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Hotel Image Placeholder</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-gray-700">Location</h4>
                <p className="text-gray-600">{hotel.address}</p>
                <p className="text-gray-600">{hotel.location}</p>
                
                {hotel.distance && (
                  <div className="mt-2">
                    <span className="text-blue-600 text-sm font-medium">
                      {hotel.distance}m from city center
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Rating</h4>
                <div className="flex items-center">
                  <span className="text-amber-500 text-xl mr-1">★</span>
                  <span className="text-gray-700 font-medium">{hotel.rating || '4.2'}</span>
                </div>
                
                {hotel.coords && (
                  <div className="mt-2">
                    <h4 className="font-semibold text-gray-700">Coordinates</h4>
                    <p className="text-gray-600 text-sm">{hotel.coords}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">About This Hotel</h4>
              <p className="text-gray-600">
                {hotel.description || 'This luxurious hotel offers comfortable accommodations and exceptional service. Guests can enjoy various amenities and explore the surrounding area.'}
              </p>
            </div>

            {hotel.kinds && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Hotel Type</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hotel.kinds.split(',').map((kind, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                      {kind.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Amenities</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Wi-Fi', 'Air Conditioning', 'Restaurant', 'Room Service', '24/7 Reception', 'Parking'].map((amenity, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleBookNow}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Book Now • ₹{5999 + Math.floor(Math.random() * 3000)}/night
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelModal; 