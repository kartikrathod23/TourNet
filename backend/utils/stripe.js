const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Process a payment with Stripe
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Stripe payment intent or charge object
 */
const processPayment = async (paymentData) => {
  const { amount, currency, description, paymentMethod, customerId, metadata } = paymentData;

  try {
    // If customer doesn't exist, create a new one
    let customer = customerId;
    if (!customer && paymentData.email) {
      const newCustomer = await stripe.customers.create({
        email: paymentData.email,
        name: paymentData.fullName || '',
        metadata: {
          userId: paymentData.userId || ''
        }
      });
      customer = newCustomer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency || 'usd',
      description,
      payment_method: paymentMethod,
      customer,
      metadata,
      confirm: true,
      return_url: process.env.STRIPE_RETURN_URL || 'http://localhost:3000/payment/success'
    });

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      receiptUrl: paymentIntent.charges?.data[0]?.receipt_url
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process a refund with Stripe
 * @param {string} paymentIntentId - The payment intent ID to refund
 * @param {number} amount - The amount to refund in dollars (will be converted to cents)
 * @param {string} reason - The reason for the refund
 * @returns {Promise<Object>} Stripe refund object
 */
const processRefund = async (paymentIntentId, amount, reason) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents or refund full amount
      reason: reason || 'requested_by_customer'
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100 // Convert back to dollars
    };
  } catch (error) {
    console.error('Stripe refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Retrieve payment details from Stripe
 * @param {string} paymentIntentId - The payment intent ID
 * @returns {Promise<Object>} Payment intent details
 */
const getPaymentDetails = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent
    };
  } catch (error) {
    console.error('Error retrieving payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mock payment processor for development/testing
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Mock payment response
 */
const mockPaymentProcessor = async (paymentData) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful payment
  const transactionId = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    success: true,
    paymentIntentId: transactionId,
    status: 'succeeded',
    receiptUrl: `https://example.com/receipts/${transactionId}`
  };
};

/**
 * Mock refund processor for development/testing
 * @param {string} paymentIntentId - The payment ID to refund
 * @param {number} amount - The amount to refund
 * @param {string} reason - The reason for the refund
 * @returns {Promise<Object>} Mock refund response
 */
const mockRefundProcessor = async (paymentIntentId, amount, reason) => {
  // Simulate refund processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful refund
  const refundId = `refund_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    success: true,
    refundId,
    status: 'succeeded',
    amount: amount || 0
  };
};

module.exports = {
  processPayment: process.env.NODE_ENV === 'production' ? processPayment : mockPaymentProcessor,
  processRefund: process.env.NODE_ENV === 'production' ? processRefund : mockRefundProcessor,
  getPaymentDetails
}; 