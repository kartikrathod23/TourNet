const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Add Google Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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

// Get city data using coordinates API
async function getCityData(cityName) {
  try {
    console.log(`[TravelOptions] Searching for city: ${cityName}`);
    
    // Here we'd normally call a geocoding API, but for now we'll return mock data
    // In a production app, use Google Places API or similar to get real coordinates
    return {
      lat: 18.52,
      lon: 73.86,
      name: cityName,
      country: 'India',
      population: 500000,
      iataCode: getIATACode(cityName),
    };
  } catch (error) {
    console.error('[TravelOptions] Error getting city data:', error.message);
    return {
      lat: 18.52,
      lon: 73.86,
      name: cityName,
      country: 'India',
      population: 500000,
      iataCode: getIATACode(cityName),
    };
  }
}

// IATA code generation based on city name
const getIATACode = (cityName) => {
  // Real IATA codes for major Indian cities
  const knownCodes = {
    "Mumbai": "BOM", 
    "Delhi": "DEL", 
    "Bangalore": "BLR", 
    "Chennai": "MAA",
    "Kolkata": "CCU", 
    "Hyderabad": "HYD", 
    "Ahmedabad": "AMD", 
    "Pune": "PNQ",
    "Goa": "GOI", 
    "Jaipur": "JAI", 
    "Lucknow": "LKO", 
    "Srinagar": "SXR",
    "Guwahati": "GAU", 
    "Kochi": "COK", 
    "Thiruvananthapuram": "TRV"
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

// Get transport options for a given city
async function getTransportOptions(cityData, originCity) {
  const { name } = cityData;
  console.log(`[TravelOptions] Generating transport options for ${originCity || 'any origin'} to ${name}`);
  
  // Gather all transport options
  const trainOptions = await getTrainOptions(originCity, name);
  const flightOptions = await getFlightOptions(originCity, name);
  const busOptions = await getBusOptions(originCity, name);
  const carRentalOptions = getCarRentalOptions(cityData);
  
  // Combine all options
  return [...flightOptions, ...trainOptions, ...busOptions, ...carRentalOptions];
}

// Function to call Gemini API for flight data
async function callGeminiAPI(prompt) {
  try {
    console.log('[TravelOptions] Calling Gemini API with prompt:', prompt);
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,  // Increased for more variety
          topP: 0.9,        // Increased for more diverse outputs
          topK: 32,         // Increased for more options
          maxOutputTokens: 2048
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_DEROGATORY",
            threshold: "BLOCK_NONE"
          }
        ]
      }
    );

    if (response.data && 
        response.data.candidates && 
        response.data.candidates.length > 0 && 
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0) {
      
      const text = response.data.candidates[0].content.parts[0].text;
      
      // Validate the response format
      const lines = text.split('\n');
      let validFlights = 0;
      for (const line of lines) {
        if (line.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM|am|pm)/)) {
          validFlights++;
        }
      }
      
      if (validFlights >= 2) {  // At least 2 valid flights
        return text;
      }
      
      throw new Error('Invalid flight data format in response');
    }
    
    throw new Error('No valid response from Gemini API');
  } catch (error) {
    console.error('[TravelOptions] Error calling Gemini API:', error.message);
    throw error;
  }
}

// Generate flight options based on origin and destination cities
async function getFlightOptions(originCity, destinationCity) {
  if (!originCity || !destinationCity) {
    return getDefaultFlightOptions(destinationCity);
  }

  try {
    console.log(`[TravelOptions] Searching for flights from ${originCity} to ${destinationCity}`);
    
    const prompt = `
    Show me detailed flight options from ${originCity} to ${destinationCity} for today.
    Consider peak/off-peak timing and adjust prices accordingly.
    Include a mix of direct and connecting flights.
    
    Present each flight in this exact format:

    [Departure Time] - [Arrival Time] 
    [Airline Name]
    ${getIATACode(originCity)} - ${getIATACode(destinationCity)} 
    [Stop Information (Non-stop or number of stops)]
    [Duration]
    ₹[Price] one way

    For example:
    8:45 PM - 11:20 PM 
    Akasa Air
    DEL - BOM 
    Non-stop
    2 hr 35 min
    ₹14,261 one way

    Show exactly 5 flights with:
    - Different airlines (IndiGo, Air India, Vistara, SpiceJet, Akasa Air)
    - Mix of morning, afternoon, and evening flights
    - Realistic prices based on time and demand
    - Mix of non-stop and 1-stop flights
    Only include the flight information, no introduction or explanation.
    `;

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        const geminiResponse = await callGeminiAPI(prompt);
        const flightOptions = parseGeminiFlightData(geminiResponse);
        
        if (flightOptions.length >= 2) {  // At least 2 valid flights
          console.log(`[TravelOptions] Found ${flightOptions.length} flights via Gemini`);
          return flightOptions.map(flight => ({
            ...flight,
            details: {
              ...flight.details,
              origin: flight.details.origin || getIATACode(originCity),
              destination: flight.details.destination || getIATACode(destinationCity)
            },
            description: `Flight from ${originCity} to ${destinationCity}`
          }));
        }
        
        lastError = new Error('Insufficient valid flights in response');
      } catch (error) {
        console.error(`[TravelOptions] Attempt ${attempts + 1} failed:`, error.message);
        lastError = error;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
      }
    }
    
    throw lastError || new Error('Failed to get valid flight data');
  } catch (error) {
    console.error('[TravelOptions] Error with flight search:', error.message);
    return getDefaultFlightOptions(destinationCity, originCity);
  }
}

