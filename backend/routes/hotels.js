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
    console.log('[Hotels] Getting new Amadeus access token');
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
    console.error('[Hotels] Error getting Amadeus token:', error.message);
    throw error;
  }
}

// Get coordinates for a city using Amadeus API
async function getCityCoordinates(cityName) {
  try {
    console.log(`[Hotels] Searching for city: ${cityName}`);
    
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
      console.log(`[Hotels] Found city: ${cityInfo.name}`);
      
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
    console.log('[Hotels] City not found in Amadeus, using default location (Paris)');
    return {
      lat: 48.8566,
      lon: 2.3522,
      name: cityName || 'Paris',
      country: 'France',
      iataCode: 'PAR',
      cityCode: 'PAR'
    };
  } catch (error) {
    console.error('[Hotels] Error getting city coordinates:', error.message);
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

// Get hotels using Amadeus Hotel Search API
async function getHotelsInArea(cityData) {
  try {
    console.log(`[Hotels] Searching for accommodations in: ${cityData.name}`);
    const token = await getAmadeusToken();
    
    // Try to use the Amadeus Hotel Search API if we have a city code
    if (cityData.iataCode || cityData.cityCode) {
      console.log(`[Hotels] Searching using city code: ${cityData.cityCode || cityData.iataCode}`);
      try {
        const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city', {
          params: {
            cityCode: cityData.cityCode || cityData.iataCode,
            radius: 20,
            radiusUnit: 'KM',
            hotelSource: 'ALL'
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          console.log(`[Hotels] Found ${response.data.data.length} hotels with Amadeus API`);
          
          // Convert Amadeus hotel data to our format
          const hotels = response.data.data.slice(0, 15).map((hotel, index) => {
            return {
              id: hotel.hotelId || `hotel-${index}`,
              name: hotel.name,
              highlighted_name: hotel.name,
              address: hotel.address?.lines?.join(', ') || 'Address not available',
              location: `${cityData.name}, ${cityData.country}`,
              distance: Math.round((Math.random() * 5 + 0.5) * 1000), // Random distance between 0.5-5.5 km
              kinds: 'accomodations,hotels',
              rating: (3 + Math.random() * 2).toFixed(1),
              coords: `${hotel.geoCode?.latitude || cityData.lat}, ${hotel.geoCode?.longitude || cityData.lon}`,
              description: 'Modern hotel with excellent amenities and convenient location.'
            };
          });
          
          return hotels;
        }
      } catch (error) {
        console.error('[Hotels] Error with Amadeus hotel search:', error.message);
        // Continue to fallback if Amadeus API fails
      }
    }
    
    // If Amadeus API failed or didn't return results, use generated data
    console.log('[Hotels] Using mock hotel data for', cityData.name);
    return generateMockHotels(cityData.lat, cityData.lon, cityData.name);
  } catch (error) {
    console.error('[Hotels] Error getting hotels in area:', error.message);
    return generateMockHotels(cityData.lat, cityData.lon, cityData.name);
  }
}

// Generate mock hotel data for demonstration purposes
function generateMockHotels(lat, lon, cityName) {
  console.log(`[Hotels] Generating mock hotels for ${cityName}`);
  const hotelNames = [
    'Grand Hotel Plaza', 
    'Luxury Palace', 
    'Comfort Inn', 
    'Hotel Royal', 
    'City View Hotel',
    'Park Side Resort',
    'Ocean View Inn',
    'Metropolitan Hotel',
    'The Imperial Hotel',
    'Sunset Resort & Spa'
  ];
  
  return hotelNames.map((name, index) => {
    // Add small random offsets to coordinates for variety
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lonOffset = (Math.random() - 0.5) * 0.02;
    
    return {
      id: `mock-hotel-${index}`,
      name: `${name} ${cityName}`,
      highlighted_name: `${name} ${cityName}`,
      address: `${Math.floor(Math.random() * 200) + 1} Main Street`,
      location: `${cityName} City Center`,
      distance: Math.floor(Math.random() * 2000) + 500,
      kinds: 'accomodations,hotels',
      rating: (3 + Math.random() * 2).toFixed(1),
      coords: `${(lat + latOffset).toFixed(6)}, ${(lon + lonOffset).toFixed(6)}`,
      description: 'This elegant hotel offers guests a comfortable stay with modern amenities. Located in a convenient area with easy access to attractions, restaurants, and shopping districts.'
    };
  });
}

router.get('/search', async (req, res) => {
  try {
    const city = req.query.city || 'Paris';
    console.log(`[Hotels] Received request to search hotels in: ${city}`);
    
    // First get coordinates for the city
    const cityData = await getCityCoordinates(city);
    
    if (!cityData) {
      console.log(`[Hotels] Failed to find coordinates for city: ${city}`);
      return res.status(404).json({ 
        success: false, 
        error: 'City not found. Please try another location.'
      });
    }
    
    // Then get hotels in that area
    const hotels = await getHotelsInArea(cityData);
    
    console.log(`[Hotels] Sending response with ${hotels.length} hotels for ${cityData.name}`);
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
        hotels: hotels
      }
    });
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Hotel API fetch failed', 
      message: err.message 
    });
  }
});

module.exports = router;
