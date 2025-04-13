import React from 'react';

const PackageModal = ({ tourPackage, isOpen, onClose, onBook }) => {
  if (!isOpen) return null;

  const handleBookNow = () => {
    onBook(tourPackage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-blue-700">{tourPackage.name}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="mt-4">
            <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Package Image Placeholder</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-gray-700">Duration</h4>
                <p className="text-gray-600">{tourPackage.duration}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Price</h4>
                <p className="text-green-600 font-semibold">₹{tourPackage.price}</p>
                
                <div className="flex items-center mt-2">
                  <span className="text-amber-500 mr-1">★</span>
                  <span className="text-sm">{tourPackage.rating || '4.5'}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Description</h4>
              <p className="text-gray-600">{tourPackage.description}</p>
            </div>

            {tourPackage.attractions && tourPackage.attractions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Featured Attractions</h4>
                <ul className="list-disc pl-5 mt-2">
                  {tourPackage.attractions.map((attraction, i) => (
                    <li key={i} className="text-gray-600">{attraction}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Package Inclusions</h4>
              <ul className="list-disc pl-5 mt-2">
                {tourPackage.inclusions && tourPackage.inclusions.map((item, i) => (
                  <li key={i} className="text-gray-600">{item}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Itinerary</h4>
              <div className="mt-2 space-y-3">
                <div>
                  <h5 className="font-medium text-gray-700">Day 1</h5>
                  <p className="text-gray-600">Arrival and check-in to hotel. Welcome dinner and orientation.</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Day 2</h5>
                  <p className="text-gray-600">Sightseeing tour of major attractions. Lunch at a local restaurant.</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700">Day 3</h5>
                  <p className="text-gray-600">Free time for shopping and personal activities. Optional excursions available.</p>
                </div>
                {tourPackage.duration.includes('4') && (
                  <div>
                    <h5 className="font-medium text-gray-700">Day 4</h5>
                    <p className="text-gray-600">Visit to nearby attractions. Special cultural evening planned.</p>
                  </div>
                )}
                {tourPackage.duration.includes('5') && (
                  <div>
                    <h5 className="font-medium text-gray-700">Day 5</h5>
                    <p className="text-gray-600">Relaxation day with spa treatments and leisure activities.</p>
                  </div>
                )}
                {tourPackage.duration.includes('6') && (
                  <div>
                    <h5 className="font-medium text-gray-700">Day 6</h5>
                    <p className="text-gray-600">Day trip to a nearby famous landmark with guided tour.</p>
                  </div>
                )}
                <div>
                  <h5 className="font-medium text-gray-700">Last Day</h5>
                  <p className="text-gray-600">Check-out and departure. Transfer to airport/station.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleBookNow}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Book This Package
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageModal; 