// Function to parse Gemini flight data response
function parseGeminiFlightData(responseText) {
  try {
    console.log('[TravelOptions] Parsing flight data from response:', responseText);
    
    // Split the response into flight blocks (separated by empty lines)
    const flightBlocks = responseText.split(/\n\s*\n/);
    const flights = [];
    
    for (const block of flightBlocks) {
      if (!block.trim()) continue; // Skip empty blocks
      
      const lines = block.trim().split('\n');
      if (lines.length < 5) continue; // Skip incomplete blocks
      
      let flightData = {};
      
      // Parse time line (e.g., "8:45 PM - 11:20 PM")
      const timeLine = lines[0].trim();
      const timeMatch = timeLine.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(AM|PM|am|pm)(\+\d+)?)/i);
      if (timeMatch) {
        flightData.departureTime = timeMatch[1];
        flightData.arrivalTime = timeMatch[3];
      }
      
      // Parse airline (line 2)
      if (lines[1]) {
        flightData.airline = lines[1].trim();
      }
      
      // Parse route (line 3, e.g., "DEL - GOX")
      if (lines[2]) {
        const routeMatch = lines[2].match(/([A-Z]{3})\s*-\s*([A-Z]{3})/i);
        if (routeMatch) {
          flightData.origin = routeMatch[1];
          flightData.destination = routeMatch[2];
        }
      }
      
      // Parse stops (line 4)
      if (lines[3]) {
        const stopLine = lines[3].toLowerCase();
        if (stopLine.includes('non-stop') || stopLine.includes('nonstop')) {
          flightData.stops = 0;
        } else {
          flightData.stops = stopLine.match(/(\d+)\s*stop/) ? parseInt(stopLine.match(/(\d+)\s*stop/)[1]) : 1;
        }
      }
      
      // Parse duration (line 5)
      if (lines[4]) {
        const durationMatch = lines[4].match(/(\d+)(?:\s*hr|\s*h)(?:\s*(\d+)(?:\s*min|\s*m))?/i);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1] || 0);
          const minutes = parseInt(durationMatch[2] || 0);
          flightData.duration = `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim();
        }
      }
      
      // Parse price (line 6)
      if (lines[5]) {
        const priceMatch = lines[5].match(/₹([0-9,]+)/);
        if (priceMatch) {
          flightData.price = parseInt(priceMatch[1].replace(/,/g, ''));
        }
      }
      
      // Only add complete flight entries
      if (flightData.departureTime && flightData.airline && flightData.price) {
        // Generate a flight number if not present
        if (!flightData.flightNumber) {
          const airline = flightData.airline;
          if (airline.includes('IndiGo')) {
            flightData.flightNumber = `6E ${Math.floor(1000 + Math.random() * 9000)}`;
          } else if (airline.includes('Air India')) {
            flightData.flightNumber = `AI ${Math.floor(100 + Math.random() * 900)}`;
          } else if (airline.includes('Vistara')) {
            flightData.flightNumber = `UK ${Math.floor(100 + Math.random() * 900)}`;
          } else if (airline.includes('SpiceJet')) {
            flightData.flightNumber = `SG ${Math.floor(100 + Math.random() * 900)}`;
          } else if (airline.includes('Akasa')) {
            flightData.flightNumber = `QP ${Math.floor(100 + Math.random() * 900)}`;
          } else {
            // Generic flight number
            flightData.flightNumber = `FL ${Math.floor(1000 + Math.random() * 9000)}`;
          }
        }
        
        flights.push(formatFlightOption(flightData));
      }
    }
    
    console.log(`[TravelOptions] Successfully parsed ${flights.length} flights`);
    
    // If no flights were parsed successfully, try the line-by-line approach as fallback
    if (flights.length === 0) {
      return parseLegacyFlightData(responseText);
    }
    
    return flights;
  } catch (error) {
    console.error('[TravelOptions] Error parsing Gemini flight data:', error.message);
    return [];
  }
}

// Legacy line-by-line parser as fallback
function parseLegacyFlightData(responseText) {
  try {
    // Split the response into lines
    const lines = responseText.split('\n');
    const flights = [];
    let currentFlight = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if this is a time line (start of a new flight)
      const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(AM|PM|am|pm)(\+\d+)?)/i);
      if (timeMatch) {
        // Save previous flight if exists
        if (Object.keys(currentFlight).length > 0) {
          flights.push(formatFlightOption(currentFlight));
        }
        
        // Start a new flight
        currentFlight = {
          departureTime: timeMatch[1],
          arrivalTime: timeMatch[3]
        };
        continue;
      }
      
      // Check for airline
      if (line.match(/(IndiGo|Air India|Akasa Air|SpiceJet|Vistara|GoAir|AirAsia|Alliance Air|TruJet|Star Air)/i) && !currentFlight.airline) {
        currentFlight.airline = line.trim();
        continue;
      }
      
      // Check for route (PNQ - AMD)
      const routeMatch = line.match(/([A-Z]{3})\s*-\s*([A-Z]{3})/);
      if (routeMatch && !currentFlight.route) {
        currentFlight.origin = routeMatch[1];
        currentFlight.destination = routeMatch[2];
        continue;
      }
      
      // Check for stops information
      if (line.toLowerCase().includes('stop') && !currentFlight.stops) {
        if (line.toLowerCase().includes('non-stop') || line.toLowerCase().includes('nonstop')) {
          currentFlight.stops = 0;
        } else {
          currentFlight.stops = line.match(/(\d+)\s*stop/) ? parseInt(line.match(/(\d+)\s*stop/)[1]) : 1;
        }
        continue;
      }
      
      // Check for duration
      const durationMatch = line.match(/(\d+)(?:\s*hr|\s*h)\s*(?:(\d+)(?:\s*min|\s*m))?/i);
      if (durationMatch && !currentFlight.duration) {
        const hours = parseInt(durationMatch[1] || 0);
        const minutes = parseInt(durationMatch[2] || 0);
        currentFlight.duration = `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim();
        continue;
      }
      
      // Check for price
      const priceMatch = line.match(/(?:₹|Rs\.?|INR)\s*([0-9,]+)/);
      if (priceMatch && !currentFlight.price) {
        currentFlight.price = parseInt(priceMatch[1].replace(/,/g, ''));
        continue;
      }
    }
    
    // Add the last flight
    if (Object.keys(currentFlight).length > 0) {
      flights.push(formatFlightOption(currentFlight));
    }
    
    console.log(`[TravelOptions] Successfully parsed ${flights.length} flights with legacy parser`);
    return flights;
  } catch (error) {
    console.error('[TravelOptions] Error in legacy flight parser:', error.message);
    return [];
  }
}

