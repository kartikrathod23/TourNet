import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TourPackageCard from '../components/TourPackageCard';
import { FaFilter, FaSort, FaSearch, FaSpinner } from 'react-icons/fa';

const TourPackages = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    difficulty: '',
    category: '',
    destination: ''
  });
  
  // Sort state
  const [sortOption, setSortOption] = useState('newest');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchPackages();
  }, [pagination.currentPage, sortOption]);
  
  useEffect(() => {
    // Apply filters locally (for immediate feedback)
    if (packages.length > 0) {
      let filtered = [...packages];
      
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(pkg => 
          pkg.title.toLowerCase().includes(searchTerm) || 
          pkg.description.toLowerCase().includes(searchTerm) ||
          pkg.destinations.some(dest => dest.name.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply price filters
      if (filters.minPrice) {
        filtered = filtered.filter(pkg => pkg.price.amount >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(pkg => pkg.price.amount <= parseInt(filters.maxPrice));
      }
      
      // Apply duration filter
      if (filters.duration) {
        const days = parseInt(filters.duration);
        filtered = filtered.filter(pkg => pkg.duration.days <= days);
      }
      
      // Apply difficulty filter
      if (filters.difficulty) {
        filtered = filtered.filter(pkg => pkg.difficulty === filters.difficulty);
      }
      
      // Apply category filter
      if (filters.category) {
        filtered = filtered.filter(pkg => 
          pkg.categories && pkg.categories.includes(filters.category)
        );
      }
      
      // Apply destination filter
      if (filters.destination) {
        const destTerm = filters.destination.toLowerCase();
        filtered = filtered.filter(pkg => 
          pkg.destinations.some(dest => 
            dest.name.toLowerCase().includes(destTerm) || 
            dest.country.toLowerCase().includes(destTerm)
          )
        );
      }
      
      setFilteredPackages(filtered);
    }
  }, [filters, packages]);
  
  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.currentPage);
      params.append('limit', 12); // Items per page
      
      // Add sort parameter
      if (sortOption === 'price-low') {
        params.append('sort', 'price-low');
      } else if (sortOption === 'price-high') {
        params.append('sort', 'price-high');
      } else if (sortOption === 'rating') {
        params.append('sort', 'rating');
      } else if (sortOption === 'popularity') {
        params.append('sort', 'popularity');
      }
      // Default is 'newest' which is handled by the API
      
      const response = await axios.get(`http://localhost:5000/api/tour-packages?${params.toString()}`);
      
      if (response.data.success) {
        setPackages(response.data.data);
        setFilteredPackages(response.data.data);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.pages,
          totalItems: response.data.pagination.total
        });
      } else {
        setError('Failed to fetch tour packages');
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('An error occurred while fetching tour packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Server-side search would be implemented here
    fetchPackages();
  };
  
  const handleApplyFilters = () => {
    fetchPackages();
    setShowFilters(false);
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      difficulty: '',
      category: '',
      destination: ''
    });
    fetchPackages();
  };
  
  const getCommonCategories = () => {
    // Extract unique categories from all packages
    const categories = new Set();
    packages.forEach(pkg => {
      if (pkg.categories) {
        pkg.categories.forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories);
  };
  
  const getUniqueDurations = () => {
    const durations = packages.map(pkg => pkg.duration.days);
    return [...new Set(durations)].sort((a, b) => a - b);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tour Packages</h1>
        
        {/* User is an agent or admin, show create button */}
        {localStorage.getItem('token') && (
          <Link 
            to="/agent/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Agent Dashboard
          </Link>
        )}
      </div>
      
      {/* Search and Filter section */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex mb-4 md:mb-0">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search packages..."
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
            >
              <FaSearch />
            </button>
          </form>
          
          <div className="flex gap-2">
            {/* Sort dropdown */}
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-gray-700">
                <FaSort className="inline mr-1" /> Sort:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
            
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 flex items-center"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
          </div>
        </div>
        
        {/* Expanded filters panel */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Duration (days)</label>
                <select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="3">Up to 3 days</option>
                  <option value="5">Up to 5 days</option>
                  <option value="7">Up to 7 days</option>
                  <option value="10">Up to 10 days</option>
                  <option value="15">Up to 15 days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {getCommonCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  placeholder="City or country"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-blue-600 text-4xl inline-block" />
          <p className="mt-2 text-gray-600">Loading tour packages...</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-gray-600 mb-4">
            Showing {filteredPackages.length} of {pagination.totalItems} packages
          </p>
          
          {/* Packages grid */}
          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPackages.map(tourPackage => (
                <div key={tourPackage._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                  <TourPackageCard tourPackage={tourPackage} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No tour packages found matching your criteria.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`mx-1 px-3 py-1 rounded ${
                  pagination.currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`mx-1 px-3 py-1 rounded ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TourPackages; 