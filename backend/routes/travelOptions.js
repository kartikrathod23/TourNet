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

// Get transport options for a given city
async function getTransportOptions(cityData) {
  const { name, country, population, lat, lon } = cityData;
  console.log(`[TravelOptions] Generating transport options for ${name}, ${country}`);
  
  // Gather all transport options
  const trainOptions = getTrainOptions(cityData);
  const busOptions = getBusOptions(cityData);
  const carRentalOptions = getCarRentalOptions(cityData);
  const specialOptions = getSpecialTransportOptions(cityData);
  
  // Get flight options asynchronously
  const flightOptions = await getFlightOptions(cityData);
  
  // Combine all options
  return [...trainOptions, ...flightOptions, ...busOptions, ...carRentalOptions, ...specialOptions];
}

// Generate train options based on city and country
function getTrainOptions(cityData) {
  const { name, country, population } = cityData;
  const options = [];
  
  // Major train operators by country
  const trainOperators = {
    "France": ["SNCF", "Eurostar", "Thalys"],
    "Germany": ["Deutsche Bahn", "ICE", "Flixbus Train"],
    "Italy": ["Trenitalia", "Italo", "Frecciarossa"],
    "Spain": ["Renfe", "AVE", "OUIGO España"],
    "UK": ["National Rail", "LNER", "Great Western Railway"],
    "Japan": ["JR Group", "Shinkansen", "Tokyo Metro"],
    "India": ["Indian Railways", "Rajdhani Express", "Shatabdi Express"],
    "China": ["China Railways", "CR High-speed", "Beijing Subway"],
    "USA": ["Amtrak", "Acela Express", "Northeast Regional"],
    "Canada": ["VIA Rail", "The Canadian", "Rocky Mountaineer"]
  };
  
  // Default operators for countries not in the list
  const defaultOperators = ["National Railways", "Express Rail", "Regional Rail"];
  
  // Get operators for this country
  const operators = trainOperators[country] || defaultOperators;
  
  // High-speed train for big cities (population > 500,000)
  if (population > 500000) {
    const operator = operators[0];
    options.push({
      type: "train",
      name: `${operator} High-Speed Service`,
      description: `Fast train service connecting ${name} to major cities`,
      price: { amount: 3750, currency: "INR" },
      duration: "Varies by destination",
      frequency: "Multiple daily departures"
    });
  }
  
  // Regional train for all cities
  options.push({
    type: "train",
    name: `${operators[operators.length > 1 ? 1 : 0]} Regional Service`,
    description: `Regular train service to surrounding regions from ${name}`,
    price: { amount: 2100, currency: "INR" },
    duration: "Varies by destination",
    frequency: "Hourly departures during daytime"
  });
  
  // Special rail passes for tourist destinations
  const touristCountries = ["France", "Italy", "Japan", "Switzerland", "Austria"];
  if (touristCountries.includes(country)) {
    options.push({
      type: "train",
      name: `${country} Rail Pass`,
      description: `Unlimited train travel throughout ${country} for tourists`,
      price: { amount: 15000, currency: "INR" },
      duration: "3, 5, or 7 day options",
      frequency: "Valid on most trains with seat reservation"
    });
  }
  
  return options;
}

