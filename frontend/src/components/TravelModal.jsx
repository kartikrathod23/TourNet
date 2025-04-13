import React from 'react';

const TravelModal = ({ travelOption, isOpen, onClose, onBook }) => {
  if (!isOpen) return null;

  const handleBookNow = () => {
    onBook(travelOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-blue-700">{travelOption.name}</h3>
              <span className="inline-block bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded mt-1">
                {travelOption.type}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="mt-4">
            <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Vehicle Image Placeholder</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-gray-700">Price</h4>
                <p className="text-green-600 font-semibold">
                  {travelOption.currency} {travelOption.price} 
                  <span className="text-xs text-gray-500 ml-1">({travelOption.unit})</span>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Capacity</h4>
                <p className="text-gray-600">{travelOption.capacity} person{travelOption.capacity > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Description</h4>
              <p className="text-gray-600">{travelOption.description}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Features</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {travelOption.features.map((feature, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

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
                      End Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of {travelOption.capacity > 1 ? 'Vehicles' : 'Passes'}
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    defaultValue="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </form>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Estimated Total</h4>
              <p className="text-green-600 font-semibold text-lg">
                {travelOption.currency} {travelOption.price}
              </p>
              <p className="text-xs text-gray-500">
                Final price will be calculated based on your selection
              </p>
            </div>

            <div className="mt-6 flex justify-end">
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
    </div>
  );
};

export default TravelModal; 