// Helper function to format flight data into the expected structure
function formatFlightOption(flightData) {
  return {
    type: "flight",
    name: `${flightData.airline || 'Flight'} to ${flightData.destination || 'destination'}`,
    description: `Flight from ${flightData.origin || 'origin'} to ${flightData.destination || 'destination'}`,
    price: {
      amount: flightData.price || 9999,
      currency: "INR"
    },
    duration: flightData.duration || "Unknown",
    frequency: "Daily flights available",
    details: {
      airline: flightData.airline || "Unknown Airline",
      flightNumber: flightData.flightNumber || "Various",
      departureTime: flightData.departureTime || "Unknown",
      arrivalTime: flightData.arrivalTime || "Unknown",
      origin: flightData.origin || "",
      destination: flightData.destination || "",
      stops: flightData.stops !== undefined ? flightData.stops : 0,
      nonstop: (flightData.stops || 0) === 0
    }
  };
}

// Function to parse Gemini train data response
function parseGeminiTrainData(responseText) {
  try {
    console.log('[TravelOptions] Parsing train data from response:', responseText);
    
    // Split the response into lines
    const lines = responseText.split('\n');
    const trains = [];
    let currentTrain = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if this is a train number/name line (start of a new train)
      const trainMatch = line.match(/(\d{5})\s+([A-Za-z\s]+(Express|Mail|Shatabdi|Rajdhani|Duronto|Superfast|Passenger|Jan Shatabdi))/i);
      if (trainMatch) {
        // Save previous train if exists
        if (Object.keys(currentTrain).length > 0) {
          trains.push(formatTrainOption(currentTrain));
        }
        
        // Start a new train
        currentTrain = {
          trainNumber: trainMatch[1],
          trainName: trainMatch[2]
        };
        continue;
      }
      
      // Check for time
      const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/i);
      if (timeMatch && !currentTrain.departureTime) {
        currentTrain.departureTime = timeMatch[1];
        currentTrain.arrivalTime = timeMatch[3];
        continue;
      }
      
      // Check for duration
      const durationMatch = line.match(/(\d+)\s*hr\s*(\d+)?\s*min/);
      if (durationMatch && !currentTrain.duration) {
        const hours = parseInt(durationMatch[1] || 0);
        const minutes = parseInt(durationMatch[2] || 0);
        currentTrain.duration = `${hours}h ${minutes}m`;
        continue;
      }
      
      // Check for classes
      const classMatch = line.match(/Classes:\s*(.*)/i);
      if (classMatch && !currentTrain.travelClass) {
        currentTrain.travelClass = classMatch[1].split(',')[0].trim();
        continue;
      }
      
      // Check for price
      const priceMatch = line.match(/(?:₹|Rs\.?|INR)\s*([0-9,]+)/);
      if (priceMatch && !currentTrain.price) {
        currentTrain.price = parseInt(priceMatch[1].replace(/,/g, ''));
        continue;
      }
    }
    
    // Add the last train
    if (Object.keys(currentTrain).length > 0) {
      trains.push(formatTrainOption(currentTrain));
    }
    
    console.log(`[TravelOptions] Successfully parsed ${trains.length} trains`);
    return trains;
  } catch (error) {
    console.error('[TravelOptions] Error parsing Gemini train data:', error.message);
    return [];
  }
}

// Helper function to format train data into the expected structure
function formatTrainOption(trainData) {
  return {
    type: "train",
    name: trainData.trainName || "Indian Railways Train",
    description: `Train number ${trainData.trainNumber || 'Unknown'} connecting origin and destination`,
    price: {
      amount: trainData.price || 1500,
      currency: "INR"
    },
    duration: trainData.duration || "Unknown",
    frequency: "Daily service",
    details: {
      trainNumber: trainData.trainNumber || "Unknown",
      departureTime: trainData.departureTime || "Unknown",
      arrivalTime: trainData.arrivalTime || "Unknown",
      travelClass: trainData.travelClass || "SL"
    }
  };
}

// Function to parse Gemini bus data response
function parseGeminiBusData(responseText) {
  try {
    console.log('[TravelOptions] Parsing bus data from response:', responseText);
    
    // Split the response into lines
    const lines = responseText.split('\n');
    const buses = [];
    let currentBus = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if this is a bus operator/type line (start of a new bus)
      const busMatch = line.match(/(.*?)\s*-\s*(Volvo|Mercedes|AC Sleeper|Non-AC Sleeper|AC Seater|Non-AC Seater|Semi-Sleeper|Luxury|Seater|Sleeper)/i);
      if (busMatch) {
        // Save previous bus if exists
        if (Object.keys(currentBus).length > 0) {
          buses.push(formatBusOption(currentBus));
        }
        
        // Start a new bus
        currentBus = {
          operator: busMatch[1].trim(),
          busType: busMatch[2].trim()
        };
        continue;
      }
      
      // Check for time
      const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/i);
      if (timeMatch && !currentBus.departureTime) {
        currentBus.departureTime = timeMatch[1];
        currentBus.arrivalTime = timeMatch[3];
        continue;
      }
      
      // Check for duration
      const durationMatch = line.match(/(\d+)\s*hr\s*(\d+)?\s*min/);
      if (durationMatch && !currentBus.duration) {
        const hours = parseInt(durationMatch[1] || 0);
        const minutes = parseInt(durationMatch[2] || 0);
        currentBus.duration = `${hours}h ${minutes}m`;
        continue;
      }
      
      // Check for price
      const priceMatch = line.match(/(?:₹|Rs\.?|INR)\s*([0-9,]+)/);
      if (priceMatch && !currentBus.price) {
        currentBus.price = parseInt(priceMatch[1].replace(/,/g, ''));
        continue;
      }
    }
    
    // Add the last bus
    if (Object.keys(currentBus).length > 0) {
      buses.push(formatBusOption(currentBus));
    }
    
    console.log(`[TravelOptions] Successfully parsed ${buses.length} buses`);
    return buses;
  } catch (error) {
    console.error('[TravelOptions] Error parsing Gemini bus data:', error.message);
    return [];
  }
}

