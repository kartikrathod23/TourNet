import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaUser, FaStar } from 'react-icons/fa';
import BookingModal from './BookingModal';

const TourPackageCard = ({ tourPackage }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80';
  
  // Format price with commas
  const formattedPrice = tourPackage.price?.amount 
    ? `${tourPackage.price.currency} ${tourPackage.price.amount.toLocaleString()}`
    : 'Contact for price';
  
  // Get destinations as comma-separated string
  const destinations = tourPackage.destinations?.map(d => d.name).join(', ') || 'Multiple destinations';
  
  const handleBookNow = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page with return URL
      navigate(`/login?redirect=/packages/${tourPackage._id}`);
      return;
    }
    
    // Open booking modal
    setIsBookingModalOpen(true);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div className="relative">
          {/* Tour package image */}
          <img 
            src={tourPackage.mainImage || defaultImage} 
            alt={tourPackage.title} 
            className="w-full h-48 object-cover"
          />
          
          {/* Price badge */}
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg font-semibold">
            {formattedPrice}
          </div>
          
          {/* Category badge - show first category */}
          {tourPackage.categories && tourPackage.categories.length > 0 && (
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white px-3 py-1 text-sm">
              {tourPackage.categories[0]}
            </div>
          )}
          
          {/* Rating if available */}
          {tourPackage.averageRating && (
            <div className="absolute bottom-0 right-0 bg-yellow-500 text-white px-2 py-1 rounded-tl-lg flex items-center">
              <FaStar className="mr-1" />
              <span>{tourPackage.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{tourPackage.title}</h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <FaMapMarkerAlt className="mr-1 text-red-500" />
            <span className="truncate">{destinations}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <FaClock className="mr-1 text-blue-500" />
            <span>{tourPackage.duration?.days} days / {tourPackage.duration?.nights} nights</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <FaUser className="mr-1 text-green-500" />
            <span>Group size: {tourPackage.groupSize?.min}-{tourPackage.groupSize?.max} people</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {tourPackage.description}
          </p>
          
          <div className="flex justify-between items-center">
            <Link 
              to={`/packages/${tourPackage._id}`} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </Link>
            
            <button 
              onClick={handleBookNow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal 
          item={tourPackage} 
          type="package" 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </>
  );
};

export default TourPackageCard; 