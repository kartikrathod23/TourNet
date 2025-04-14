import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TourPackageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    highlights: [''],
    duration: {
      days: 1,
      nights: 0
    },
    destinations: [{
      name: '',
      country: 'India',
      stayDuration: 1,
      description: '',
      activities: ['']
    }],
    price: {
      amount: 0,
      currency: 'INR',
      priceIncludes: [''],
      priceExcludes: ['']
    },
    groupSize: {
      min: 1,
      max: 20
    },
    difficulty: 'moderate',
    categories: [''],
    isActive: true,
    agentCompany: '',
    agentContactInfo: {
      phone: '',
      email: '',
      website: ''
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if user is an agent
        if (response.data.data.role !== 'agent' && response.data.data.role !== 'admin') {
          navigate('/');
          return;
        }

        // Pre-fill company name from user data
        setFormData(prev => ({
          ...prev,
          agentCompany: response.data.data.agentCompany || '',
          agentContactInfo: {
            ...prev.agentContactInfo,
            email: response.data.data.email || ''
          }
        }));
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      }
    };

    checkAuth();

    // If editing an existing package
    if (id) {
      fetchPackage();
    }
  }, [id, navigate]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:5000/api/tour-packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setFormData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching package:', error);
      setError('Failed to fetch package details. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties with dot notation (e.g., "duration.days")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    const newArray = [...formData[field]];
    newArray[index] = value;
    
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (index, field) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const handleDestinationChange = (e, index, field) => {
    const { value } = e.target;
    const newDestinations = [...formData.destinations];
    newDestinations[index] = {
      ...newDestinations[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  const addDestination = () => {
    setFormData({
      ...formData,
      destinations: [
        ...formData.destinations,
        {
          name: '',
          country: 'India',
          stayDuration: 1,
          description: '',
          activities: ['']
        }
      ]
    });
  };

  const removeDestination = (index) => {
    const newDestinations = [...formData.destinations];
    newDestinations.splice(index, 1);
    
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  const handleDestinationActivityChange = (e, destIndex, activityIndex) => {
    const { value } = e.target;
    const newDestinations = [...formData.destinations];
    const activities = [...newDestinations[destIndex].activities];
    activities[activityIndex] = value;
    
    newDestinations[destIndex] = {
      ...newDestinations[destIndex],
      activities
    };
    
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  const addDestinationActivity = (destIndex) => {
    const newDestinations = [...formData.destinations];
    newDestinations[destIndex] = {
      ...newDestinations[destIndex],
      activities: [...newDestinations[destIndex].activities, '']
    };
    
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  const removeDestinationActivity = (destIndex, activityIndex) => {
    const newDestinations = [...formData.destinations];
    const activities = [...newDestinations[destIndex].activities];
    activities.splice(activityIndex, 1);
    
    newDestinations[destIndex] = {
      ...newDestinations[destIndex],
      activities
    };
    
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Remove any empty strings from arrays
      const processedData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim() !== ''),
        categories: formData.categories.filter(c => c.trim() !== ''),
        price: {
          ...formData.price,
          priceIncludes: formData.price.priceIncludes.filter(p => p.trim() !== ''),
          priceExcludes: formData.price.priceExcludes.filter(p => p.trim() !== '')
        },
        destinations: formData.destinations.map(dest => ({
          ...dest,
          activities: dest.activities.filter(a => a.trim() !== '')
        }))
      };
      
      if (id) {
        // Update existing package
        await axios.put(`http://localhost:5000/api/tour-packages/${id}`, processedData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setLoading(false);
        navigate('/agent/dashboard');
      } else {
        // Create new package
        await axios.post('http://localhost:5000/api/tour-packages', processedData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setLoading(false);
        navigate('/agent/dashboard');
      }
    } catch (error) {
      console.error('Error saving package:', error);
      setError(error.response?.data?.message || 'Failed to save tour package. Please try again.');
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center py-8">Loading package details...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{id ? 'Edit Tour Package' : 'Create New Tour Package'}</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Package Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Highlights
            </label>
            {formData.highlights.map((highlight, index) => (
              <div key={`highlight-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleArrayChange(e, index, 'highlights')}
                  className="flex-grow border border-gray-300 rounded px-3 py-2"
                  placeholder="Add a highlight"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, 'highlights')}
                  className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  disabled={formData.highlights.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('highlights')}
              className="mt-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Add Highlight
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="duration.days">
                Days*
              </label>
              <input
                type="number"
                id="duration.days"
                name="duration.days"
                value={formData.duration.days}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="duration.nights">
                Nights*
              </label>
              <input
                type="number"
                id="duration.nights"
                name="duration.nights"
                value={formData.duration.nights}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Destinations</h2>
          
          {formData.destinations.map((destination, index) => (
            <div key={`destination-${index}`} className="p-4 mb-4 border border-gray-200 rounded">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Destination {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeDestination(index)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  disabled={formData.destinations.length <= 1}
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Destination Name*
                  </label>
                  <input
                    type="text"
                    value={destination.name}
                    onChange={(e) => handleDestinationChange(e, index, 'name')}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Country*
                  </label>
                  <input
                    type="text"
                    value={destination.country}
                    onChange={(e) => handleDestinationChange(e, index, 'country')}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Stay Duration (days)
                </label>
                <input
                  type="number"
                  value={destination.stayDuration}
                  onChange={(e) => handleDestinationChange(e, index, 'stayDuration')}
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={destination.description}
                  onChange={(e) => handleDestinationChange(e, index, 'description')}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Activities
                </label>
                {destination.activities.map((activity, actIndex) => (
                  <div key={`dest-${index}-activity-${actIndex}`} className="flex mb-2">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => handleDestinationActivityChange(e, index, actIndex)}
                      className="flex-grow border border-gray-300 rounded px-3 py-2"
                      placeholder="Add an activity"
                    />
                    <button
                      type="button"
                      onClick={() => removeDestinationActivity(index, actIndex)}
                      className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      disabled={destination.activities.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDestinationActivity(index)}
                  className="mt-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Add Activity
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addDestination}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            Add Destination
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price.amount">
                Price Amount*
              </label>
              <input
                type="number"
                id="price.amount"
                name="price.amount"
                value={formData.price.amount}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price.currency">
                Currency*
              </label>
              <select
                id="price.currency"
                name="price.currency"
                value={formData.price.currency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Price Includes
            </label>
            {formData.price.priceIncludes.map((item, index) => (
              <div key={`includes-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newPriceIncludes = [...formData.price.priceIncludes];
                    newPriceIncludes[index] = e.target.value;
                    setFormData({
                      ...formData,
                      price: {
                        ...formData.price,
                        priceIncludes: newPriceIncludes
                      }
                    });
                  }}
                  className="flex-grow border border-gray-300 rounded px-3 py-2"
                  placeholder="E.g., Accommodation, Meals, etc."
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPriceIncludes = [...formData.price.priceIncludes];
                    newPriceIncludes.splice(index, 1);
                    setFormData({
                      ...formData,
                      price: {
                        ...formData.price,
                        priceIncludes: newPriceIncludes
                      }
                    });
                  }}
                  className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  disabled={formData.price.priceIncludes.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  price: {
                    ...formData.price,
                    priceIncludes: [...formData.price.priceIncludes, '']
                  }
                });
              }}
              className="mt-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Add Item
            </button>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Price Excludes
            </label>
            {formData.price.priceExcludes.map((item, index) => (
              <div key={`excludes-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newPriceExcludes = [...formData.price.priceExcludes];
                    newPriceExcludes[index] = e.target.value;
                    setFormData({
                      ...formData,
                      price: {
                        ...formData.price,
                        priceExcludes: newPriceExcludes
                      }
                    });
                  }}
                  className="flex-grow border border-gray-300 rounded px-3 py-2"
                  placeholder="E.g., Flights, Insurance, etc."
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPriceExcludes = [...formData.price.priceExcludes];
                    newPriceExcludes.splice(index, 1);
                    setFormData({
                      ...formData,
                      price: {
                        ...formData.price,
                        priceExcludes: newPriceExcludes
                      }
                    });
                  }}
                  className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  disabled={formData.price.priceExcludes.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  price: {
                    ...formData.price,
                    priceExcludes: [...formData.price.priceExcludes, '']
                  }
                });
              }}
              className="mt-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Add Item
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="groupSize.min">
                Min Group Size
              </label>
              <input
                type="number"
                id="groupSize.min"
                name="groupSize.min"
                value={formData.groupSize.min}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="groupSize.max">
                Max Group Size
              </label>
              <input
                type="number"
                id="groupSize.max"
                name="groupSize.max"
                value={formData.groupSize.max}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="difficulty">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="difficult">Difficult</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Categories
            </label>
            {formData.categories.map((category, index) => (
              <div key={`category-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => handleArrayChange(e, index, 'categories')}
                  className="flex-grow border border-gray-300 rounded px-3 py-2"
                  placeholder="E.g., Adventure, Cultural, etc."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, 'categories')}
                  className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  disabled={formData.categories.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('categories')}
              className="mt-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Add Category
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Agent Information</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="agentCompany">
              Company Name*
            </label>
            <input
              type="text"
              id="agentCompany"
              name="agentCompany"
              value={formData.agentCompany}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="agentContactInfo.phone">
                Phone Number
              </label>
              <input
                type="text"
                id="agentContactInfo.phone"
                name="agentContactInfo.phone"
                value={formData.agentContactInfo.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="agentContactInfo.email">
                Email
              </label>
              <input
                type="email"
                id="agentContactInfo.email"
                name="agentContactInfo.email"
                value={formData.agentContactInfo.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="agentContactInfo.website">
                Website
              </label>
              <input
                type="url"
                id="agentContactInfo.website"
                name="agentContactInfo.website"
                value={formData.agentContactInfo.website}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600"
            />
            <label className="ml-2 text-gray-700 font-medium" htmlFor="isActive">
              Make this package active (visible to users)
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/agent/dashboard')}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Package' : 'Create Package')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourPackageForm; 