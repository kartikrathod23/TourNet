// src/pages/Dashboard.jsx

import React from 'react';
import { useEffect, useState } from 'react';
import HotelModal from '../components/HotelModal';
import PackageModal from '../components/PackageModal';
import TravelModal from '../components/TravelModal';
import BookingModal from '../components/BookingModal';

const Dashboard = () => {
    const [hotels, setHotels] = useState([]);
    const [activities, setActivities] = useState([]);
    const [tourPackages, setTourPackages] = useState([]);
    const [travelOptions, setTravelOptions] = useState([]);
    const [location, setLocation] = useState('Paris');
    const [locationInfo, setLocationInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for modals
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedTravel, setSelectedTravel] = useState(null);
    const [bookingItem, setBookingItem] = useState(null);
    const [bookingType, setBookingType] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch hotels
            const hotelsRes = await fetch(`http://localhost:5000/api/hotels/search?city=${location}`);
            const hotelsData = await hotelsRes.json();
            
            if (hotelsData.success) {
                setHotels(hotelsData.data?.hotels || []);
                setLocationInfo(hotelsData.data?.location || null);
            } else {
                console.error('Hotel API error:', hotelsData.error);
                setError(hotelsData.error || 'Failed to fetch hotels');
            }

            // Fetch tour packages
            const packagesRes = await fetch(`http://localhost:5000/api/tour-packages/search?city=${location}`);
            const packagesData = await packagesRes.json();
            
            if (packagesData.success) {
                setTourPackages(packagesData.data?.packages || []);
                if (!locationInfo) {
                    setLocationInfo(packagesData.data?.location || null);
                }
            } else {
                console.error('Tour packages API error:', packagesData.error);
            }

            // Fetch travel options
            const travelRes = await fetch(`http://localhost:5000/api/travel-options/search?city=${location}`);
            const travelData = await travelRes.json();
            
            if (travelData.success) {
                setTravelOptions(travelData.data?.travelOptions || []);
                if (!locationInfo) {
                    setLocationInfo(travelData.data?.location || null);
                }
            } else {
                console.error('Travel options API error:', travelData.error);
            }

            // Fetch activities with coordinates from location
            // This is just a fallback that uses default coordinates
            const activitiesRes = await fetch(`http://localhost:5000/api/activities?lat=12.9716&lng=77.5946`);
            const activitiesData = await activitiesRes.json();
            setActivities(activitiesData.data || []);
        } catch (err) {
            console.error('Data fetch error', err);
            setError('Failed to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    // Modal handlers
    const handleViewHotel = (hotel) => {
        setSelectedHotel(hotel);
    };

    const handleViewPackage = (pkg) => {
        setSelectedPackage(pkg);
    };

    const handleViewTravel = (travel) => {
        setSelectedTravel(travel);
    };

    const handleBookHotel = (hotel) => {
        setBookingItem(hotel);
        setBookingType('hotel');
        setSelectedHotel(null);
    };

    const handleBookPackage = (pkg) => {
        setBookingItem(pkg);
        setBookingType('package');
        setSelectedPackage(null);
    };

    const handleBookTravel = (travel) => {
        setBookingItem(travel);
        setBookingType('travel');
        setSelectedTravel(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            {/* Navbar */}
            <header className="bg-gray-300/80 backdrop-blur-md shadow-md px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
                <h1 className="text-2xl font-bold text-blue-700">TourNet</h1>

                {/* Nav Links */}
                <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
                    <a href="#" className="hover:text-blue-600 transition">Home</a>
                    <a href="#" className="hover:text-blue-600 transition">Destinations</a>
                    <a href="#" className="hover:text-blue-600 transition">Bookings</a>
                    <a href="#" className="hover:text-blue-600 transition">Support</a>
                    <a href="#" className="hover:text-blue-600 transition">Contact</a>
                </nav>

                {/* Auth Buttons */}
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-md cursor-pointer">
                    <span className="text-purple-600 text-lg">👤</span>
                </div>
            </header>

            {/* Search Section */}
            <section className="relative w-[97.5vw] h-64 md:h-80 lg:h-[22rem] bg-cover bg-center my-10 rounded-xl mx-4 shadow-lg overflow-hidden"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')`,
                }}
            >
                {/* Dark overlay for background image */}
                <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center text-center px-4">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Discover Your Dream Getaway</h3>
                        <p className="text-white text-lg md:text-xl mb-6">Explore top destinations, compare travel deals, and book with ease.</p>

                        {/* Search Section */}
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">Where do you want to go?</h2>
                        <form onSubmit={handleSearch} className="flex justify-center flex-wrap gap-4">
                            <input
                                type="text"
                                placeholder="Search destinations..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-72 md:w-96 px-4 py-2 rounded-md border-3 border-gray-100 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </form>
                        
                        {error && (
                            <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        {locationInfo && (
                            <div className="mt-4 text-white">
                                <p>Showing results for: {locationInfo.name}, {locationInfo.country}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Tour Packages Section */}
            <section className="px-6 md:px-12 py-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    🏝️ Available Tour Packages 
                    {locationInfo && <span className="text-lg font-normal text-gray-600 ml-2">in {locationInfo.name}</span>}
                </h3>
                {tourPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tourPackages.map((pkg, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                                <h4 className="text-lg font-bold text-blue-700 mb-2">{pkg.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                                <p className="text-xs text-gray-500 mb-3">Duration: {pkg.duration}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {pkg.inclusions && pkg.inclusions.map((item, j) => (
                                        <span key={j} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-green-600 font-semibold">₹{pkg.price}</p>
                                    <div className="flex items-center">
                                        <span className="text-amber-500 mr-1">★</span>
                                        <span className="text-sm">{pkg.rating}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button 
                                        onClick={() => handleViewPackage(pkg)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        onClick={() => handleBookPackage(pkg)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        {loading ? 'Loading tour packages...' : 'No tour packages available for this location.'}
                    </p>
                )}
            </section>

            {/* Hotels Section */}
            <section className="px-6 md:px-12 py-8 bg-gray-100">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    🏨 Available Hotels
                    {locationInfo && <span className="text-lg font-normal text-gray-600 ml-2">in {locationInfo.name}</span>}
                </h3>
                {hotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {hotels.map((hotel, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                                <h4 className="text-lg font-bold text-blue-700 mb-2">{hotel.highlighted_name || hotel.name}</h4>
                                <p className="text-sm text-gray-600">{hotel.address || 'Address not available'}</p>
                                <p className="text-xs text-gray-500 mt-1">{hotel.location}</p>
                                {hotel.distance && (
                                    <p className="text-xs text-blue-600 mt-1">Distance from center: {hotel.distance}m</p>
                                )}
                                {hotel.rating && (
                                    <div className="flex items-center mt-2">
                                        <span className="text-amber-500 mr-1">★</span>
                                        <span className="text-sm">{hotel.rating}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4">
                                    <button 
                                        onClick={() => handleBookHotel(hotel)} 
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    >
                                        Book Now
                                    </button>
                                    <button 
                                        onClick={() => handleViewHotel(hotel)}
                                        className="px-3 py-2 bg-transparent text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        {loading ? 'Loading hotels...' : 'No hotels available for this location.'}
                    </p>
                )}
            </section>

            {/* Travel Options Section */}
            <section className="px-6 md:px-12 py-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    🚗 Travel Options
                    {locationInfo && <span className="text-lg font-normal text-gray-600 ml-2">in {locationInfo.name}</span>}
                </h3>
                {travelOptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {travelOptions.map((option, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-lg font-bold text-blue-700">{option.name}</h4>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                        {option.type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                                <div className="text-xs text-gray-500 mb-3">
                                    <p>Capacity: {option.capacity} person{option.capacity > 1 ? 's' : ''}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {option.features && option.features.map((feature, j) => (
                                        <span key={j} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <p className="text-green-600 font-semibold">
                                        {option.currency} {option.price} <span className="text-xs text-gray-500">({option.unit})</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleViewTravel(option)}
                                            className="px-3 py-1 bg-transparent text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition text-sm"
                                        >
                                            Details
                                        </button>
                                        <button 
                                            onClick={() => handleBookTravel(option)}
                                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                        >
                                            Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        {loading ? 'Loading travel options...' : 'No travel options available for this location.'}
                    </p>
                )}
            </section>

            {/* Activities Section (retained from original) */}
            <section className="px-6 md:px-12 py-8 bg-gray-100">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">🌍 Popular Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activities.length > 0 ? (
                        activities.map((activity, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                                <h4 className="text-lg font-bold text-blue-700 mb-2">{activity.name}</h4>
                                <p className="text-sm text-gray-600">{activity.shortDescription || 'No description available.'}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 col-span-3">
                            {loading ? 'Loading activities...' : 'No activities available for this location.'}
                        </p>
                    )}
                </div>
            </section>

            {/* CTA Button */}
            <section className="text-center py-12">
                <button className="px-8 py-3 text-lg bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition">
                    Plan My Trip
                </button>
            </section>

            {/* Footer */}
            <footer className="bg-gray-100 text-center text-gray-600 py-4">
                © 2025 TourNet · Designed with ❤️ by Team
            </footer>

            {/* Modals */}
            <HotelModal 
                hotel={selectedHotel} 
                isOpen={selectedHotel !== null} 
                onClose={() => setSelectedHotel(null)} 
                onBook={handleBookHotel}
            />

            <PackageModal 
                tourPackage={selectedPackage} 
                isOpen={selectedPackage !== null} 
                onClose={() => setSelectedPackage(null)} 
                onBook={handleBookPackage}
            />

            <TravelModal 
                travelOption={selectedTravel} 
                isOpen={selectedTravel !== null} 
                onClose={() => setSelectedTravel(null)} 
                onBook={handleBookTravel}
            />

            <BookingModal 
                item={bookingItem} 
                type={bookingType} 
                isOpen={bookingItem !== null} 
                onClose={() => {
                    setBookingItem(null);
                    setBookingType('');
                }} 
            />
        </div>
    );
};

export default Dashboard;
