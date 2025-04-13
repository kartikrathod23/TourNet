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
const { protect, authorize } = require('../middleware/auth');

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

// @route   PATCH /api/payments/:id/status
// @desc    Update payment status
// @access  Private (Admin/Agent)
router.patch('/:id/status', protect, authorize('admin', 'agent'), updatePaymentStatus);

// @route   POST /api/payments/:id/refund
// @desc    Process a refund
// @access  Private (Admin/Agent)
router.post('/:id/refund', protect, authorize('admin', 'agent'), processRefund);

// @route   GET /api/payments/:id/invoice
// @desc    Generate an invoice for payment
// @access  Private
router.get('/:id/invoice', protect, generateInvoice);

module.exports = router; 