// Helper function to format bus data into the expected structure
function formatBusOption(busData) {
  return {
    type: "bus",
    name: `${busData.operator || 'Bus'} ${busData.busType || 'Service'}`,
    description: `Bus service connecting origin and destination`,
    price: {
      amount: busData.price || 1000,
      currency: "INR"
    },
    duration: busData.duration || "Unknown",
    frequency: "Daily service",
    details: {
      busType: busData.busType || "Standard Bus",
      operator: busData.operator || "State Transport",
      departureTime: busData.departureTime || "Unknown",
      arrivalTime: busData.arrivalTime || "Unknown",
      amenities: (busData.busType || "").toLowerCase().includes('ac') ? 'AC, Charging Points' : 'Standard'
    }
  };
}

// Generate train options based on origin and destination
async function getTrainOptions(originCity, destinationCity) {
  if (!originCity || !destinationCity) {
    return getDefaultTrainOptions(destinationCity);
  }

  try {
    // Get country data for destination
    const destCityData = await getCityData(destinationCity);
    
    // Check if trains are applicable for this country
    const trainCountries = [
      'India', 'Japan', 'France', 'Germany', 'Italy', 'Spain', 'UK', 
      'China', 'Russia', 'Switzerland', 'Austria', 'Netherlands', 'Belgium'
    ];
    
    if (!trainCountries.includes(destCityData.country)) {
      console.log(`[TravelOptions] Trains not applicable for ${destCityData.country}`);
      return []; // No train options for this country
    }
    
    console.log(`[TravelOptions] Searching for trains from ${originCity} to ${destinationCity}`);
    
    const prompt = `
    Show me train details from ${originCity} to ${destinationCity} in ${destCityData.country}.
    
    Present the information in this format for each train:
    [Train Number] [Train Name]
    [Departure Time] - [Arrival Time]
    [Duration]
    Classes: [Available Classes]
    ${destCityData.country === 'India' ? '₹' : '$'}[Price for standard class]
    
    Show exactly 3 trains with different timings and prices.
    Make sure to use the train terminology and services specific to ${destCityData.country}.
    For example, in India use Indian Railways trains, in Japan use Shinkansen, in France use TGV, etc.
    Only show the train information, no introduction or explanation.
    `;

    const geminiResponse = await callGeminiAPI(prompt);
    const trainOptions = parseGeminiTrainData(geminiResponse);
    
    if (trainOptions.length > 0) {
      console.log(`[TravelOptions] Found ${trainOptions.length} trains via Gemini`);
      return trainOptions;
    }
    
    // Fallback to default country-specific options
    console.log(`[TravelOptions] No trains found, using default options`);
    return getDefaultTrainOptions(destinationCity, destCityData.country);
    
  } catch (error) {
    console.error('[TravelOptions] Error with train search:', error.message);
    const destCityData = await getCityData(destinationCity);
    return getDefaultTrainOptions(destinationCity, destCityData.country);
  }
}

