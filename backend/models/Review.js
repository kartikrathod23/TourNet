const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['hotel', 'package', 'travel', 'destination'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  photos: [
    {
      url: String,
      caption: String
    }
  ],
  tags: [String],
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  visitDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  replyFromBusiness: {
    content: String,
    date: Date,
    respondentName: String
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

// Create compound index for user and itemId to prevent duplicate reviews
ReviewSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

// Create index for efficient querying by itemId and itemType
ReviewSchema.index({ itemId: 1, itemType: 1 });

module.exports = mongoose.model('Review', ReviewSchema); 