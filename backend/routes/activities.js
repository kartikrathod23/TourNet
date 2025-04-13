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
    console.log('[Activities] Getting new Amadeus access token');
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
    console.error('[Activities] Error getting Amadeus token:', error.message);
    throw error;
  }
}

// Get coordinates for a city using Amadeus API
async function getCityCoordinates(cityName) {
  try {
    console.log(`[Activities] Searching for city: ${cityName}`);
    
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
      console.log(`[Activities] Found city: ${cityInfo.name}`);
      
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
    console.log('[Activities] City not found in Amadeus, using default location (Paris)');
    return {
      lat: 48.8566,
      lon: 2.3522,
      name: cityName || 'Paris',
      country: 'France',
      iataCode: 'PAR',
      cityCode: 'PAR'
    };
  } catch (error) {
    console.error('[Activities] Error getting city coordinates:', error.message);
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

// Get activities using Amadeus Activities API
async function getActivitiesInArea(cityData) {
  try {
    console.log(`[Activities] Searching for activities in: ${cityData.name}`);
    const token = await getAmadeusToken();
    
    // Try to use the Amadeus Activities API
    try {
      const response = await axios.get('https://test.api.amadeus.com/v1/shopping/activities', {
        params: {
          latitude: cityData.lat,
          longitude: cityData.lon,
          radius: 20
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log(`[Activities] Found ${response.data.data.length} activities with Amadeus API`);
        
        // Convert Amadeus activities data to our format
        const activities = response.data.data.map((activity, index) => {
          const randomPrice = Math.floor(Math.random() * 2000) + 500;
          return {
            id: activity.id || `activity-${index}`,
            name: activity.name,
            shortDescription: activity.shortDescription || `Experience the magic of ${cityData.name} with this popular activity`,
            description: activity.description || `Discover the beauty and culture of ${cityData.name} with this amazing experience`,
            rating: activity.rating || (3.5 + Math.random() * 1.5).toFixed(1),
            reviewCount: Math.floor(Math.random() * 500) + 50,
            price: {
              amount: activity.price?.amount || randomPrice,
              currencyCode: activity.price?.currencyCode || 'INR'
            },
            pictures: activity.pictures || [`https://picsum.photos/seed/${activity.id || index}/800/500`],
            bookingLink: activity.bookingLink || '#',
            location: {
              name: cityData.name,
              country: cityData.country,
              coordinates: {
                latitude: cityData.lat,
                longitude: cityData.lon
              }
            },
            categories: activity.categories || ['Popular', 'Local Experience'],
            duration: activity.duration || `${Math.floor(Math.random() * 5) + 1} hours`,
            inclusions: ['Professional guide', 'Transportation', 'Entrance fees', 'Bottled water'],
            cancellationType: activity.cancellationType || 'FREE_CANCELLATION'
          };
        });
        
        return activities;
      }
    } catch (error) {
      console.error('[Activities] Error with Amadeus activities search:', error.message);
      // Continue to fallback if Amadeus API fails
    }
    
    // If Amadeus API failed or didn't return results, use generated data
    console.log('[Activities] Using mock activities data for', cityData.name);
    return generateMockActivities(cityData);
  } catch (error) {
    console.error('[Activities] Error getting activities in area:', error.message);
    return generateMockActivities(cityData);
  }
}

// Generate mock activity data based on city characteristics
function generateMockActivities(cityData) {
  console.log(`[Activities] Generating robust mock activities for ${cityData.name}`);
  
  // Famous world cities data (inspired by Wikipedia information)
  const famousCitiesData = {
    'paris': {
      attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées', 'Arc de Triomphe', 'Montmartre', 'Seine River'],
      specialties: ['Gourmet Food Tours', 'Wine Tasting', 'Art Gallery Visits', 'Fashion Walking Tours'],
      description: 'Known as the City of Light, Paris is famous for its café culture, museums, fashion scene, and romantic ambiance.'
    },
    'london': {
      attractions: ['Big Ben', 'Buckingham Palace', 'Tower of London', 'British Museum', 'London Eye', 'Westminster Abbey', 'Hyde Park'],
      specialties: ['Royal History Tours', 'British Pub Crawls', 'Thames River Cruises', 'Shakespeare Experiences'],
      description: 'A diverse and vibrant capital with centuries of history, famous landmarks, and a blend of ancient tradition and cutting-edge innovation.'
    },
    'rome': {
      attractions: ['Colosseum', 'Roman Forum', 'Vatican City', 'Trevi Fountain', 'Pantheon', 'Spanish Steps', 'Palatine Hill'],
      specialties: ['Ancient Rome Tours', 'Vatican Excursions', 'Italian Cooking Classes', 'Vespa Tours'],
      description: 'The Eternal City with nearly 3,000 years of globally influential art, architecture, and ancient ruins visible alongside modern life.'
    },
    'new york': {
      attractions: ['Statue of Liberty', 'Times Square', 'Central Park', 'Empire State Building', 'Brooklyn Bridge', 'Metropolitan Museum of Art'],
      specialties: ['Broadway Show Experiences', 'NYC Food Tours', 'Harbor Cruises', 'Art Gallery Walks'],
      description: 'The Big Apple offers world-class dining, shopping, and entertainment alongside iconic skyscrapers and diverse neighborhoods.'
    },
    'tokyo': {
      attractions: ['Tokyo Skytree', 'Senso-ji Temple', 'Meiji Shrine', 'Shibuya Crossing', 'Imperial Palace', 'Tsukiji Fish Market'],
      specialties: ['Sushi Making Classes', 'Anime and Manga Tours', 'Sumo Wrestling Experiences', 'Robot Restaurant Shows'],
      description: 'A city where ultramodern meets traditional, with neon-lit skyscrapers, historic temples, and a vibrant food scene.'
    },
    'sydney': {
      attractions: ['Sydney Opera House', 'Sydney Harbour Bridge', 'Bondi Beach', 'Darling Harbour', 'Royal Botanic Garden', 'Taronga Zoo'],
      specialties: ['Harbour Sailing Tours', 'Surf Lessons', 'Aboriginal Heritage Walks', 'Coastal Hiking Experiences'],
      description: 'Australia\'s harbor city known for its stunning architecture, beautiful beaches, and laid-back outdoor lifestyle.'
    },
    'barcelona': {
      attractions: ['Sagrada Familia', 'Park Güell', 'Casa Batlló', 'La Rambla', 'Gothic Quarter', 'Barceloneta Beach'],
      specialties: ['Gaudí Architecture Tours', 'Catalan Cooking Classes', 'Flamenco Shows', 'Wine Country Excursions'],
      description: 'A city known for its art and architecture, with Antoni Gaudí\'s unique buildings, vibrant street life, and Mediterranean beaches.'
    },
    'dubai': {
      attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Creek', 'Dubai Marina', 'Jumeirah Mosque'],
      specialties: ['Desert Safari Expeditions', 'Luxury Yacht Cruises', 'Gold Souk Shopping Tours', 'Sky Dining Experiences'],
      description: 'A city of superlatives with futuristic architecture, luxury shopping, and a blend of Arabian tradition and modern innovation.'
    },
    'cairo': {
      attractions: ['Great Pyramids of Giza', 'Egyptian Museum', 'Sphinx', 'Khan el-Khalili Bazaar', 'Al-Azhar Mosque', 'Nile River'],
      specialties: ['Pyramid Archaeological Tours', 'Nile Dinner Cruises', 'Desert Adventures', 'Ancient History Expeditions'],
      description: 'One of the world\'s oldest cities with ancient monuments, bustling markets, and thousands of years of history.'
    },
    'rio de janeiro': {
      attractions: ['Christ the Redeemer', 'Copacabana Beach', 'Sugarloaf Mountain', 'Tijuca Forest', 'Maracanã Stadium', 'Lapa Steps'],
      specialties: ['Samba Dance Lessons', 'Carnival Experiences', 'Hiking and Nature Tours', 'Beach Sports Lessons'],
      description: 'The Marvelous City famous for its natural setting, vibrant culture, samba music, and spectacular Carnival celebrations.'
    },
    'mumbai': {
      attractions: ['Gateway of India', 'Elephanta Caves', 'Marine Drive', 'Chhatrapati Shivaji Terminus', 'Dhobi Ghat', 'Haji Ali Dargah'],
      specialties: ['Bollywood Studio Tours', 'Mumbai Street Food Walks', 'Dharavi Tours', 'Harbor Cruises'],
      description: 'India\'s energetic financial capital with a vibrant film industry, colonial architecture, and bustling street markets.'
    },
    'bangkok': {
      attractions: ['Grand Palace', 'Wat Arun', 'Chatuchak Market', 'Chao Phraya River', 'Wat Pho', 'Khao San Road'],
      specialties: ['Thai Cooking Classes', 'Temple Tours', 'Floating Market Visits', 'Tuk-Tuk Food Adventures'],
      description: 'Thailand\'s capital city known for ornate shrines, vibrant street life, boat-filled canals, and exquisite cuisine.'
    },
    'istanbul': {
      attractions: ['Hagia Sophia', 'Blue Mosque', 'Topkapi Palace', 'Grand Bazaar', 'Bosphorus Strait', 'Spice Bazaar'],
      specialties: ['Bosphorus Cruises', 'Turkish Bath Experiences', 'Food and Spice Tours', 'Islamic Art Walks'],
      description: 'A transcontinental city straddling Europe and Asia, known for its Byzantine and Ottoman architecture and rich history.'
    },
    'venice': {
      attractions: ['Grand Canal', 'St. Mark\'s Square', 'Doge\'s Palace', 'Rialto Bridge', 'Murano Island', 'Burano Island'],
      specialties: ['Gondola Rides', 'Mask-Making Workshops', 'Venetian Glass Tours', 'Secret Passages Walks'],
      description: 'The Floating City built on a network of canals, known for its romantic ambiance, Gothic architecture, and carnival celebrations.'
    },
    'amsterdam': {
      attractions: ['Canal Ring', 'Van Gogh Museum', 'Anne Frank House', 'Rijksmuseum', 'Vondelpark', 'Royal Palace'],
      specialties: ['Canal Cruises', 'Bike Tours', 'Cheese Tasting Experiences', 'Dutch Art Walks'],
      description: 'A city known for its artistic heritage, elaborate canal system, narrow houses, and cyclist-friendly infrastructure.'
    },
    'prague': {
      attractions: ['Prague Castle', 'Charles Bridge', 'Old Town Square', 'Astronomical Clock', 'St. Vitus Cathedral', 'Petřín Hill'],
      specialties: ['Beer Tasting Tours', 'Medieval History Walks', 'Classical Music Concerts', 'Underground Passages Tours'],
      description: 'The City of a Hundred Spires, known for its Old Town Square, colorful baroque buildings, Gothic churches, and medieval Astronomical Clock.'
    },
    'marrakech': {
      attractions: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Bahia Palace', 'Koutoubia Mosque', 'Medina of Marrakech', 'Saadian Tombs'],
      specialties: ['Souk Shopping Tours', 'Moroccan Cooking Classes', 'Desert Camel Treks', 'Hammam Spa Experiences'],
      description: 'A former imperial city known for its vibrant markets, gardens, palaces, and the medina, a walled medieval city dating to the Berber Empire.'
    },
    'kyoto': {
      attractions: ['Fushimi Inari Shrine', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera Temple', 'Gion District'],
      specialties: ['Tea Ceremony Experiences', 'Geisha District Tours', 'Traditional Craft Workshops', 'Zen Meditation Sessions'],
      description: 'Japan\'s former capital known for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses.'
    },
    'delhi': {
      attractions: ['Red Fort', 'Qutub Minar', 'Humayun\'s Tomb', 'India Gate', 'Lotus Temple', 'Jama Masjid'],
      specialties: ['Old Delhi Food Tours', 'Heritage Walking Experiences', 'Mughal Architecture Tours', 'Spiritual Temple Visits'],
      description: 'India\'s capital territory encompasses New Delhi with its British colonial architecture and Old Delhi with its ancient monuments and bustling markets.'
    },
    'agra': {
      attractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Itimad-ud-Daulah', 'Mehtab Bagh', 'Akbar\'s Tomb'],
      specialties: ['Sunrise Taj Mahal Tours', 'Mughal Heritage Walks', 'Marble Craft Demonstrations', 'River Yamuna Boat Rides'],
      description: 'Home to the iconic Taj Mahal, this city showcases some of the finest examples of Mughal architecture in India.'
    },
    'athens': {
      attractions: ['Acropolis', 'Parthenon', 'Ancient Agora', 'National Archaeological Museum', 'Plaka District', 'Temple of Olympian Zeus'],
      specialties: ['Ancient Greek History Tours', 'Greek Cooking Classes', 'Mythology Walking Tours', 'Olive Oil Tastings'],
      description: 'Greece\'s capital and Europe\'s historical capital, dominated by 5th-century BC landmarks including the Acropolis and Parthenon.'
    },
    'jaipur': {
      attractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Jal Mahal', 'Albert Hall Museum'],
      specialties: ['Elephant Rides', 'Block Printing Workshops', 'Rajasthani Cooking Classes', 'Heritage Walking Tours'],
      description: 'The Pink City, known for its distinctive terracotta pink buildings, royal heritage, and colorful bazaars.'
    },
    'varanasi': {
      attractions: ['Ganges River', 'Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Sarnath', 'Ramnagar Fort', 'Assi Ghat'],
      specialties: ['Sunrise Boat Rides', 'Evening Aarti Ceremonies', 'Spiritual Walking Tours', 'Classical Music Performances'],
      description: 'One of the world\'s oldest continuously inhabited cities and a major religious hub for Hinduism, known for its ghats along the Ganges River.'
    },
    'hong kong': {
      attractions: ['Victoria Peak', 'Victoria Harbour', 'Tian Tan Buddha', 'Temple Street Night Market', 'Hong Kong Disneyland', 'Star Ferry'],
      specialties: ['Harbor Cruise Tours', 'Dim Sum Cooking Classes', 'Shopping Experiences', 'Night Market Adventures'],
      description: 'A global financial center known for its skyscraper-studded skyline, vibrant food scene, and blend of Eastern and Western influences.'
    },
    'singapore': {
      attractions: ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa Island', 'Singapore Zoo', 'Orchard Road', 'Merlion Park'],
      specialties: ['Street Food Tours', 'Night Safari Experiences', 'Cultural Heritage Walks', 'River Cruises'],
      description: 'A global financial center with tropical gardens, diverse food scene, and innovative urban attractions.'
    },
    'berlin': {
      attractions: ['Brandenburg Gate', 'Berlin Wall Memorial', 'Reichstag Building', 'Museum Island', 'Checkpoint Charlie', 'Tiergarten'],
      specialties: ['Cold War History Tours', 'Street Art Walks', 'Beer and Food Tastings', 'Alternative Berlin Experiences'],
      description: 'Germany\'s capital, known for its art scene, modern landmarks, and complex history, with remnants of the city\'s divided past still visible.'
    },
    'seoul': {
      attractions: ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'N Seoul Tower', 'Myeongdong', 'Changdeokgung Palace', 'Insadong'],
      specialties: ['K-Pop and K-Drama Tours', 'Korean Cooking Classes', 'Traditional Hanbok Experiences', 'Temple Stay Programs'],
      description: 'South Korea\'s capital that blends modern skyscrapers with traditional temples and vibrant street markets.'
    }
  };
  
  // Normalize city name for lookup
  const normalizedCityName = cityData.name.toLowerCase().trim();
  
  // Find if we have specific data for this city or similar
  let citySpecificData = null;
  for (const [cityKey, data] of Object.entries(famousCitiesData)) {
    if (normalizedCityName.includes(cityKey) || cityKey.includes(normalizedCityName)) {
      citySpecificData = data;
      console.log(`[Activities] Found specific data for ${cityData.name} using match: ${cityKey}`);
      break;
    }
  }
  
  // If no specific data, use a default template but with the city name
  if (!citySpecificData) {
    console.log(`[Activities] No specific data found for ${cityData.name}, using generic template with nearby city data`);
    
    // Try to find nearby/similar cities (for example, use Paris data for French cities)
    const country = cityData.country.toLowerCase();
    const countryMatches = {
      'france': 'paris',
      'italy': 'rome',
      'spain': 'barcelona',
      'uk': 'london',
      'united kingdom': 'london',
      'usa': 'new york',
      'united states': 'new york',
      'japan': 'tokyo',
      'china': 'hong kong',
      'india': 'delhi',
      'australia': 'sydney',
      'germany': 'berlin',
      'thailand': 'bangkok',
      'egypt': 'cairo',
      'brazil': 'rio de janeiro',
      'netherlands': 'amsterdam',
      'czech republic': 'prague',
      'greece': 'athens',
      'turkey': 'istanbul',
      'austria': 'vienna',
      'switzerland': 'zurich',
      'russia': 'moscow',
      'canada': 'toronto',
      'mexico': 'mexico city',
      'morocco': 'marrakech',
      'portugal': 'lisbon',
      'hungary': 'budapest'
    };
    
    // Try to find a country match
    let fallbackCityKey = null;
    if (countryMatches[country]) {
      fallbackCityKey = countryMatches[country];
      console.log(`[Activities] Using data from ${fallbackCityKey} for city in ${cityData.country}`);
      citySpecificData = famousCitiesData[fallbackCityKey];
    }
    
    // If still no match, use a random major city's data
    if (!citySpecificData) {
      const majorCities = ['paris', 'london', 'rome', 'new york', 'tokyo'];
      fallbackCityKey = majorCities[Math.floor(Math.random() * majorCities.length)];
      console.log(`[Activities] Using random major city data from ${fallbackCityKey}`);
      citySpecificData = famousCitiesData[fallbackCityKey];
    }
  }
  
  // Convert city-specific data into activities
  // Create activities from the major attractions (with city name replacement)
  const attractionActivities = citySpecificData.attractions.map((attraction, index) => {
    return {
      name: `${cityData.name} ${attraction} Experience`,
      shortDescription: `Explore the iconic ${attraction} in ${cityData.name}`,
      description: `Discover the fascinating history and beauty of ${attraction}, one of the must-visit attractions in ${cityData.name}. Learn about its significance to the city and capture unforgettable memories with our expert guides.`,
      category: 'Attractions',
      priority: index
    };
  });
  
  // Add specialty activities for this city
  const specialtyActivities = citySpecificData.specialties.map((specialty, index) => {
    return {
      name: `${cityData.name} ${specialty}`,
      shortDescription: `Experience authentic ${specialty} in the heart of ${cityData.name}`,
      description: `Immerse yourself in local culture with this authentic ${specialty} experience. Our knowledgeable local experts will guide you through a unique adventure that showcases the best of ${cityData.name}'s traditions and lifestyle.`,
      category: 'Local Experiences',
      priority: index
    };
  });
  
  // Create a general city tour using the description
  const cityTour = {
    name: `Complete ${cityData.name} City Tour`,
    shortDescription: `See the best of ${cityData.name} in one comprehensive tour`,
    description: `${citySpecificData.description.replace(/^[A-Za-z\s']+/, cityData.name)} This guided tour takes you to the most iconic spots of ${cityData.name} including ${citySpecificData.attractions.slice(0, 3).join(', ')} and more. Ideal for first-time visitors who want to get acquainted with this magnificent city.`,
    category: 'Tours',
    priority: 0
  };
  
  // Create a food tour
  const foodTour = {
    name: `${cityData.name} Food & Culture Tour`,
    shortDescription: `Taste the authentic flavors of ${cityData.name}`,
    description: `Explore the culinary heritage of ${cityData.name} through its most delicious dishes and food markets. Sample local specialties, meet chefs and food artisans, and learn about the cultural significance of the local cuisine.`,
    category: 'Food & Drink',
    priority: 1
  };
  
  // Create a night tour/experience
  const nightTour = {
    name: `${cityData.name} by Night Experience`,
    shortDescription: `Discover the magic of ${cityData.name} after dark`,
    description: `Experience the enchanting atmosphere of ${cityData.name} illuminated at night. See famous landmarks beautifully lit up, enjoy the vibrant nightlife, and discover a different side to the city under the stars.`,
    category: 'Nightlife',
    priority: 2
  };
  
  // Add a traditional cultural experience
  const culturalExperience = {
    name: `Traditional ${cityData.country} Experience in ${cityData.name}`,
    shortDescription: `Immerse yourself in authentic ${cityData.country} culture`,
    description: `Discover the rich cultural heritage of ${cityData.country} with this authentic local experience in ${cityData.name}. Learn about traditions, customs, and way of life from knowledgeable local guides who are passionate about sharing their culture.`,
    category: 'Cultural',
    priority: 3
  };
  
  // Combine all activities and prioritize
  const allActivities = [
    cityTour,
    foodTour,
    nightTour,
    culturalExperience,
    ...attractionActivities,
    ...specialtyActivities
  ];
  
  // Format activities and add all necessary information
  return allActivities.map((activity, index) => {
    const priorityFactor = activity.priority || index;
    const randomPrice = Math.floor(Math.random() * 1500) + 800 - (priorityFactor * 50);
    
    return {
      id: `activity-${cityData.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      name: activity.name,
      shortDescription: activity.shortDescription,
      description: activity.description,
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      reviewCount: Math.floor(Math.random() * 800) + 100,
      price: {
        amount: randomPrice,
        currencyCode: 'INR'
      },
      pictures: [`https://picsum.photos/seed/${cityData.name}-${index}/800/500`],
      bookingLink: '#',
      location: {
        name: cityData.name,
        country: cityData.country,
        coordinates: {
          latitude: cityData.lat,
          longitude: cityData.lon
        }
      },
      categories: [activity.category, 'Popular'],
      duration: `${Math.floor(Math.random() * 4) + 2} hours`,
      inclusions: ['Expert local guide', 'Skip-the-line access', 'Complimentary refreshments', 'Hotel pickup (select hotels)'],
      cancellationType: 'FREE_CANCELLATION'
    };
  });
}

// Route for popular activities search by city
router.get('/popular', async (req, res) => {
  try {
    const city = req.query.city || 'Paris';
    console.log(`[Activities] Received request for popular activities in: ${city}`);
    
    // First get coordinates for the city
    const cityData = await getCityCoordinates(city);
    
    if (!cityData) {
      console.log(`[Activities] Failed to find coordinates for city: ${city}`);
      return res.status(404).json({ 
        success: false, 
        error: 'City not found. Please try another location.'
      });
    }
    
    // Then get activities in that area
    const activities = await getActivitiesInArea(cityData);
    
    console.log(`[Activities] Sending response with ${activities.length} activities for ${cityData.name}`);
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
        activities: activities
      }
    });
  } catch (err) {
    console.error('[Activities] API error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Activities API fetch failed', 
      message: err.message 
    });
  }
});

// Legacy route - keep for backward compatibility
router.get('/', async (req, res) => {
  try {
    const { lat = '48.8566', lng = '2.3522', city = 'Paris' } = req.query;
    console.log(`[Activities] Received request on legacy endpoint with coordinates: ${lat}, ${lng}`);
    
    // Create cityData object from coordinates
    const cityData = {
      lat: parseFloat(lat),
      lon: parseFloat(lng),
      name: city,
      country: 'Unknown', // We don't have country info from just coordinates
      population: 500000
    };
    
    // Get activities
    const activities = await getActivitiesInArea(cityData);
    
    console.log(`[Activities] Sending response with ${activities.length} activities for coordinates ${lat}, ${lng}`);
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
        activities: activities
      }
    });
  } catch (err) {
    console.error('[Activities] Legacy API error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Activities API fetch failed', 
      message: err.message 
    });
  }
});

module.exports = router;