// Get default train options (fallback)
function getDefaultTrainOptions(destinationCity, country = 'India') {
  // If trains not relevant for this country, return empty array
  const trainCountries = [
    'India', 'Japan', 'France', 'Germany', 'Italy', 'Spain', 'UK', 
    'China', 'Russia', 'Switzerland', 'Austria', 'Netherlands', 'Belgium'
  ];
  
  if (!trainCountries.includes(country)) {
    return [];
  }
  
  // Country-specific train systems
  const trainSystems = {
    'India': [
      { 
        name: "Rajdhani Express", 
        trainNumber: "12952", 
        travelClass: "3A", 
        basePrice: 2100, 
        duration: "8h 30m",
        frequency: "Daily service",
        departureTime: "4:30 PM"
      },
      { 
        name: "Shatabdi Express", 
        trainNumber: "12001", 
        travelClass: "CC", 
        basePrice: 1800, 
        duration: "6h 45m",
        frequency: "5 days a week",
        departureTime: "6:00 AM"
      },
      { 
        name: "Vande Bharat Express", 
        trainNumber: "22439", 
        travelClass: "EC", 
        basePrice: 2400, 
        duration: "5h 15m",
        frequency: "Daily except Sunday",
        departureTime: "8:15 AM"
      }
    ],
    'Japan': [
      { 
        name: "Nozomi Shinkansen", 
        trainNumber: "N700A", 
        travelClass: "Ordinary", 
        basePrice: 14000, 
        duration: "2h 30m",
        frequency: "Every 10 minutes",
        departureTime: "9:00 AM"
      },
      { 
        name: "Hikari Shinkansen", 
        trainNumber: "E5 Series", 
        travelClass: "Green Car", 
        basePrice: 18000, 
        duration: "3h 10m",
        frequency: "Hourly",
        departureTime: "10:30 AM"
      }
    ],
    'France': [
      { 
        name: "TGV INOUI", 
        trainNumber: "6213", 
        travelClass: "2nd Class", 
        basePrice: 70, 
        duration: "3h 15m",
        frequency: "Every 2 hours",
        departureTime: "7:40 AM"
      },
      { 
        name: "OUIGO", 
        trainNumber: "7801", 
        travelClass: "Standard", 
        basePrice: 35, 
        duration: "3h 45m",
        frequency: "3 times daily",
        departureTime: "11:20 AM"
      }
    ],
    'UK': [
      { 
        name: "LNER", 
        trainNumber: "IC225", 
        travelClass: "Standard", 
        basePrice: 55, 
        duration: "2h 45m",
        frequency: "Hourly",
        departureTime: "8:30 AM"
      },
      { 
        name: "Avanti West Coast", 
        trainNumber: "390", 
        travelClass: "First Class", 
        basePrice: 95, 
        duration: "1h 50m",
        frequency: "Every 30 minutes",
        departureTime: "10:15 AM"
      }
    ]
  };
  
  // Use country-specific trains or fallback to India
  const trainOptions = trainSystems[country] || trainSystems['India'];
  
  // Format time
  const formatArrivalTime = (departure, duration) => {
    const [hours, minutes] = departure.split(':').map(num => parseInt(num));
    const durationMatch = duration.match(/(\d+)h\s*(\d+)?m?/);
    
    if (!durationMatch) return "Unknown";
    
    const durationHours = parseInt(durationMatch[1] || 0);
    const durationMinutes = parseInt(durationMatch[2] || 0);
    
    let totalMinutes = (hours * 60 + minutes) + (durationHours * 60 + durationMinutes);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    const period = newHours >= 12 ? 'PM' : 'AM';
    const hours12 = newHours > 12 ? newHours - 12 : (newHours === 0 ? 12 : newHours);
    
    return `${hours12}:${newMinutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return trainOptions.map(train => {
    const arrivalTime = formatArrivalTime(train.departureTime, train.duration);
    
    // Add some price variation
    const price = Math.round(train.basePrice * (0.9 + Math.random() * 0.3));
    
    return {
      type: "train",
      name: train.name,
      description: `${train.name} to ${destinationCity}`,
      price: { 
        amount: price, 
        currency: country === 'India' ? "INR" : "USD" 
      },
      duration: train.duration,
      frequency: train.frequency,
      details: {
        trainNumber: train.trainNumber,
        departureTime: train.departureTime,
        arrivalTime: arrivalTime,
        travelClass: train.travelClass
      }
    };
  });
}

// Generate bus options based on origin and destination
async function getBusOptions(originCity, destinationCity) {
  if (!originCity || !destinationCity) {
    return getDefaultBusOptions(destinationCity);
  }

  try {
    // Get country data for destination
    const destCityData = await getCityData(destinationCity);

    // Calculate straight-line distance (rough estimate) to see if bus would make sense
    const originCityData = await getCityData(originCity);
    
    // Calculate distance between cities (rough estimate)
    const distance = calculateDistance(
      originCityData.lat, originCityData.lon,
      destCityData.lat, destCityData.lon
    );
    
    // If distance is too great (over 700km), buses likely not practical
    if (distance > 700) {
      console.log(`[TravelOptions] Distance between ${originCity} and ${destinationCity} is ${Math.round(distance)}km, too far for buses`);
      return [];
    }
    
    console.log(`[TravelOptions] Searching for buses from ${originCity} to ${destinationCity}`);
    
    const prompt = `
    Show me realistic bus services from ${originCity} to ${destinationCity} in ${destCityData.country}.
    
    Present the information in this format for each bus:
    [Bus Operator] - [Bus Type]
    [Departure Time] - [Arrival Time]
    [Duration]
    ${destCityData.country === 'India' ? '₹' : '$'}[Price]
    
    Show at least 3 buses if available.
    Include both AC and Non-AC options if in India.
    Use realistic bus companies operating in ${destCityData.country}.
    Only show the bus information, no introduction or explanation.
    `;

    const geminiResponse = await callGeminiAPI(prompt);
    const busOptions = parseGeminiBusData(geminiResponse);
    
    if (busOptions.length > 0) {
      console.log(`[TravelOptions] Found ${busOptions.length} buses via Gemini`);
      return busOptions;
    }
    
    // Fallback to default country-specific options
    console.log(`[TravelOptions] No buses found, using default options`);
    return getDefaultBusOptions(destinationCity, destCityData.country, distance);
    
  } catch (error) {
    console.error('[TravelOptions] Error with bus search:', error.message);
    const destCityData = await getCityData(destinationCity);
    return getDefaultBusOptions(destinationCity, destCityData.country);
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Get default bus options (fallback)
function getDefaultBusOptions(destinationCity, country = 'India', distance = 300) {
  // Skip buses if the country doesn't have extensive bus networks
  const countriesWithFewBuses = [
    'United States', 'Canada', 'Australia', 'Japan'
  ];
  
  if (countriesWithFewBuses.includes(country)) {
    return [];
  }
  
  // Skip if distance would be impractical
  if (distance > 700) {
    return [];
  }
  
  // Country-specific bus operators
  const busOperators = {
    'India': [
      { operator: 'KSRTC', types: ['Volvo AC Sleeper', 'AC Seater', 'Non-AC Sleeper'] },
      { operator: 'Sharma Travels', types: ['Volvo AC Sleeper', 'Mercedes AC Sleeper'] },
      { operator: 'Neeta Tours', types: ['AC Sleeper', 'Non-AC Seater'] },
      { operator: 'SRS Travels', types: ['Volvo Multi-Axle', 'AC Sleeper', 'Deluxe'] }
    ],
    'UK': [
      { operator: 'National Express', types: ['Standard', 'Gold Service'] },
      { operator: 'Megabus', types: ['Standard', 'Premium'] },
      { operator: 'Scottish Citylink', types: ['Standard', 'Gold Service'] }
    ],
    'Germany': [
      { operator: 'FlixBus', types: ['Standard', 'Overnight'] },
      { operator: 'Eurolines', types: ['Economy', 'Business'] },
      { operator: 'BlaBlaBus', types: ['Standard'] }
    ],
    'Spain': [
      { operator: 'ALSA', types: ['Supra Economy', 'Premium', 'Comfort'] },
      { operator: 'Avanza', types: ['Normal', 'Premium'] },
      { operator: 'Monbus', types: ['Standard', 'Premium'] }
    ]
  };
  
  // Default to Indian bus operators if country not specified
  const operators = busOperators[country] || busOperators['India'];
  
  // Create 2-3 bus options
  const numBuses = Math.floor(2 + Math.random());
  const result = [];
  
  // Calculate duration based on distance (rough estimate)
  const baseDuration = Math.max(3, Math.ceil(distance / 50)); // 50 km/h average
  
  // Departure time slots
  const departureTimes = ['7:00 AM', '9:30 AM', '1:00 PM', '4:30 PM', '8:00 PM', '9:30 PM', '11:00 PM'];
  
  for (let i = 0; i < numBuses; i++) {
    const operator = operators[i % operators.length];
    const busType = operator.types[Math.floor(Math.random() * operator.types.length)];
    const isAC = busType.toLowerCase().includes('ac') || busType.toLowerCase().includes('gold') || busType.toLowerCase().includes('premium');
    const isOvernight = busType.toLowerCase().includes('overnight') || busType.toLowerCase().includes('sleeper');
    
    // Price based on distance, AC, and country
    let basePrice;
    
    if (country === 'India') {
      basePrice = Math.round((distance * 2) * (isAC ? 1.5 : 1));
    } else {
      basePrice = Math.round((distance * 0.15) * (isAC ? 1.3 : 1));
    }
    
    // Randomize a bit
    const price = Math.round(basePrice * (0.9 + Math.random() * 0.3));
    
    // Calculate duration with some variation
    const durationVariance = Math.random() * 2 - 1; // -1 to 1
    const durationHours = Math.max(2, Math.round(baseDuration + durationVariance));
    const durationMinutes = Math.floor(Math.random() * 59);
    
    // Choose a departure time, biased by bus type (overnight buses depart in evening)
    let departureTimeIndex;
    if (isOvernight) {
      departureTimeIndex = 4 + Math.floor(Math.random() * 3); // Evening/night departures
    } else {
      departureTimeIndex = Math.floor(Math.random() * 5); // Daytime departures
    }
    
    const departureTime = departureTimes[departureTimeIndex];
    
    // Calculate arrival time
    const [hours, minutes, period] = departureTime.match(/(\d+):(\d+)\s+(AM|PM)/).slice(1);
    let departureHours = parseInt(hours);
    if (period === 'PM' && departureHours !== 12) departureHours += 12;
    if (period === 'AM' && departureHours === 12) departureHours = 0;
    
    let totalMinutes = (departureHours * 60 + parseInt(minutes)) + (durationHours * 60 + durationMinutes);
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    
    const arrivalPeriod = arrivalHours >= 12 ? 'PM' : 'AM';
    const arrivalHours12 = arrivalHours > 12 ? arrivalHours - 12 : (arrivalHours === 0 ? 12 : arrivalHours);
    const arrivalTime = `${arrivalHours12}:${arrivalMinutes.toString().padStart(2, '0')} ${arrivalPeriod}`;
    
    result.push({
      type: "bus",
      name: `${operator.operator} ${busType}`,
      description: `Bus service to ${destinationCity}`,
      price: { 
        amount: price, 
        currency: country === 'India' ? "INR" : "USD" 
      },
      duration: `${durationHours}h ${durationMinutes}m`,
      frequency: isOvernight ? "Daily night service" : "Multiple daily departures",
      details: {
        busType: busType,
        operator: operator.operator,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        amenities: isAC ? 'AC, Charging Points, WiFi' : 'Standard'
      }
    });
  }
  
  return result;
}

// Generate car rental options
function getCarRentalOptions(cityData) {
  const { name, country, population } = cityData;
  
  // Skip car rentals for certain countries with limited availability
  const limitedCarRentalCountries = [
    'Bangladesh', 'Nepal', 'Bhutan', 'Myanmar', 'Afghanistan', 'North Korea'
  ];
  
  if (limitedCarRentalCountries.includes(country)) {
    console.log(`[TravelOptions] Car rentals limited in ${country}`);
    return [];
  }
  
  // Country-specific rental companies
  const rentalCompaniesByCountry = {
    'India': ['Zoomcar', 'Revv', 'Myles', 'Avis', 'Hertz'],
    'USA': ['Enterprise', 'Hertz', 'Avis', 'Budget', 'National', 'Alamo'],
    'UK': ['Enterprise', 'Europcar', 'Avis', 'Hertz', 'Sixt', 'Budget'],
    'Germany': ['Sixt', 'Europcar', 'Hertz', 'Avis', 'Buchbinder'],
    'Japan': ['Toyota Rent a Car', 'Nippon Rent-A-Car', 'Times Car Rental', 'Orix', 'Nissan Rent a Car'],
    'Australia': ['Avis', 'Hertz', 'Budget', 'Europcar', 'Thrifty'],
    'France': ['Europcar', 'Sixt', 'Avis', 'Hertz', 'Rentacar', 'Budget'],
    'Italy': ['Europcar', 'Avis', 'Hertz', 'Sixt', 'Maggiore'],
    'Spain': ['Europcar', 'Sixt', 'Avis', 'Hertz', 'Record Go', 'OK Mobility'],
    'United Arab Emirates': ['Thrifty', 'Budget', 'Hertz', 'Europcar', 'Dollar'],
    'Singapore': ['Avis', 'Hertz', 'Budget', 'Europcar']
  };
  
  // Default rental companies for countries not listed
  const defaultRentalCompanies = ['Avis', 'Hertz', 'Europcar', 'Budget', 'Sixt'];
  
  // Get companies for this country, or use default
  const rentalCompanies = rentalCompaniesByCountry[country] || defaultRentalCompanies;
  
  // Car models by country and category
  const carModelsByCountry = {
    'India': {
      'Economy': ['Maruti Swift', 'Hyundai i10', 'Tata Tiago', 'Maruti Alto', 'Hyundai Santro'],
      'Compact': ['Maruti Dzire', 'Hyundai Aura', 'Honda Amaze', 'Tata Tigor', 'Ford Aspire'],
      'SUV': ['Hyundai Creta', 'Maruti Brezza', 'Kia Seltos', 'Mahindra XUV300', 'Tata Nexon'],
      'Premium': ['Toyota Innova', 'Mahindra XUV700', 'Jeep Compass', 'MG Hector', 'Toyota Fortuner']
    },
    'Japan': {
      'Economy': ['Toyota Vitz', 'Honda Fit', 'Nissan Note', 'Mazda Demio', 'Suzuki Swift'],
      'Compact': ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra', 'Mazda 3', 'Subaru Impreza'],
      'SUV': ['Toyota RAV4', 'Honda CR-V', 'Nissan X-Trail', 'Mazda CX-5', 'Mitsubishi Outlander'],
      'Premium': ['Lexus ES', 'Toyota Alphard', 'Honda Legend', 'Nissan Cima', 'Mazda CX-9']
    },
    'USA': {
      'Economy': ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra', 'Hyundai Elantra', 'Kia Forte'],
      'Compact': ['Toyota Camry', 'Honda Accord', 'Ford Fusion', 'Chevrolet Malibu', 'Hyundai Sonata'],
      'SUV': ['Toyota RAV4', 'Honda CR-V', 'Ford Escape', 'Chevrolet Equinox', 'Jeep Grand Cherokee'],
      'Premium': ['BMW 5 Series', 'Mercedes E-Class', 'Audi A6', 'Lexus ES', 'Cadillac CT5']
    },
    'UK': {
      'Economy': ['Ford Fiesta', 'Vauxhall Corsa', 'Volkswagen Polo', 'Renault Clio', 'Peugeot 208'],
      'Compact': ['Ford Focus', 'Volkswagen Golf', 'Vauxhall Astra', 'BMW 1 Series', 'Mercedes A-Class'],
      'SUV': ['Nissan Qashqai', 'Kia Sportage', 'Hyundai Tucson', 'Ford Kuga', 'Volkswagen Tiguan'],
      'Premium': ['BMW 5 Series', 'Mercedes E-Class', 'Audi A6', 'Jaguar XF', 'Volvo V90']
    }
  };
  
  // Default car models for countries not listed
  const defaultCarModels = {
    'Economy': ['Toyota Corolla', 'Honda Civic', 'Volkswagen Golf', 'Ford Focus', 'Hyundai Elantra'],
    'Compact': ['Toyota Camry', 'Honda Accord', 'Volkswagen Passat', 'Ford Mondeo', 'Hyundai Sonata'],
    'SUV': ['Toyota RAV4', 'Honda CR-V', 'Volkswagen Tiguan', 'Ford Escape', 'Hyundai Tucson'],
    'Premium': ['BMW 5 Series', 'Mercedes E-Class', 'Audi A6', 'Lexus ES', 'Volvo S90']
  };
  
  // Get car models for this country, or use default
  const carModels = carModelsByCountry[country] || defaultCarModels;
  
  // Base prices by country and category (per day in local currency or USD)
  const basePricesByCountry = {
    'India': {
      'Economy': 1500,
      'Compact': 2500,
      'SUV': 3500,
      'Premium': 7000
    },
    'USA': {
      'Economy': 40,
      'Compact': 60,
      'SUV': 80,
      'Premium': 120
    },
    'UK': {
      'Economy': 35,
      'Compact': 55,
      'SUV': 75,
      'Premium': 110
    },
    'Japan': {
      'Economy': 5000,
      'Compact': 7000,
      'SUV': 9000,
      'Premium': 15000
    }
  };
  
  // Default base prices (USD equivalent)
  const defaultBasePrices = {
    'Economy': 40,
    'Compact': 60,
    'SUV': 80,
    'Premium': 120
  };
  
  // Get base prices for this country, or use default
  const basePrices = basePricesByCountry[country] || defaultBasePrices;
  
  // Currency by country
  const currencyByCountry = {
    'India': 'INR',
    'USA': 'USD',
    'UK': 'GBP',
    'Japan': 'JPY',
    'Singapore': 'SGD',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'Switzerland': 'CHF',
    'UAE': 'AED',
    'New Zealand': 'NZD'
  };
  
  // Default to USD for countries not listed
  const currency = currencyByCountry[country] || 'USD';
  
  // Generate car rental options
  const options = [];
  
  // Number of options based on city population
  const numOptions = population > 1000000 ? 4 : (population > 500000 ? 3 : 2);
  const categories = ['Economy', 'Compact', 'SUV', 'Premium'].slice(0, numOptions);
  
  // Add an option for each category
  categories.forEach((category, index) => {
    // Select a random company from the list
    const company = rentalCompanies[Math.floor(Math.random() * rentalCompanies.length)];
    
    // Get random car model for this category
    const model = carModels[category][Math.floor(Math.random() * carModels[category].length)];
    
    // Calculate price (base + random factor)
    const price = Math.round(basePrices[category] * (0.9 + Math.random() * 0.3));
    
    // Amenities based on category
    let amenities = "Air Conditioning, Power Steering, GPS Navigation";
    if (category === 'Compact' || category === 'SUV') {
      amenities += ", Bluetooth, Backup Camera";
    }
    if (category === 'Premium') {
      amenities += ", Leather Seats, Premium Sound System, Advanced Driver Assistance";
    }
    
    options.push({
      type: "car_rental",
      name: `${category} Car - ${model}`,
      description: `${category} car rental in ${name}`,
      price: {
        amount: price,
        currency: currency
      },
      duration: "24 hours",
      frequency: "Daily rental",
      details: {
        carType: category,
        model: model,
        company: company,
        amenities: amenities,
        pickupLocation: `${name} City Center or Airport`,
        fuelPolicy: "Full to Full"
      }
    });
  });
  
  return options;
}

// Get default flight options (fallback)
function getDefaultFlightOptions(destinationCity, originCity = 'Your City') {
  const originCode = originCity ? getIATACode(originCity) : 'ORG';
  const destCode = destinationCity ? getIATACode(destinationCity) : 'DST';
  
  // Generate more realistic and varied flight options
  const airlines = [
    { name: 'IndiGo', code: '6E', basePrice: 4500 },
    { name: 'Air India', code: 'AI', basePrice: 6000 },
    { name: 'Vistara', code: 'UK', basePrice: 7000 },
    { name: 'SpiceJet', code: 'SG', basePrice: 4800 },
    { name: 'Akasa Air', code: 'QP', basePrice: 5500 }
  ];
  
  const timeSlots = [
    { start: '6:00 AM', end: '8:30 AM', factor: 1.2 },  // Morning peak
    { start: '10:30 AM', end: '1:45 PM', factor: 0.9 }, // Mid-day
    { start: '4:15 PM', end: '7:20 PM', factor: 1.3 },  // Evening peak
    { start: '8:45 PM', end: '11:20 PM', factor: 0.8 }  // Night
  ];
  
  return airlines.map((airline, index) => {
    const timeSlot = timeSlots[index % timeSlots.length];
    const isNonStop = Math.random() > 0.3; // 70% chance of non-stop
    const durationBase = isNonStop ? 
      { hours: 2, minutes: Math.floor(Math.random() * 45) } : 
      { hours: 3 + Math.floor(Math.random() * 2), minutes: Math.floor(Math.random() * 45) };
    
    const price = Math.round((airline.basePrice + Math.random() * 2000) * timeSlot.factor);
    
    return {
      type: "flight",
      name: `${airline.name} Flight`,
      description: `Flight from ${originCity} to ${destinationCity}`,
      price: { amount: price, currency: "INR" },
      duration: `${durationBase.hours}h ${durationBase.minutes}m`,
      frequency: "Daily flights available",
      details: {
        airline: airline.name,
        flightNumber: `${airline.code} ${Math.floor(1000 + Math.random() * 9000)}`,
        departureTime: timeSlot.start,
        arrivalTime: timeSlot.end,
        origin: originCode,
        destination: destCode,
        stops: isNonStop ? 0 : 1,
        nonstop: isNonStop,
        status: Math.random() > 0.8 ? 'Delayed' : 'On Time'  // 20% chance of delay
      }
    };
  });
}

// Update the search endpoint to allow for origin city input for flights
router.get('/search', async (req, res) => {
  try {
    const { city, origin } = req.query;
    
    if (!city) {
      return res.status(400).json({ message: 'Destination city name is required' });
    }
    
    console.log(`[TravelOptions] Searching for transport options in ${city}${origin ? ' from ' + origin : ''}`);
    
    // Get city data
    const cityData = await getCityData(city);
    
    if (!cityData) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    // Generate transport options with origin city if provided
    const transportOptions = await getTransportOptions(cityData, origin);
    
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

// Add a test endpoint to get only flight data
router.get('/test-flights', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({ 
        message: 'Both origin and destination are required',
        usage: '/api/travel-options/test-flights?origin=Delhi&destination=Goa'
      });
    }
    
    console.log(`[TravelOptions] Testing flight data from ${origin} to ${destination}`);
    
    const prompt = `
    Show me detailed flight options from ${origin} to ${destination} for today.
    
    Present each flight in this exact format:

    [Departure Time] - [Arrival Time] 
    [Airline Name]
    ${getIATACode(origin)} - ${getIATACode(destination)} 
    [Stop Information (Non-stop or number of stops)]
    [Duration]
    ₹[Price] round trip

    For example:
    8:45 PM - 11:20 PM 
    Akasa Air
    DEL - GOX 
    Non-stop
    2 hr 35 min
    ₹14,261 round trip

    Show exactly 5 flights with different airlines and timings if available.
    Only include the flight information, no introduction or explanation.
    `;

    // Call Gemini API directly
    const geminiResponse = await callGeminiAPI(prompt);
    
    // Parse the response
    const flights = parseGeminiFlightData(geminiResponse);
    
    // Return both raw response and parsed flights
    res.json({
      success: true,
      raw_response: geminiResponse,
      parsed_flights: flights.map(flight => {
        return {
          ...flight,
          details: {
            ...flight.details,
            origin: flight.details.origin || getIATACode(origin),
            destination: flight.details.destination || getIATACode(destination)
          }
        };
      }),
      count: flights.length
    });
    
  } catch (error) {
    console.error('[TravelOptions] Test flights error:', error.message);
    res.status(500).json({ 
      message: 'Error fetching flight data', 
      error: error.message 
    });
  }
});

module.exports = router; 