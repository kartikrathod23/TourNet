const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DestinationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  description: {
    short: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    long: {
      type: String,
      trim: true
    }
  },
  images: [
    {
      url: String,
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false
      }
    }
  ],
  climate: {
    type: String,
    enum: ['tropical', 'desert', 'mediterranean', 'temperate', 'continental', 'polar', 'alpine'],
  },
  bestTimeToVisit: {
    months: [String],
    notes: String
  },
  features: {
    hasBeach: {
      type: Boolean,
      default: false
    },
    hasMountains: {
      type: Boolean,
      default: false
    },
    isHistorical: {
      type: Boolean,
      default: false
    },
    isCulturalHub: {
      type: Boolean,
      default: false
    },
    isAdventure: {
      type: Boolean,
      default: false
    },
    isRomantic: {
      type: Boolean,
      default: false
    },
    isFamily: {
      type: Boolean,
      default: false
    }
  },
  popularActivities: [String],
  localCuisine: [String],
  travelDuration: {
    fromIndia: {
      type: String
    }
  },
  averageCost: {
    budget: {
      perDay: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    luxury: {
      perDay: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    }
  },
  transportOptions: [String],
  languages: [String],
  travelTips: [String],
  mustVisitAttractions: [
    {
      name: String,
      description: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  ],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  popularity: {
    type: Number,
    default: 0
  },
  currency: {
    code: String,
    name: String,
    symbol: String
  },
  timeZone: String,
  visa: {
    required: {
      type: Boolean,
      default: true
    },
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create index for searching destinations by name
DestinationSchema.index({ name: 'text', country: 'text', region: 'text' });

module.exports = mongoose.model('Destination', DestinationSchema); 