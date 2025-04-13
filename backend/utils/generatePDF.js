const fs = require('fs');
const path = require('path');
const util = require('util');
const PDFDocument = require('pdfkit');

/**
 * Generates a PDF invoice for a payment
 * @param {Object} payment - The payment object
 * @param {Object} booking - The booking object
 * @param {Object} user - The user object
 * @returns {Buffer} - The PDF document as a buffer
 */
const generatePDF = async (payment, booking, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Buffer to store PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add content to PDF
      // Header
      doc.fontSize(25).text('TourNet Invoice', { align: 'center' });
      doc.moveDown();
      
      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice #: ${payment._id}`);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${payment.status}`);
      doc.moveDown();
      
      // User details
      doc.fontSize(14).text('Customer Information');
      doc.fontSize(12);
      doc.text(`Name: ${user.firstName} ${user.lastName}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Phone: ${user.phone || 'N/A'}`);
      doc.moveDown();
      
      // Booking details
      doc.fontSize(14).text('Booking Details');
      doc.fontSize(12);
      doc.text(`Booking ID: ${booking._id}`);
      doc.text(`Destination: ${booking.destination}`);
      doc.text(`Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`);
      doc.text(`Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`);
      doc.text(`Guests: ${booking.guests}`);
      doc.moveDown();
      
      // Payment details
      doc.fontSize(14).text('Payment Details');
      doc.fontSize(12);
      doc.text(`Amount: ${payment.amount} ${payment.currency}`);
      doc.text(`Payment Method: ${payment.paymentMethod}`);
      doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
      doc.moveDown();
      
      // Terms and conditions
      doc.fontSize(10).text('Terms and Conditions', { underline: true });
      doc.text('This is an official receipt for your payment. Please keep this for your records.');
      doc.text('For cancellations and refunds, please refer to our refund policy on our website.');
      doc.text('For any questions, please contact our customer support at support@tournet.com.');
      
      // Footer
      doc.fontSize(10).text('TourNet Inc.', { align: 'center' });
      doc.text('www.tournet.com', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generatePDF; 