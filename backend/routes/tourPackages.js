const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();
const mongoose = require('mongoose');
const TourPackage = require('../models/TourPackage');
const { protect, authorize } = require('../middleware/auth');

// Use Amadeus credentials from .env file
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID || 'DgTBGYPmUf8GxGGvfLjcqgEH4sAeFQur';
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || 'rydShJXrJSmcHRFw';
let AMADEUS_ACCESS_TOKEN = null;
let TOKEN_EXPIRY = null;

// Function to get Amadeus access token
async function getAmadeusToken() {
  try {
    // Check if we already have a valid token
    const now = new Date();
    if (AMADEUS_ACCESS_TOKEN && TOKEN_EXPIRY && now < TOKEN_EXPIRY) {
      return AMADEUS_ACCESS_TOKEN;
    }

    // Otherwise, get a new token
    console.log('[TourPackages] Getting new Amadeus access token');
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data && response.data.access_token) {
      AMADEUS_ACCESS_TOKEN = response.data.access_token;
      // Set expiry (token usually valid for 30 minutes, but we'll use 25 to be safe)
      TOKEN_EXPIRY = new Date(now.getTime() + 25 * 60000);
      return AMADEUS_ACCESS_TOKEN;
    } else {
      throw new Error('Failed to obtain Amadeus access token');
    }
  } catch (error) {
    console.error('[TourPackages] Error getting Amadeus token:', error.message);
    throw error;
  }
}

// Get coordinates for a city using Amadeus API
async function getCityCoordinates(cityName) {
  try {
    console.log(`[TourPackages] Searching for city: ${cityName}`);
    
    const token = await getAmadeusToken();

    // Use Amadeus Airport & City Search API
    const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
      params: {
        keyword: cityName,
        subType: 'CITY',
        'page[limit]': 1
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      const cityInfo = response.data.data[0];
      console.log(`[TourPackages] Found city: ${cityInfo.name}`);
      
      return {
        lat: cityInfo.geoCode?.latitude || 48.8566,
        lon: cityInfo.geoCode?.longitude || 2.3522,
        name: cityInfo.name || cityName,
        country: cityInfo.address?.countryName || 'Unknown',
        iataCode: cityInfo.iataCode || null,
        cityCode: cityInfo.cityCode || null
      };
    }
    
    // If city not found, use default data
    console.log('[TourPackages] City not found in Amadeus, using default location (Paris)');
    return {
      lat: 48.8566,
      lon: 2.3522,
      name: cityName || 'Paris',
      country: 'France',
      iataCode: 'PAR',
      cityCode: 'PAR'
    };
  } catch (error) {
    console.error('[TourPackages] Error getting city coordinates:', error.message);
    // Return default coordinates as fallback
    return {
      lat: 48.8566,
      lon: 2.3522,
      name: cityName || 'Paris',
      country: 'France',
      iataCode: 'PAR',
      cityCode: 'PAR'
    };
  }
}

// Get attractions using the Amadeus Tourist Attractions API or generate mock data
async function getAttractionsInArea(cityData) {
  try {
    console.log(`[TourPackages] Searching for attractions near ${cityData.name}`);
    
    // Try to use Amadeus Points of Interest API if we have a city code
    if (cityData.iataCode || cityData.cityCode) {
      try {
        const token = await getAmadeusToken();
        const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/pois', {
          params: {
            latitude: cityData.lat,
            longitude: cityData.lon,
            radius: 20,
            categoryGroups: 'SIGHTS,NIGHTLIFE,SHOPPING',
            'page[limit]': 30
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          console.log(`[TourPackages] Found ${response.data.data.length} attractions with Amadeus API`);
          
          // Convert to our attraction format
          return response.data.data.map((attraction, index) => {
            return {
              xid: attraction.id || `attraction-${index}`,
              name: attraction.name,
              point: {
                lat: attraction.geoCode?.latitude || cityData.lat + (Math.random() - 0.5) * 0.02,
                lon: attraction.geoCode?.longitude || cityData.lon + (Math.random() - 0.5) * 0.02
              },
              kinds: attraction.category || 'interesting_places',
              rate: (3 + Math.random() * 2).toFixed(1),
              osm: "relation:123456",
              wikidata: "Q12345"
            };
          });
        }
      } catch (error) {
        console.error('[TourPackages] Error with Amadeus attractions search:', error.message);
        // Continue to fallback
      }
    }
    
    // If Amadeus API failed or didn't return results, use generated data
    console.log('[TourPackages] Using mock attractions data for', cityData.name);
    return generateMockAttractions(cityData.lat, cityData.lon);
  } catch (error) {
    console.error('[TourPackages] Error getting attractions in area:', error.message);
    return generateMockAttractions(cityData.lat, cityData.lon);
  }
}

