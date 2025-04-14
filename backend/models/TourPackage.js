const mongoose = require('mongoose');

const TourPackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  highlights: [String],
  duration: {
    days: {
      type: Number,
      required: [true, 'Please specify the number of days'],
      min: [1, 'Duration must be at least 1 day']
    },
    nights: {
      type: Number,
      required: [true, 'Please specify the number of nights'],
      min: [0, 'Nights cannot be negative']
    }
  },
  destinations: [{
    name: {
      type: String,
      required: true
    },
    country: String,
    stayDuration: {
      type: Number,
      default: 1
    },
    description: String,
    activities: [String]
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    activities: [String],
    meals: {
      breakfast: {
        type: Boolean,
        default: false
      },
      lunch: {
        type: Boolean,
        default: false
      },
      dinner: {
        type: Boolean,
        default: false
      }
    },
    accommodation: {
      name: String,
      type: {
        type: String,
        enum: ['hotel', 'resort', 'homestay', 'guesthouse', 'camping', 'not included'],
        default: 'hotel'
      },
      rating: Number
    }
  }],
  price: {
    amount: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceIncludes: [String],
    priceExcludes: [String]
  },
  accommodationDetails: {
    type: [
      {
        name: String,
        location: String,
        rating: Number,
        description: String,
        amenities: [String]
      }
    ],
    default: []
  },
  transportDetails: {
    type: [
      {
        type: {
          type: String,
          enum: ['flight', 'train', 'bus', 'car', 'cruise', 'other'],
          required: true
        },
        description: String,
        provider: String,
        details: String
      }
    ],
    default: []
  },
  groupSize: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 20
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'difficult'],
    default: 'moderate'
  },
  ageRestriction: {
    minAge: {
      type: Number,
      default: 0
    },
    maxAge: {
      type: Number,
      default: 99
    }
  },
  images: [String],
  mainImage: String,
  startDates: [Date],
  isCustomizable: {
    type: Boolean,
    default: false
  },
  categories: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentCompany: {
    type: String,
    required: [true, 'Please provide your company name']
  },
  agentContactInfo: {
    phone: String,
    email: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  bookingCount: {
    type: Number,
    default: 0
  },
  discounts: {
    hasDiscount: {
      type: Boolean,
      default: false
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100%']
    },
    discountDescription: String,
    validUntil: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define virtual property for formatted price
TourPackageSchema.virtual('formattedPrice').get(function() {
  return `${this.price.currency} ${this.price.amount.toLocaleString()}`;
});

// Define index for search functionality
TourPackageSchema.index({ title: 'text', description: 'text', 'destinations.name': 'text' });

module.exports = mongoose.model('TourPackage', TourPackageSchema); 