// Generate flight options based on city data
async function getFlightOptions(cityData) {
  const { name, country, population } = cityData;
  const options = [];
  
  // Only create flight options for cities likely to have airports
  if (population < 100000) {
    return options;
  }
  
  // Try to get real flight data from SkyScanner API if API key is available
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const SKYSCANNER_HOST = process.env.SKYSCANNER_HOST || 'skyscanner50.p.rapidapi.com';
  
  if (RAPIDAPI_KEY) {
    try {
      console.log(`[TravelOptions] Searching for flights via Skyscanner API for ${name}`);
      
      // Get airport codes for origin city
      const airportsResponse = await axios.get('https://skyscanner50.p.rapidapi.com/api/v1/searchAirport', {
        params: {
          query: name
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': SKYSCANNER_HOST
        }
      });
      
      if (airportsResponse.data && 
          airportsResponse.data.data && 
          airportsResponse.data.data.length > 0) {
        
        // Get the first airport for the city
        const airport = airportsResponse.data.data[0];
        const originCode = airport.iataCode;
        
        console.log(`[TravelOptions] Found airport code ${originCode} for ${name}`);
        
        // Define popular destinations to search for flights
        const popularDestinations = [
          {code: 'LON', name: 'London'},
          {code: 'NYC', name: 'New York'},
          {code: 'PAR', name: 'Paris'},
          {code: 'DXB', name: 'Dubai'},
          {code: 'SIN', name: 'Singapore'},
          {code: 'BKK', name: 'Bangkok'},
          {code: 'TYO', name: 'Tokyo'},
          {code: 'SYD', name: 'Sydney'}
        ];
        
        // Filter out the origin city if it's in the list
        const destinations = popularDestinations.filter(
          dest => dest.name.toLowerCase() !== name.toLowerCase()
        ).slice(0, 3); // Limit to 3 destinations to avoid API rate limits
        
        // Get departure date (30 days from now)
        const departureDate = getFormattedDate(30);
        
        // Get flight information for each destination
        const flightPromises = destinations.map(async destination => {
          try {
            const flightsResponse = await axios.get('https://skyscanner50.p.rapidapi.com/api/v1/searchFlights', {
              params: {
                origin: originCode,
                destination: destination.code,
                date: departureDate,
                adults: '1',
                currency: 'INR',
                countryCode: 'IN',
                market: 'en-IN'
              },
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': SKYSCANNER_HOST
              }
            });
            
            if (flightsResponse.data && 
                flightsResponse.data.data && 
                flightsResponse.data.data.length > 0) {
              
              // Get cheapest flight
              const flight = flightsResponse.data.data[0];
              
              // Add to our flight options
              return {
                type: "flight",
                name: `${flight.airlines[0].name} to ${destination.name}`,
                description: `Flight from ${name} (${originCode}) to ${destination.name} (${destination.code})`,
                price: {
                  amount: Math.round(flight.price.amount),
                  currency: flight.price.currency || "INR"
                },
                duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
                frequency: "Daily flights available",
                details: {
                  airline: flight.airlines[0].name,
                  flightNumber: flight.flight_number || "Various",
                  departureTime: flight.departure_time || "Various times",
                  arrivalTime: flight.arrival_time || "Various times",
                  stops: flight.stops || 0
                }
              };
            }
            return null;
          } catch (error) {
            console.error(`[TravelOptions] Error getting flights to ${destination.name}:`, error.message);
            return null;
          }
        });
        
        // Wait for all flight lookups and filter out null results
        const flightResults = (await Promise.all(flightPromises)).filter(result => result !== null);
        
        // Add results to options
        options.push(...flightResults);
        
        if (options.length > 0) {
          console.log(`[TravelOptions] Found ${options.length} real flights via Skyscanner`);
          return options;
        }
      }
    } catch (error) {
      console.error('[TravelOptions] Error with Skyscanner API:', error.message);
      // Continue to fallback flight options
    }
  }
  
  // If API call failed or no key available, use our previous flight generation code
  console.log(`[TravelOptions] Using generated flight options for ${name}`);
  
  // Generate IATA code based on city name
  const getIATACode = (cityName) => {
    // Real IATA codes for major cities
    const knownCodes = {
      "London": "LHR", "Paris": "CDG", "New York": "JFK", "Tokyo": "HND",
      "Berlin": "BER", "Rome": "FCO", "Madrid": "MAD", "Amsterdam": "AMS",
      "Dubai": "DXB", "Singapore": "SIN", "Sydney": "SYD", "Toronto": "YYZ",
      "Bangkok": "BKK", "Hong Kong": "HKG", "Los Angeles": "LAX", "Chicago": "ORD",
      "Mumbai": "BOM", "Delhi": "DEL", "Istanbul": "IST", "Moscow": "SVO",
      "Beijing": "PEK", "Shanghai": "PVG", "San Francisco": "SFO", "Miami": "MIA"
    };
    
    if (knownCodes[cityName]) return knownCodes[cityName];
    
    // Create a pseudo-code for unknown cities
    const words = cityName.split(' ');
    if (words.length === 1) {
      return cityName.slice(0, 3).toUpperCase();
    } else {
      return words.map(word => word.charAt(0)).join('').toUpperCase();
    }
  };
  
  // Regional airlines by continent/region
  const regionalAirlines = {
    "Europe": ["Lufthansa", "Air France", "British Airways", "KLM", "Ryanair", "EasyJet"],
    "North America": ["American Airlines", "Delta", "United", "Air Canada", "Southwest", "JetBlue"],
    "Asia": ["ANA", "Singapore Airlines", "Cathay Pacific", "Thai Airways", "JAL", "AirAsia"],
    "Middle East": ["Emirates", "Qatar Airways", "Etihad Airways", "Turkish Airlines", "Saudia"],
    "Africa": ["Ethiopian Airlines", "Kenya Airways", "South African Airways", "EgyptAir", "Royal Air Maroc"],
    "Oceania": ["Qantas", "Air New Zealand", "Virgin Australia", "Fiji Airways"],
    "South America": ["LATAM", "Avianca", "Gol", "Azul", "Aerolineas Argentinas"]
  };
  
  // Map countries to regions for airline selection
  const countryToRegion = {
    "USA": "North America", "Canada": "North America", "Mexico": "North America",
    "UK": "Europe", "France": "Europe", "Germany": "Europe", "Italy": "Europe", "Spain": "Europe",
    "Japan": "Asia", "China": "Asia", "India": "Asia", "Thailand": "Asia", "Vietnam": "Asia",
    "Australia": "Oceania", "New Zealand": "Oceania",
    "Brazil": "South America", "Argentina": "South America", "Colombia": "South America",
    "Egypt": "Africa", "South Africa": "Africa", "Kenya": "Africa", "Morocco": "Africa",
    "UAE": "Middle East", "Saudi Arabia": "Middle East", "Qatar": "Middle East"
  };
  
  const region = countryToRegion[country] || "Europe";
  const airlines = regionalAirlines[region] || regionalAirlines["Europe"];
  
  const mainAirline = airlines[0];
  const budgetAirline = airlines[airlines.length > 4 ? 4 : 0];
  const iataCode = getIATACode(name);
  
  // International flights for larger cities
  if (population > 500000) {
    options.push({
      type: "flight",
      name: `${mainAirline} International Flights`,
      description: `Regular flights from ${name} (${iataCode}) to major international destinations`,
      price: { amount: 29000, currency: "INR" },
      duration: "Varies by destination",
      frequency: "Daily flights to major hubs"
    });
  }
  
  // Domestic flights for all cities with airports
  options.push({
    type: "flight",
    name: `${mainAirline} Domestic Flights`,
    description: `Regular flights from ${name} (${iataCode}) to other cities in ${country}`,
    price: { amount: 10000, currency: "INR" },
    duration: "1-2 hours average",
    frequency: "Multiple daily flights"
  });
  
  // Budget airline options for popular tourist destinations
  if (population > 200000) {
    options.push({
      type: "flight",
      name: `${budgetAirline} Budget Flights`,
      description: `Affordable flights from ${name} with limited services`,
      price: { amount: 6200, currency: "INR" },
      duration: "Varies by destination",
      frequency: "Several weekly flights to popular destinations"
    });
  }
  
  return options;
}

