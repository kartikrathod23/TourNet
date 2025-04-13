const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer']
    },
    paymentProvider: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'manual'],
      default: 'stripe'
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
      default: 'pending'
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    receiptUrl: {
      type: String
    },
    billingAddress: {
      streetAddress: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    invoiceId: {
      type: String
    },
    refund: refundSchema,
    metadata: {
      type: Schema.Types.Mixed
    },
    notes: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create index for efficient querying
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ 'refund.status': 1 });

// Add methods to format payment data for admin and user views
paymentSchema.methods.toAdminJSON = function() {
  return {
    id: this._id,
    booking: this.booking,
    user: this.user,
    amount: this.amount,
    currency: this.currency,
    paymentMethod: this.paymentMethod,
    paymentProvider: this.paymentProvider,
    status: this.status,
    paymentDate: this.paymentDate,
    transactionId: this.transactionId,
    receiptUrl: this.receiptUrl,
    billingAddress: this.billingAddress,
    invoiceId: this.invoiceId,
    refund: this.refund,
    metadata: this.metadata,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

paymentSchema.methods.toUserJSON = function() {
  return {
    id: this._id,
    booking: this.booking,
    amount: this.amount,
    currency: this.currency,
    paymentMethod: this.paymentMethod,
    paymentProvider: this.paymentProvider,
    status: this.status,
    paymentDate: this.paymentDate,
    receiptUrl: this.receiptUrl,
    invoiceId: this.invoiceId,
    refund: this.refund && {
      amount: this.refund.amount,
      date: this.refund.date,
      status: this.refund.status,
    },
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 