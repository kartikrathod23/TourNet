const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    id: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    price: {
      type: Number,
      required: false
    },
    image: {
      type: String,
      required: false
    }
  },
  checkInDate: {
    type: Date,
    required: false
  },
  checkOutDate: {
    type: Date,
    required: false
  },
  nights: {
    type: Number,
    required: false
  },
  guests: {
    adults: {
      type: Number,
      default: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  activities: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: false
    },
    image: {
      type: String,
      required: false
    }
  }],
  transportation: {
    type: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'taxi', 'other'],
      required: false
    },
    details: {
      type: String,
      required: false
    },
    price: {
      type: Number,
      required: false
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'paid', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  currency: {
    type: String,
    default: 'USD'
  },
  specialRequests: {
    type: String
  },
  bookingType: {
    type: String,
    enum: ['hotel', 'package', 'travel'],
    required: true
  },
  itemDetails: {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    // Store all item details as a flexible structure
    details: { type: Schema.Types.Mixed }
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  travelDates: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  contactInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentInfo: {
    method: { 
      type: String, 
      enum: ['credit', 'debit', 'upi', 'netbanking', 'wallet', 'paypal'],
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: { type: String },
    paidAt: { type: Date },
    receipt: { type: String }
  },
  confirmationNumber: {
    type: String,
    unique: true,
    sparse: true  // Allow null values to exist
  },
  cancellation: {
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    reason: { type: String },
    refundAmount: { type: Number },
    refundStatus: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending'
    }
  },
  updatedAt: { 
    type: Date,
    default: Date.now 
  }
}, { timestamps: true });

// Generate a unique confirmation number
BookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.confirmationNumber) {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.confirmationNumber = `BK${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema); 