// Helper function to get dates in YYYY-MM-DD format
function getFormattedDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Generate bus options based on city data
function getBusOptions(cityData) {
  const { name, country, population } = cityData;
  const options = [];
  
  // Major bus companies by country/region
  const busCompanies = {
    "USA": ["Greyhound", "Megabus", "FlixBus USA"],
    "UK": ["National Express", "Megabus UK", "Stagecoach"],
    "Germany": ["FlixBus", "BlaBlaBus", "Eurolines"],
    "France": ["OUIBUS", "FlixBus France", "Eurolines France"],
    "Spain": ["ALSA", "Avanza", "FlixBus Spain"],
    "Italy": ["FlixBus Italy", "MarinoBus", "Itabus"],
    "India": ["Redbus", "KSRTC", "MSRTC"],
    "Thailand": ["Transport Co.", "Nakhonchai Air", "Sombat Tour"]
  };
  
  // Default companies for countries not in the list
  const defaultCompanies = ["National Bus", "Express Coach", "City Connect"];
  
  // Get companies for this country
  const companies = busCompanies[country] || defaultCompanies;
  const mainCompany = companies[0];
  
  // City bus tours
  options.push({
    type: "bus",
    name: `${name} City Bus Tour`,
    description: `Hop-on hop-off sightseeing bus tour around the main attractions of ${name}`,
    price: { amount: 1800, currency: "INR" },
    duration: "1-day pass (24 hours)",
    frequency: "Buses every 15-30 minutes on circular route"
  });
  
  // Intercity bus service for all cities
  options.push({
    type: "bus",
    name: `${mainCompany} Intercity Coach Service`,
    description: `Regular coach services connecting ${name} with other cities`,
    price: { amount: 1250, currency: "INR" },
    duration: "Varies by destination",
    frequency: "Multiple daily departures from central bus station"
  });
  
  // Night bus option for larger cities or tourist routes
  if (population > 200000) {
    options.push({
      type: "bus",
      name: `${companies[1] || mainCompany} Night Coach Service`,
      description: `Overnight coach travel from ${name} to major destinations`,
      price: { amount: 2900, currency: "INR" },
      duration: "Overnight (8-12 hours)",
      frequency: "Daily evening departures"
    });
  }
  
  return options;
}