// Generate mock attractions for demonstration
function generateMockAttractions(lat, lon) {
  const attractionNames = [
    'City Museum', 
    'National Park', 
    'Historic Cathedral', 
    'Art Gallery', 
    'Central Square',
    'Ancient Temple',
    'Botanical Gardens',
    'Historic Quarter',
    'Castle Ruins',
    'Waterfront Promenade',
    'Royal Palace',
    'Mountain View Point',
    'Harbor District'
  ];
  
  return attractionNames.map((name, index) => {
    // Add small random offsets to coordinates for variety
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lonOffset = (Math.random() - 0.5) * 0.02;
    
    // Create a mix of attraction kinds
    const kinds = [
      'museums',
      'cultural',
      'historic',
      'architecture',
      'natural',
      'amusements',
      'industrial_facilities',
      'sport',
      'religion'
    ];
    
    // Select 1-3 random kinds
    const numKinds = Math.floor(Math.random() * 3) + 1;
    const selectedKinds = [];
    for (let i = 0; i < numKinds; i++) {
      const randomIndex = Math.floor(Math.random() * kinds.length);
      selectedKinds.push(kinds[randomIndex]);
    }
    
    return {
      xid: `mock-attraction-${index}`,
      name: name,
      point: {
        lat: lat + latOffset,
        lon: lon + lonOffset
      },
      kinds: selectedKinds.join(','),
      rate: (3 + Math.random() * 2).toFixed(1),
      osm: "relation:123456",
      wikidata: "Q12345"
    };
  });
}

// Generate tour packages based on attractions
function generateTourPackages(attractions, cityName, countryName) {
  console.log(`[TourPackages] Generating packages for ${cityName} with ${attractions.length} attractions`);
  
  // Group attractions by kind
  const kindGroups = {};
  
  attractions.forEach(attraction => {
    const kinds = attraction.kinds.split(',');
    kinds.forEach(kind => {
      if (!kindGroups[kind]) {
        kindGroups[kind] = [];
      }
      kindGroups[kind].push(attraction);
    });
  });
  
  // Create tour packages
  const packages = [];
  
  // Weekend Getaway Package
  packages.push({
    id: `pkg-${cityName.toLowerCase().replace(/\s+/g, '-')}-weekend`,
    name: `Weekend Getaway in ${cityName}`,
    description: `A perfect weekend escape to explore the highlights of ${cityName}, ${countryName}`,
    duration: '3 days, 2 nights',
    price: 12999 + Math.floor(Math.random() * 3000),
    rating: (4 + Math.random()).toFixed(1),
    inclusions: ['Hotel Stay', 'Breakfast', 'Guided Tours', 'Airport Transfer'],
    attractions: attractions.slice(0, 5).map(a => a.name)
  });
  
  // Cultural Tour Package
  const culturalAttractions = [
    ...(kindGroups['culture'] || []),
    ...(kindGroups['historic'] || []),
    ...(kindGroups['architecture'] || []),
    ...(kindGroups['museums'] || []),
    ...(kindGroups['religion'] || [])
  ].slice(0, 8);
  
  if (culturalAttractions.length >= 3) {
    packages.push({
      id: `pkg-${cityName.toLowerCase().replace(/\s+/g, '-')}-cultural`,
      name: `Cultural ${cityName} Experience`,
      description: `Immerse yourself in the rich culture and history of ${cityName}`,
      duration: '4 days, 3 nights',
      price: 18999 + Math.floor(Math.random() * 4000),
      rating: (4 + Math.random()).toFixed(1),
      inclusions: ['Premium Hotel', 'Breakfast & Dinner', 'Museum Entries', 'Cultural Shows', 'Expert Guide'],
      attractions: culturalAttractions.slice(0, 6).map(a => a.name)
    });
  }
  
  // Nature & Adventure Package
  const natureAttractions = [
    ...(kindGroups['natural'] || []),
    ...(kindGroups['beaches'] || []),
    ...(kindGroups['mountains'] || []),
    ...(kindGroups['gardens_and_parks'] || [])
  ].slice(0, 8);
  
  if (natureAttractions.length >= 2) {
    packages.push({
      id: `pkg-${cityName.toLowerCase().replace(/\s+/g, '-')}-nature`,
      name: `${cityName} Nature Escape`,
      description: `Explore the natural beauty and outdoor activities in and around ${cityName}`,
      duration: '5 days, 4 nights',
      price: 22999 + Math.floor(Math.random() * 5000),
      rating: (4 + Math.random()).toFixed(1),
      inclusions: ['Eco-friendly Accommodation', 'All Meals', 'Outdoor Activities', 'Transportation', 'Equipment Rental'],
      attractions: natureAttractions.slice(0, 6).map(a => a.name)
    });
  }
  
  // Family Tour Package
  packages.push({
    id: `pkg-${cityName.toLowerCase().replace(/\s+/g, '-')}-family`,
    name: `Family-Friendly ${cityName} Adventure`,
    description: `A perfect family vacation with activities for all ages in the beautiful ${cityName}`,
    duration: '6 days, 5 nights',
    price: 28999 + Math.floor(Math.random() * 6000),
    rating: (4 + Math.random()).toFixed(1),
    inclusions: ['Family Suite', 'Breakfast & Dinner', 'Kid-friendly Activities', 'Family Photoshoot', 'Airport Transfers'],
    attractions: attractions.slice(0, 7).map(a => a.name)
  });
  
  return packages;
}

