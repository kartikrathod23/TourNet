const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

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
    console.log('[TravelOptions] Getting new Amadeus access token');
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
    console.error('[TravelOptions] Error getting Amadeus token:', error.message);
    throw error;
  }
}

// Get city data using Amadeus API
async function getCityData(cityName) {
  try {
    console.log(`[TravelOptions] Searching for city: ${cityName}`);
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
      console.log(`[TravelOptions] Found city: ${cityInfo.name}`);

      return {
        lat: cityInfo.geoCode?.latitude || 48.8566,
        lon: cityInfo.geoCode?.longitude || 2.3522,
        name: cityInfo.name || cityName,
        country: cityInfo.address?.countryName || 'Unknown',
        population: 500000, // Amadeus doesn't provide population data
        iataCode: cityInfo.iataCode || null,
        cityCode: cityInfo.cityCode || null
      };
    }

    // If city not found, use default data
    console.log('[TravelOptions] City not found in Amadeus, using default location (Paris)');
    return {
      lat: 48.8566,
      lon: 2.3522,
      name: cityName || 'Paris',
      country: 'France',
      population: 2000000,
      iataCode: 'PAR',
      cityCode: 'PAR'
    };
  } catch (error) {
    console.error('[TravelOptions] Error getting city data:', error.message);
    // Return default coordinates as fallback
    return {
      lat: 48.8566,
      lon: 2.3522,
      name: cityName || 'Paris',
      country: 'France',
      population: 2000000,
      iataCode: 'PAR',
      cityCode: 'PAR'
    };
  }
}