// Generate car rental options
function getCarRentalOptions(cityData) {
  const { name, population } = cityData;
  const options = [];
  
  // Major car rental companies
  const rentalCompanies = ["Hertz", "Avis", "Enterprise", "Budget", "Sixt", "Europcar"];
  const company1 = rentalCompanies[0];
  const company2 = rentalCompanies[1];
  
  // Basic rental option (economy car)
  options.push({
    type: "car_rental",
    name: `${company1} Compact Car Rental`,
    description: `Affordable compact car rental in ${name} with unlimited mileage`,
    price: { amount: 2900, currency: "INR" },
    duration: "Per day",
    frequency: "Available for pickup at airports and city locations"
  });
  
  // SUV rental (for larger cities or tourist destinations)
  if (population > 500000) {
    options.push({
      type: "car_rental",
      name: `${company2} SUV Rental`,
      description: `Comfortable SUV rental for exploring ${name} and surrounding areas`,
      price: { amount: 5800, currency: "INR" },
      duration: "Per day",
      frequency: "Available at major rental locations"
    });
  }
  
  // Luxury car rental for high-end tourist destinations
  const luxuryDestinations = ["Paris", "Monaco", "Dubai", "Los Angeles", "Miami", "Cannes", "Milan"];
  if (luxuryDestinations.includes(name)) {
    options.push({
      type: "car_rental",
      name: "Luxury Vehicle Rental",
      description: `Premium car rental experience in ${name} with high-end vehicles`,
      price: { amount: 12500, currency: "INR" },
      duration: "Per day",
      frequency: "Reservation required, available at select locations"
    });
  }
  
  return options;
}