router.get('/search', async (req, res) => {
  try {
    const city = req.query.city || 'Paris';
    console.log(`[TourPackages] Received request for packages in: ${city}`);
    
    // First get coordinates for the city
    const cityData = await getCityCoordinates(city);
    
    if (!cityData) {
      console.log(`[TourPackages] Failed to find coordinates for city: ${city}`);
      return res.status(404).json({ 
        success: false, 
        error: 'City not found. Please try another location.'
      });
    }
    
    // Then get attractions in that area
    const attractions = await getAttractionsInArea(cityData);
    
    // Generate tour packages based on attractions
    const packages = generateTourPackages(attractions, cityData.name, cityData.country);
    console.log(`[TourPackages] Generated ${packages.length} packages for ${cityData.name}`);
    
    res.json({
      success: true,
      data: {
        location: {
          name: cityData.name,
          country: cityData.country,
          coordinates: {
            lat: cityData.lat,
            lon: cityData.lon
          }
        },
        packages: packages
      }
    });
  } catch (err) {
    console.error('[TourPackages] API error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Tour packages API fetch failed', 
      message: err.message 
    });
  }
});

// @desc    Get all tour packages
// @route   GET /api/tour-packages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      duration, 
      minPrice, 
      maxPrice, 
      difficulty, 
      category,
      destination,
      sort
    } = req.query;

    // Build query
    const query = {};

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by duration
    if (duration) {
      const days = parseInt(duration);
      query['duration.days'] = { $lte: days };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.amount = { ...query.price.amount, $gte: parseInt(minPrice) };
      if (maxPrice) query.price.amount = { ...query.price.amount, $lte: parseInt(maxPrice) };
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by category
    if (category) {
      query.categories = { $in: [category] };
    }

    // Filter by destination
    if (destination) {
      query['destinations.name'] = { $regex: new RegExp(destination, 'i') };
    }

    // Only active packages for public view
    query.isActive = true;

    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (sort === 'price-low') {
      sortOption = { 'price.amount': 1 };
    } else if (sort === 'price-high') {
      sortOption = { 'price.amount': -1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'popularity') {
      sortOption = { bookingCount: -1 };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await TourPackage.countDocuments(query);
    
    const packages = await TourPackage.find(query)
      .sort(sortOption)
      .skip(startIndex)
      .limit(limit)
      .populate('createdBy', 'fullName email')
      .lean();

    // Add pagination info
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      perPage: limit
    };

    res.status(200).json({
      success: true,
      count: packages.length,
      pagination,
      data: packages
    });

  } catch (error) {
    console.error('Error getting tour packages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single tour package
// @route   GET /api/tour-packages/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id)
      .populate('createdBy', 'fullName email agentCompany')
      .populate('reviews');

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tourPackage
    });
  } catch (error) {
    console.error('Error getting tour package:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new tour package
// @route   POST /api/tour-packages
// @access  Private (agent, admin)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is agent or admin
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tour agents and admins can create packages'
      });
    }

    // Add user ID to request body
    req.body.createdBy = req.user.id;

    // Create tour package
    const tourPackage = await TourPackage.create(req.body);

    res.status(201).json({
      success: true,
      data: tourPackage
    });
  } catch (error) {
    console.error('Error creating tour package:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update tour package
// @route   PUT /api/tour-packages/:id
// @access  Private (owner agent, admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let tourPackage = await TourPackage.findById(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    // Check if user is the creator or an admin
    if (tourPackage.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tour package'
      });
    }

    // Prevent changing the creator
    if (req.body.createdBy) {
      delete req.body.createdBy;
    }

    // Update the package
    tourPackage = await TourPackage.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: tourPackage
    });
  } catch (error) {
    console.error('Error updating tour package:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete tour package
// @route   DELETE /api/tour-packages/:id
// @access  Private (owner agent, admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    // Check if user is the creator or an admin
    if (tourPackage.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tour package'
      });
    }

    await tourPackage.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting tour package:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get packages by agent
// @route   GET /api/tour-packages/agent/:agentId
// @access  Public
router.get('/agent/:agentId', async (req, res) => {
  try {
    // Validate if agentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    const packages = await TourPackage.find({ 
      createdBy: req.params.agentId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    console.error('Error getting agent packages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get my packages (as an agent)
// @route   GET /api/tour-packages/my-packages
// @access  Private (agent)
router.get('/my-packages', protect, async (req, res) => {
  try {
    // Check if user is agent
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted to tour agents and admins'
      });
    }

    const packages = await TourPackage.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    console.error('Error getting my packages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 