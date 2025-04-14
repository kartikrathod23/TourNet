import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaMapMarkerAlt, FaUser, FaMoneyBillWave, FaStar, FaSpinner } from 'react-icons/fa';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    guests: 1,
    specialRequirements: ''
  });
  
  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80';
  
  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/tour-packages/${id}`);
        
        if (response.data.success) {
          setTourPackage(response.data.data);
        } else {
          setError('Failed to fetch package details');
        }
      } catch (err) {
        console.error('Error fetching package details:', err);
        setError('An error occurred while fetching package details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackageDetails();
  }, [id]);
  
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Submit booking
      const response = await axios.post('http://localhost:5000/api/bookings', 
        {
          packageId: id,
          startDate: bookingData.startDate,
          numberOfPeople: bookingData.guests,
          specialRequirements: bookingData.specialRequirements
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        navigate('/booking-history');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <p className="ml-2">Loading package details...</p>
      </div>
    );
  }
  
  if (error || !tourPackage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error || 'Package not found'}
        </div>
        <Link to="/tour-packages" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Tour Packages
        </Link>
      </div>
    );
  }
  
  // Format price with commas
  const formattedPrice = tourPackage.price?.amount 
    ? `${tourPackage.price.currency} ${tourPackage.price.amount.toLocaleString()}`
    : 'Contact for price';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/tour-packages" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Tour Packages
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-96">
          <img 
            src={tourPackage.mainImage || defaultImage} 
            alt={tourPackage.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
            <div className="bg-white bg-opacity-90 p-4 rounded-lg max-w-3xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tourPackage.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-1" />
                  <span>
                    {tourPackage.destinations.map(dest => dest.name).join(', ')}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <FaClock className="text-blue-500 mr-1" />
                  <span>{tourPackage.duration.days} days / {tourPackage.duration.nights} nights</span>
                </div>
                
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-green-500 mr-1" />
                  <span className="font-semibold">{formattedPrice}</span>
                </div>
                
                {tourPackage.averageRating && (
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span>{tourPackage.averageRating.toFixed(1)} ({tourPackage.reviewCount || 0} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content - 2/3 width */}
            <div className="lg:col-span-2">
              {/* Description */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{tourPackage.description}</p>
              </section>
              
              {/* Highlights */}
              {tourPackage.highlights && tourPackage.highlights.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Highlights</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {tourPackage.highlights.map((highlight, index) => (
                      <li key={index} className="text-gray-700">{highlight}</li>
                    ))}
                  </ul>
                </section>
              )}
              
              {/* Destinations */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Destinations</h2>
                <div className="space-y-4">
                  {tourPackage.destinations.map((destination, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {destination.name}, {destination.country}
                      </h3>
                      <p className="text-gray-600 mb-2">Stay: {destination.stayDuration} days</p>
                      {destination.description && (
                        <p className="text-gray-700 mb-2">{destination.description}</p>
                      )}
                      {destination.activities && destination.activities.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">Activities:</h4>
                          <ul className="list-disc pl-5">
                            {destination.activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-gray-700">{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Itinerary */}
              {tourPackage.itinerary && tourPackage.itinerary.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Itinerary</h2>
                  <div className="space-y-4">
                    {tourPackage.itinerary.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-600 mb-2">Day {day.day}: {day.title}</h3>
                        <p className="text-gray-700 mb-3">{day.description}</p>
                        
                        {day.activities && day.activities.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-800 mb-1">Activities:</h4>
                            <ul className="list-disc pl-5">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="text-gray-700">{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="bg-gray-100 px-3 py-1 rounded">
                            <span className="font-medium">Meals:</span> 
                            {[
                              day.meals?.breakfast && 'Breakfast',
                              day.meals?.lunch && 'Lunch',
                              day.meals?.dinner && 'Dinner'
                            ].filter(Boolean).join(', ') || 'Not included'}
                          </div>
                          
                          {day.accommodation && day.accommodation.name && (
                            <div className="bg-gray-100 px-3 py-1 rounded">
                              <span className="font-medium">Accommodation:</span> {day.accommodation.name}
                              {day.accommodation.rating && ` (${day.accommodation.rating}⭐)`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
            
            {/* Right Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              {/* Booking Card */}
              <div className="bg-gray-50 rounded-lg shadow-md p-4 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Book This Tour</h3>
                
                <div className="mb-4">
                  <div className="text-gray-800 font-semibold">Price:</div>
                  <div className="text-2xl font-bold text-green-600">{formattedPrice}</div>
                  <div className="text-gray-600 text-sm">per person</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-gray-800 font-semibold mb-2">Tour Details:</div>
                  <div className="flex items-center text-gray-700 mb-1">
                    <FaClock className="mr-2 text-blue-500" />
                    <span>{tourPackage.duration.days} days / {tourPackage.duration.nights} nights</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-1">
                    <FaUser className="mr-2 text-green-500" />
                    <span>Group size: {tourPackage.groupSize?.min}-{tourPackage.groupSize?.max} people</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: 
                          tourPackage.difficulty === 'easy' ? '#10B981' : 
                          tourPackage.difficulty === 'moderate' ? '#F59E0B' : 
                          tourPackage.difficulty === 'challenging' ? '#EF4444' : 
                          '#7C3AED'
                      }}
                    ></span>
                    <span className="capitalize">{tourPackage.difficulty} difficulty</span>
                  </div>
                </div>
                
                {isBookingOpen ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1" htmlFor="startDate">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleBookingChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-1" htmlFor="guests">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        id="guests"
                        name="guests"
                        value={bookingData.guests}
                        onChange={handleBookingChange}
                        min={tourPackage.groupSize?.min || 1}
                        max={tourPackage.groupSize?.max || 20}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-1" htmlFor="specialRequirements">
                        Special Requirements
                      </label>
                      <textarea
                        id="specialRequirements"
                        name="specialRequirements"
                        value={bookingData.specialRequirements}
                        onChange={handleBookingChange}
                        rows="3"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      ></textarea>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                )}
                
                {/* Agent Info */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-gray-800 font-semibold mb-2">Offered by:</h4>
                  <div className="text-gray-700">{tourPackage.agentCompany}</div>
                  {tourPackage.agentContactInfo && (
                    <div className="mt-2 text-sm text-gray-600">
                      {tourPackage.agentContactInfo.phone && (
                        <div>Phone: {tourPackage.agentContactInfo.phone}</div>
                      )}
                      {tourPackage.agentContactInfo.email && (
                        <div>Email: {tourPackage.agentContactInfo.email}</div>
                      )}
                      {tourPackage.agentContactInfo.website && (
                        <div>Website: <a href={tourPackage.agentContactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tourPackage.agentContactInfo.website}</a></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price Includes/Excludes */}
              <div className="mt-6 bg-white rounded-lg shadow p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Price Information</h3>
                
                {tourPackage.price?.priceIncludes && tourPackage.price.priceIncludes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Price Includes:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {tourPackage.price.priceIncludes.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {tourPackage.price?.priceExcludes && tourPackage.price.priceExcludes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Price Excludes:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {tourPackage.price.priceExcludes.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Categories */}
              {tourPackage.categories && tourPackage.categories.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {tourPackage.categories.map((category, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail; 