// Generate special transport options based on city
function getSpecialTransportOptions(cityData) {
  const { name, country, population } = cityData;
  const options = [];
  
  // City-specific unique transport options
  const citySpecificTransport = {
    "Venice": [{
      type: "boat",
      name: "Gondola Ride",
      description: "Traditional Venetian gondola experience through the canals",
      price: { amount: 80, currency: "USD" },
      duration: "30 minutes",
      frequency: "Available throughout the day at multiple locations"
    }, {
      type: "boat",
      name: "Vaporetto Water Bus",
      description: "Public water bus transportation along the Grand Canal and to outlying islands",
      price: { amount: 7.5, currency: "USD" },
      duration: "Single trip or day pass",
      frequency: "Regular service throughout the day"
    }],
    "Amsterdam": [{
      type: "boat",
      name: "Canal Cruise",
      description: "Scenic boat tour through Amsterdam's historic canals",
      price: { amount: 18, currency: "USD" },
      duration: "1 hour",
      frequency: "Departures every 30 minutes from central locations"
    }],
    "Dubai": [{
      type: "boat",
      name: "Abra Water Taxi",
      description: "Traditional wooden boat crossing the Dubai Creek",
      price: { amount: 1, currency: "USD" },
      duration: "5-10 minutes",
      frequency: "Continuous service throughout the day"
    }, {
      type: "special",
      name: "Desert Safari",
      description: "Exciting 4x4 journey through the desert dunes outside Dubai",
      price: { amount: 85, currency: "USD" },
      duration: "6 hours",
      frequency: "Morning and afternoon departures with hotel pickup"
    }],
    "Bangkok": [{
      type: "boat",
      name: "Chao Phraya River Boat",
      description: "River boat service along Bangkok's main waterway",
      price: { amount: 2, currency: "USD" },
      duration: "Varies by distance",
      frequency: "Regular service throughout the day"
    }, {
      type: "special",
      name: "Tuk Tuk City Tour",
      description: "Explore Bangkok in a traditional three-wheeled Tuk Tuk",
      price: { amount: 15, currency: "USD" },
      duration: "2-3 hours",
      frequency: "Available throughout the day"
    }],
    "New York": [{
      type: "ferry",
      name: "Staten Island Ferry",
      description: "Free ferry service between Manhattan and Staten Island with views of the Statue of Liberty",
      price: { amount: 0, currency: "USD" },
      duration: "25 minutes each way",
      frequency: "Departures every 30 minutes"
    }],
    "San Francisco": [{
      type: "tram",
      name: "Cable Car Ride",
      description: "Historic cable car system through the hills of San Francisco",
      price: { amount: 8, currency: "USD" },
      duration: "Varies by route",
      frequency: "Regular service on three lines"
    }],
    "Tokyo": [{
      type: "train",
      name: "Tokyo Metro Day Pass",
      description: "Unlimited access to Tokyo's extensive subway network",
      price: { amount: 10, currency: "USD" },
      duration: "24 hours",
      frequency: "Trains run frequently from early morning until midnight"
    }],
    "Kyoto": [{
      type: "rickshaw",
      name: "Arashiyama Rickshaw Tour",
      description: "Traditional pulled rickshaw tour through scenic Arashiyama district",
      price: { amount: 30, currency: "USD" },
      duration: "30 minutes",
      frequency: "Available daily, weather permitting"
    }],
    "Rio de Janeiro": [{
      type: "cable_car",
      name: "Sugarloaf Mountain Cable Car",
      description: "Scenic cable car ride to the top of Sugarloaf Mountain with panoramic views",
      price: { amount: 25, currency: "USD" },
      duration: "Two sections, approximately 3-4 minutes each",
      frequency: "Departures every 20 minutes"
    }]
  };
  
  // Add city-specific transport
  if (citySpecificTransport[name]) {
    options.push(...citySpecificTransport[name]);
  }
  
  // Transport options based on country
  const countryTransport = {
    "Thailand": [{
      type: "special",
      name: "Long-tail Boat Tour",
      description: "Traditional wooden boat excursion to islands and coastal areas",
      price: { amount: 25, currency: "USD" },
      duration: "Half day",
      frequency: "Daily departures, weather permitting"
    }],
    "India": [{
      type: "special",
      name: "Auto Rickshaw",
      description: "Three-wheeled motorized transport common throughout Indian cities",
      price: { amount: 3, currency: "USD" },
      duration: "Varies by distance",
      frequency: "Available throughout the day"
    }],
    "Vietnam": [{
      type: "special",
      name: "Cyclo Ride",
      description: "Traditional Vietnamese cycle rickshaw tour through city streets",
      price: { amount: 10, currency: "USD" },
      duration: "1 hour",
      frequency: "Available in main tourist areas"
    }],
    "Egypt": [{
      type: "special",
      name: "Felucca Sail Boat",
      description: "Traditional wooden sailing boat on the Nile River",
      price: { amount: 20, currency: "USD" },
      duration: "1-2 hours",
      frequency: "Daily sailings, weather permitting"
    }],
    "Morocco": [{
      type: "special",
      name: "Camel Trek",
      description: "Desert camel ride in traditional Moroccan style",
      price: { amount: 35, currency: "USD" },
      duration: "1-2 hours",
      frequency: "Morning and sunset departures"
    }],
    "Turkey": [{
      type: "special",
      name: "Hot Air Balloon Ride",
      description: "Scenic balloon flight over Cappadocia's unique landscape",
      price: { amount: 175, currency: "USD" },
      duration: "1 hour flight (3-4 hours total experience)",
      frequency: "Daily morning flights, weather permitting"
    }]
  };

  // Add country-specific transport
  if (countryTransport[country]) {
    options.push(...countryTransport[country]);
  }
  
  // Add transport based on city size
  if (population > 1000000) { // Big city
    options.push({
      type: "special",
      name: "Hop-on Hop-off Bus Tour",
      description: `Comprehensive city tour of ${name} with audio guide in multiple languages`,
      price: { amount: 30, currency: "USD" },
      duration: "24-hour pass",
      frequency: "Buses every 15-30 minutes on circular route"
    });
    
    options.push({
      type: "special",
      name: "Bike Sharing",
      description: `Public bike rental network throughout ${name}`,
      price: { amount: 10, currency: "USD" },
      duration: "Day pass",
      frequency: "Bikes available at stations across the city"
    });
  }
  
  return options;
}

// Get transport options for a specific city
router.get('/search', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }
    
    console.log(`[TravelOptions] Searching for transport options in ${city}`);
    
    // Get city data
    const cityData = await getCityData(city);
    
    if (!cityData) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    // Generate transport options
    const transportOptions = await getTransportOptions(cityData);
    
    // Return the response
    res.json({
      city: cityData.name,
      country: cityData.country,
      coordinates: {
        latitude: cityData.lat,
        longitude: cityData.lon
      },
      transportOptions
    });
    
  } catch (error) {
    console.error('[TravelOptions] Error:', error.message);
    res.status(500).json({ message: 'Error fetching travel options', error: error.message });
  }
});

module.exports = router; 