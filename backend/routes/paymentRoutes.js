const express = require('express');
const router = express.Router();
const { 
  createPayment,
  getPaymentById,
  getUserPayments,
  updatePaymentStatus,
  processRefund,
  generateInvoice
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/payments
// @desc    Create a new payment
// @access  Private
router.post('/', protect, createPayment);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, getPaymentById);

// @route   GET /api/payments
// @desc    Get all payments for a user
// @access  Private
router.get('/', protect, getUserPayments);

// @route   PUT /api/payments/:id/status
// @desc    Update payment status
// @access  Private/Admin
router.put('/:id/status', protect, admin, updatePaymentStatus);

// @route   POST /api/payments/:id/refund
// @desc    Process a refund
// @access  Private
router.post('/:id/refund', protect, processRefund);

// @route   POST /api/payments/:id/invoice
// @desc    Generate invoice for a payment
// @access  Private
router.post('/:id/invoice', protect, generateInvoice);

module.exports = router; 