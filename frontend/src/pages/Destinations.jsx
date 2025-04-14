import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TravelOptions from '../components/TravelOptions';

const Destinations = ({ initialSearch }) => {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [travelOptions, setTravelOptions] = useState([]);
  const [loadingTravelOptions, setLoadingTravelOptions] = useState(false);
  const [filters, setFilters] = useState({
    continent: 'all',
    budget: 'all',
    season: 'all',
  });

  // Popular continents for filtering
  const continents = [
    { value: 'all', label: 'All Regions' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'north_america', label: 'North America' },
    { value: 'south_america', label: 'South America' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
  ];

  // Budget options
  const budgetOptions = [
    { value: 'all', label: 'All Budgets' },
    { value: 'budget', label: 'Budget' },
    { value: 'mid_range', label: 'Mid-Range' },
    { value: 'luxury', label: 'Luxury' },
  ];

  // Season options
  const seasonOptions = [
    { value: 'all', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
  ];

  useEffect(() => {
    // If initialSearch is provided, set the search query and potentially fetch travel options
    if (initialSearch) {
      setSearchQuery(initialSearch.city);
      if (initialSearch.origin) {
        setOriginCity(initialSearch.origin);
        // Fetch travel options with both origin and destination
        fetchTravelOptions(initialSearch.city, initialSearch.origin);
      }
    }
  }, [initialSearch]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchQuery, filters, destinations]);

  // Function to fetch travel options from the backend
  const fetchTravelOptions = async (city, origin) => {
    if (!city) return;
    
    setLoadingTravelOptions(true);
    try {
      // Build the query parameters
      const params = new URLSearchParams();
      params.append('city', city);
      if (origin) {
        params.append('origin', origin);
      }
      
      // Make the API call
      const response = await axios.get(`/api/travel-options/search?${params.toString()}`);
      
      if (response.data && response.data.transportOptions) {
        setTravelOptions(response.data.transportOptions);
      } else {
        setTravelOptions([]);
      }
    } catch (error) {
      console.error('Error fetching travel options:', error);
      setError('Failed to load travel options. Please try again later.');
    } finally {
      setLoadingTravelOptions(false);
    }
  };

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to the backend
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockDestinations = [
        {
          id: 1,
          name: 'Paris',
          country: 'France',
          continent: 'europe',
          description: 'The City of Lights with iconic landmarks like the Eiffel Tower and Louvre Museum.',
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format',
          rating: 4.8,
          priceLevel: 'mid_range',
          bestSeasons: ['spring', 'fall'],
          activities: ['Museums', 'Dining', 'Shopping', 'Architecture'],
          averagePrice: '€200/night'
        },
        {
          id: 2,
          name: 'Bali',
          country: 'Indonesia',
          continent: 'asia',
          description: 'Tropical paradise with beautiful beaches, lush rice terraces, and vibrant culture.',
          image: 'https://images.unsplash.com/photo-1538681105587-85640961bf8b?w=600&auto=format',
          rating: 4.9,
          priceLevel: 'budget',
          bestSeasons: ['summer', 'spring'],
          activities: ['Beaches', 'Temple Visits', 'Surfing', 'Hiking'],
          averagePrice: '$80/night'
        },
        {
          id: 3,
          name: 'Tokyo',
          country: 'Japan',
          continent: 'asia',
          description: 'Modern metropolis blending traditional culture with futuristic technology.',
          image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&auto=format',
          rating: 4.7,
          priceLevel: 'mid_range',
          bestSeasons: ['spring', 'fall'],
          activities: ['Shopping', 'Dining', 'Historical Sites', 'Technology'],
          averagePrice: '$150/night'
        },
        {
          id: 4,
          name: 'Santorini',
          country: 'Greece',
          continent: 'europe',
          description: 'Iconic island with white-washed buildings and stunning Mediterranean views.',
          image: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?w=600&auto=format',
          rating: 4.9,
          priceLevel: 'luxury',
          bestSeasons: ['summer', 'spring'],
          activities: ['Beaches', 'Boat Tours', 'Dining', 'Photography'],
          averagePrice: '€250/night'
        },
        {
          id: 5,
          name: 'New York City',
          country: 'USA',
          continent: 'north_america',
          description: 'The Big Apple offers world-class entertainment, dining, and iconic landmarks.',
          image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format',
          rating: 4.6,
          priceLevel: 'luxury',
          bestSeasons: ['fall', 'spring'],
          activities: ['Shopping', 'Museums', 'Broadway Shows', 'Dining'],
          averagePrice: '$300/night'
        },
        {
          id: 6,
          name: 'Cape Town',
          country: 'South Africa',
          continent: 'africa',
          description: 'Stunning coastal city with Table Mountain, wildlife, and vibrant culture.',
          image: 'https://images.unsplash.com/photo-1533002832-31bd910b3253?w=600&auto=format',
          rating: 4.7,
          priceLevel: 'mid_range',
          bestSeasons: ['summer', 'fall'],
          activities: ['Safari', 'Beaches', 'Hiking', 'Winery Tours'],
          averagePrice: '$120/night'
        },
        {
          id: 7,
          name: 'Sydney',
          country: 'Australia',
          continent: 'oceania',
          description: 'Harbor city famous for the Opera House, beaches, and laid-back lifestyle.',
          image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format',
          rating: 4.8,
          priceLevel: 'mid_range',
          bestSeasons: ['summer', 'spring'],
          activities: ['Beaches', 'Sailing', 'Opera House', 'Coastal Walks'],
          averagePrice: 'A$220/night'
        },
        {
          id: 8,
          name: 'Rio de Janeiro',
          country: 'Brazil',
          continent: 'south_america',
          description: 'Vibrant city with beautiful beaches, Christ the Redeemer, and samba culture.',
          image: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=600&auto=format',
          rating: 4.6,
          priceLevel: 'budget',
          bestSeasons: ['summer', 'fall'],
          activities: ['Beaches', 'Hiking', 'Nightlife', 'Cultural Tours'],
          averagePrice: '$100/night'
        },
        {
          id: 9,
          name: 'Marrakech',
          country: 'Morocco',
          continent: 'africa',
          description: 'Ancient city with bustling souks, palaces, and rich cultural heritage.',
          image: 'https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=600&auto=format',
          rating: 4.5,
          priceLevel: 'budget',
          bestSeasons: ['spring', 'fall'],
          activities: ['Markets', 'Historical Sites', 'Desert Tours', 'Cuisine'],
          averagePrice: '$70/night'
        },
        {
          id: 10,
          name: 'Rome',
          country: 'Italy',
          continent: 'europe',
          description: 'Eternal city with ancient ruins, Renaissance art, and world-class cuisine.',
          image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format',
          rating: 4.7,
          priceLevel: 'mid_range',
          bestSeasons: ['spring', 'fall'],
          activities: ['Historical Sites', 'Museums', 'Dining', 'Sightseeing'],
          averagePrice: '€180/night'
        },
        {
          id: 11,
          name: 'Bangkok',
          country: 'Thailand',
          continent: 'asia',
          description: 'Vibrant capital with ornate temples, street food, and bustling markets.',
          image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&auto=format',
          rating: 4.5,
          priceLevel: 'budget',
          bestSeasons: ['winter', 'fall'],
          activities: ['Temples', 'Markets', 'Dining', 'Boat Tours'],
          averagePrice: '$60/night'
        },
        {
          id: 12,
          name: 'Vancouver',
          country: 'Canada',
          continent: 'north_america',
          description: 'Coastal city surrounded by mountains, offering outdoor adventure and urban amenities.',
          image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600&auto=format',
          rating: 4.8,
          priceLevel: 'mid_range',
          bestSeasons: ['summer', 'spring'],
          activities: ['Hiking', 'Boating', 'Urban Exploring', 'Skiing'],
          averagePrice: 'C$200/night'
        }
      ];
      
      setDestinations(mockDestinations);
      setFilteredDestinations(mockDestinations);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterDestinations = () => {
    let filtered = [...destinations];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(query) || 
        dest.country.toLowerCase().includes(query) ||
        dest.description.toLowerCase().includes(query)
      );
    }
    
    // Apply continent filter
    if (filters.continent !== 'all') {
      filtered = filtered.filter(dest => dest.continent === filters.continent);
    }
    
    // Apply budget filter
    if (filters.budget !== 'all') {
      filtered = filtered.filter(dest => dest.priceLevel === filters.budget);
    }
    
    // Apply season filter
    if (filters.season !== 'all') {
      filtered = filtered.filter(dest => dest.bestSeasons.includes(filters.season));
    }
    
    setFilteredDestinations(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOriginChange = (e) => {
    setOriginCity(e.target.value);
  };
  
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Fetch travel options when user submits the search form
    fetchTravelOptions(searchQuery, originCity);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="relative pt-24 pb-12 mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Explore Destinations</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Discover amazing places around the world and start planning your next adventure.
          </p>
        </div>
      </header>
      
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin (From)</label>
                <input
                  type="text"
                  placeholder="Enter your departure city"
                  value={originCity}
                  onChange={handleOriginChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute bottom-0 left-0 pl-3 flex items-center pointer-events-none h-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination (To)</label>
                <input
                  type="text"
                  placeholder="Search destinations by name, country, or keywords..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute bottom-0 left-0 pl-3 flex items-center pointer-events-none h-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mb-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Search Travel Options
              </button>
            </div>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={filters.continent}
                onChange={(e) => handleFilterChange('continent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {continents.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Budget Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <select
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Season Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Best Season</label>
              <select
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {seasonOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Travel Options Section */}
      {(loadingTravelOptions || travelOptions.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Travel Options {originCity ? `from ${originCity} to ${searchQuery}` : `for ${searchQuery}`}
          </h2>
          
          {loadingTravelOptions ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-lg text-gray-600">Fetching travel options...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              {travelOptions.length > 0 ? (
                <div className="travel-options">
                  {/* Import and use TravelOptions component here */}
                  <TravelOptions 
                    options={travelOptions} 
                    loading={false} 
                    error={null} 
                    city={searchQuery} 
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No travel options found. Try different cities or check our recommended destinations below.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  continent: 'all',
                  budget: 'all',
                  season: 'all',
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredDestinations.length} {filteredDestinations.length === 1 ? 'Destination' : 'Destinations'} Found
              </h2>
              <div className="text-sm text-gray-600">
                Showing {filteredDestinations.length} of {destinations.length} destinations
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination) => (
                <div 
                  key={destination.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={destination.image} 
                      alt={destination.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{destination.name}</h3>
                        <p className="text-gray-600">{destination.country}</p>
                      </div>
                      <div className="flex items-center bg-blue-100 px-2 py-1 rounded text-sm text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {destination.rating}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4">{destination.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {destination.activities.slice(0, 3).map((activity, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {activity}
                        </span>
                      ))}
                      {destination.activities.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          +{destination.activities.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">From </span>
                        <span className="text-lg font-bold text-blue-600">{destination.averagePrice}</span>
                      </div>
                      <Link to={`/destination/${destination.id}`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          Explore
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 text-center text-gray-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 TourNet · All rights reserved</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
              <Link to="/contact" className="hover:text-blue-600 transition">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Destinations; 