// Get local transport options based on city characteristics
async function getTransportOptions(cityData) {
  console.log(`[TravelOptions] Generating transport options for ${cityData.name}`);
  
  // Base options available for all locations
  const baseOptions = [
    {
      id: `tr-taxi-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'Taxi',
      name: 'Standard Taxi',
      description: `Comfortable sedan for exploring ${cityData.name} and surroundings`,
      price: 2000 + Math.floor(Math.random() * 1000),
      currency: 'INR',
      unit: 'per day',
      capacity: 4,
      features: ['AC', 'GPS Navigation', 'Mineral Water', 'Local Driver']
    },
    {
      id: `tr-suv-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'SUV',
      name: 'Premium SUV',
      description: `Spacious SUV for comfortable travel around ${cityData.name}`,
      price: 3500 + Math.floor(Math.random() * 1500),
      currency: 'INR',
      unit: 'per day',
      capacity: 6,
      features: ['AC', 'GPS Navigation', 'Mineral Water', 'Entertainment System', 'Spacious Luggage']
    }
  ];
  
  // Additional options based on city characteristics
  const additionalOptions = [];
  
  // Big cities with good public transport
  if (cityData.population > 500000) {
    console.log(`[TravelOptions] Adding public transport for large city (population: ${cityData.population})`);
    additionalOptions.push({
      id: `tr-metro-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'Public Transport',
      name: 'Public Transport Pass',
      description: `Unlimited access to public transportation in ${cityData.name}`,
      price: 150 + Math.floor(Math.random() * 100),
      currency: 'INR',
      unit: 'per day',
      capacity: 1,
      features: ['Convenient', 'Eco-friendly', 'Access to All Areas', 'Avoid Traffic']
    });
  }
  
  // For coastal cities (by known locations or country characteristics)
  const coastalCountries = ['Australia', 'Italy', 'Greece', 'Spain', 'Portugal', 'Mexico', 'Brazil', 'Thailand', 'Indonesia', 'Philippines', 'USA'];
  const beachCities = ['miami', 'bali', 'phuket', 'cancun', 'hawaii', 'maldives', 'goa', 'barcelona', 'nice', 'santorini', 'rio'];
  
  if (coastalCountries.includes(cityData.country) || 
      beachCities.some(city => cityData.name.toLowerCase().includes(city))) {
    console.log(`[TravelOptions] Adding beach transport options for coastal city: ${cityData.name}`);
    additionalOptions.push({
      id: `tr-scooter-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'Two Wheeler',
      name: 'Beach Scooter Rental',
      description: `Explore the beautiful beaches of ${cityData.name} at your leisure`,
      price: 500 + Math.floor(Math.random() * 300),
      currency: 'INR',
      unit: 'per day',
      capacity: 2,
      features: ['Helmet Included', 'Fuel Efficient', 'Easy Parking', 'Fun Way to Travel']
    });
    
    additionalOptions.push({
      id: `tr-boat-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'Boat',
      name: `${cityData.name} Beach Cruise`,
      description: `Enjoy the scenic coastline of ${cityData.name} with our popular boat tour`,
      price: 1500 + Math.floor(Math.random() * 800),
      currency: 'INR',
      unit: 'per person',
      capacity: 1,
      features: ['Stunning Views', 'Professional Captain', 'Refreshments', 'Snorkeling Equipment']
    });
  }
  
  // For mountain cities (by known locations or country characteristics)
  const mountainCountries = ['Switzerland', 'Nepal', 'Austria', 'New Zealand', 'Canada', 'Norway'];
  const mountainCities = ['shimla', 'manali', 'darjeeling', 'switzerland', 'alps', 'aspen', 'denver', 'himalaya', 'andes', 'pokhara', 'innsbruck', 'chamonix'];
  
  if (mountainCountries.includes(cityData.country) || 
      mountainCities.some(city => cityData.name.toLowerCase().includes(city))) {
    console.log(`[TravelOptions] Adding mountain transport options for: ${cityData.name}`);
    additionalOptions.push({
      id: `tr-jeep-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'Off-road',
      name: 'Mountain Explorer Jeep',
      description: `Experience the breathtaking mountain views around ${cityData.name}`,
      price: 3500 + Math.floor(Math.random() * 1500),
      currency: 'INR',
      unit: 'per day',
      capacity: 4,
      features: ['Experienced Mountain Guide', 'All-Terrain 4x4', 'Picnic Lunch', 'Photo Stops']
    });
  }
  
  // For all destinations, add a tempo traveller option
  additionalOptions.push({
    id: `tr-tempo-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'Tempo Traveller',
    name: 'Tempo Traveller',
    description: `Perfect for group travel around ${cityData.name} and nearby attractions`,
    price: 5500 + Math.floor(Math.random() * 2000),
    currency: 'INR',
    unit: 'per day',
    capacity: 12,
    features: ['AC', 'Reclining Seats', 'Ample Luggage Space', 'Professional Driver']
  });
  
  // Special option for international destinations
  if (cityData.country !== 'India') {
    additionalOptions.push({
      id: `tr-car-rental-${cityData.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'Self-Drive',
      name: 'Car Rental',
      description: `Explore ${cityData.name} on your own schedule with our reliable car rental`,
      price: 3000 + Math.floor(Math.random() * 2000),
      currency: 'INR',
      unit: 'per day',
      capacity: 5,
      features: ['Insurance Included', 'GPS Navigation', 'Unlimited Mileage', '24/7 Roadside Assistance']
    });
  }
  
  const result = [...additionalOptions, ...baseOptions];
  console.log(`[TravelOptions] Generated ${result.length} travel options for ${cityData.name}`);
  return result;
}

router.get('/search', async (req, res) => {
  try {
    const city = req.query.city || 'Paris';
    console.log(`[TravelOptions] Received request for travel options in: ${city}`);
    
    // Get city data
    const cityData = await getCityData(city);
    
    if (!cityData) {
      console.log(`[TravelOptions] Failed to find coordinates for city: ${city}`);
      return res.status(404).json({ 
        success: false, 
        error: 'City not found. Please try another location.' 
      });
    }
    
    // Get transport options based on city characteristics
    const travelOptions = await getTransportOptions(cityData);
    
    console.log(`[TravelOptions] Sending response with ${travelOptions.length} travel options for ${cityData.name}`);
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
        travelOptions: travelOptions
      }
    });
  } catch (err) {
    console.error('[TravelOptions] API error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Travel options API fetch failed', 
      message: err.message 
    });
  }
});

module.exports = router; 