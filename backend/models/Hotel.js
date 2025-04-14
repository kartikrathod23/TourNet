const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['single', 'double', 'twin', 'suite', 'deluxe', 'family', 'presidential']
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  amenities: [String],
  description: String,
  images: [String],
  mainImage: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availability: [{
    date: Date,
    isAvailable: Boolean,
    price: Number
  }]
});

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hotel name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  starRating: {
    type: Number,
    required: [true, 'Star rating is required'],
    min: 1,
    max: 5
  },
  amenities: [String],
  images: [String],
  mainImage: String,
  rooms: [RoomSchema],
  policies: {
    checkInTime: String,
    checkOutTime: String,
    cancellationPolicy: String,
    petsAllowed: {
      type: Boolean,
      default: false
    },
    extraBedPolicy: String
  },
  contactPerson: {
    name: String,
    position: String,
    phone: String,
    email: String
  },
  licenseNumber: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchCode: String,
    ifscCode: String
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
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
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
HotelSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
HotelSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, type: 'hotel' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Match hotel entered password to hashed password in database
HotelSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Define index for search functionality
HotelSchema.index({ name: 'text', description: 'text', 'address.city': 'text' });

module.exports = mongoose.model('Hotel', HotelSchema); 