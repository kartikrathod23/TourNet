const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const stripe = require('../config/stripe');
const generatePDF = require('../utils/generatePDF');

/**
 * @desc    Create a new payment
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    amount,
    currency,
    paymentMethod,
    paymentProvider,
    billingAddress
  } = req.body;

  if (!bookingId || !amount || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide all required payment information');
  }

  // Verify booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Verify user owns the booking
  if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to make payment for this booking');
  }

  // Process payment with selected provider (e.g., Stripe)
  let paymentIntent;
  let transactionId;
  let receiptUrl;

  try {
    if (paymentProvider === 'stripe') {
      // Create payment intent with Stripe
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents for Stripe
        currency: currency || 'USD',
        payment_method: paymentMethod,
        confirm: true,
        description: `Booking ${bookingId} payment`,
        metadata: {
          bookingId,
          userId: req.user._id.toString()
        }
      });
      
      transactionId = paymentIntent.id;
      receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
    } else {
      // Mock payment processing for other providers
      transactionId = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      receiptUrl = null;
    }

    // Create payment record in database
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      paymentProvider: paymentProvider || 'stripe',
      status: 'completed',
      paymentDate: new Date(),
      transactionId,
      receiptUrl,
      billingAddress,
      metadata: {
        paymentIntentId: paymentIntent?.id,
        paymentMethodId: paymentMethod
      }
    });

    // Update booking status
    await Booking.findByIdAndUpdate(bookingId, { 
      paymentStatus: 'paid',
      payment: payment._id
    });

    res.status(201).json(payment.toUserJSON());

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(400);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Check if user is authorized to view this payment
  if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  if (req.user.role === 'admin') {
    res.json(payment.toAdminJSON());
  } else {
    res.json(payment.toUserJSON());
  }
});

/**
 * @desc    Get all payments for a user
 * @route   GET /api/payments
 * @access  Private
 */
const getUserPayments = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const sortBy = req.query.sortBy || '-paymentDate';
  
  // Filter criteria
  const filterCriteria = {};
  
  // If not admin, only show current user's payments
  if (req.user.role !== 'admin') {
    filterCriteria.user = req.user._id;
  } else if (req.query.userId) {
    // Admin can filter by user ID
    filterCriteria.user = req.query.userId;
  }
  
  // Filter by status
  if (req.query.status) {
    filterCriteria.status = req.query.status;
  }
  
  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    filterCriteria.paymentDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const count = await Payment.countDocuments(filterCriteria);
  
  const payments = await Payment.find(filterCriteria)
    .sort(sortBy)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .populate({
      path: 'booking',
      select: 'bookingDate totalPrice tourName'
    })
    .populate({
      path: 'user',
      select: 'name email'
    });

  // Transform payments based on user role
  const transformedPayments = payments.map(payment => 
    req.user.role === 'admin' ? payment.toAdminJSON() : payment.toUserJSON()
  );

  res.json({
    payments: transformedPayments,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

/**
 * @desc    Update payment status
 * @route   PUT /api/payments/:id/status
 * @access  Private/Admin
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }
  
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  payment.status = status;
  if (notes) {
    payment.notes = notes;
  }
  
  // Update timestamp
  payment.updatedAt = Date.now();
  
  const updatedPayment = await payment.save();
  
  // If payment is marked as refunded or partially_refunded, update booking
  if (status === 'refunded' || status === 'partially_refunded') {
    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: status === 'refunded' ? 'refunded' : 'partially_refunded'
    });
  }
  
  res.json(updatedPayment.toAdminJSON());
});

/**
 * @desc    Process a refund
 * @route   POST /api/payments/:id/refund
 * @access  Private
 */
const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  
  if (!amount) {
    res.status(400);
    throw new Error('Refund amount is required');
  }
  
  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  
  // Verify user owns the payment or is admin
  if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to refund this payment');
  }
  
  // Validate refund amount
  if (amount > payment.amount) {
    res.status(400);
    throw new Error('Refund amount cannot exceed original payment amount');
  }

  try {
    let refundTransaction;
    
    // Process refund with payment provider
    if (payment.paymentProvider === 'stripe' && payment.transactionId) {
      refundTransaction = await stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: amount * 100, // Convert to cents for Stripe
        reason: 'requested_by_customer'
      });
    } else {
      // Mock refund for other providers
      refundTransaction = {
        id: `refund_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        status: 'succeeded'
      };
    }
    
    // Update payment with refund information
    payment.refund = {
      amount,
      date: new Date(),
      reason: reason || 'Customer requested',
      transactionId: refundTransaction.id,
      status: refundTransaction.status === 'succeeded' ? 'completed' : 'processing'
    };
    
    // Update payment status
    if (amount === payment.amount) {
      payment.status = 'refunded';
    } else {
      payment.status = 'partially_refunded';
    }
    
    const updatedPayment = await payment.save();
    
    // Update booking payment status
    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: payment.status
    });
    
    res.json(updatedPayment.toUserJSON());
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(400);
    throw new Error(`Refund processing failed: ${error.message}`);
  }
});

/**
 * @desc    Generate invoice for a payment
 * @route   POST /api/payments/:id/invoice
 * @access  Private
 */
const generateInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user');
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  
  // Verify user owns the payment or is admin
  if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to generate invoice for this payment');
  }
  
  try {
    // Generate PDF invoice
    const pdfBuffer = await generatePDF(payment, payment.booking, payment.user);
    
    // Send PDF as response
    res.contentType('application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500);
    throw new Error(`Invoice generation failed: ${error.message}`);
  }
});

module.exports = {
  createPayment,
  getPaymentById,
  getUserPayments,
  updatePaymentStatus,
  processRefund,
  generateInvoice
}; 