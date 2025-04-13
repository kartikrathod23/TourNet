import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // In a real application, this would send data to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Something went wrong while submitting your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Office locations
  const offices = [
    {
      city: 'New York',
      address: '1234 Broadway, Suite 500\nNew York, NY 10001',
      phone: '+1 (212) 555-7890',
      email: 'newyork@tournet.com',
      hours: 'Mon-Fri: 9am-6pm EST'
    },
    {
      city: 'London',
      address: '45 Oxford Street\nLondon, W1D 2DZ\nUnited Kingdom',
      phone: '+44 20 7123 4567',
      email: 'london@tournet.com',
      hours: 'Mon-Fri: 9am-6pm GMT'
    },
    {
      city: 'Singapore',
      address: '100 Orchard Road #10-01\nSingapore 238840',
      phone: '+65 6123 4567',
      email: 'singapore@tournet.com',
      hours: 'Mon-Fri: 9am-6pm SGT'
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'How do I cancel or modify my booking?',
      answer: 'You can cancel or modify your booking by logging into your account and visiting the "My Bookings" section. Changes made within 48 hours of your scheduled departure may incur additional fees.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'Our refund policy varies depending on the type of booking and the provider\'s terms. Generally, cancellations made 7+ days in advance receive a full refund, while cancellations within 2-7 days receive a 50% refund. Please check the specific terms for your booking.'
    },
    {
      question: 'How can I get assistance during my trip?',
      answer: 'During your trip, you can contact our 24/7 support team via the app, email at support@tournet.com, or call our emergency hotline at +1-888-TOURNET. Local emergency contact details are also provided in your booking confirmation.'
    },
    {
      question: 'Do you offer travel insurance?',
      answer: 'Yes, we offer comprehensive travel insurance through our partners. You can add insurance during the booking process or contact our customer service team to add it to an existing booking.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We're here to help with any questions about your travel plans. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>
      
      {/* Contact Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Call Us Card */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Our support team is available to help you 24/7</p>
              <a href="tel:+18001234567" className="text-blue-600 font-medium hover:underline">+1 (800) 123-4567</a>
            </div>
            
            {/* Email Card */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us an email and we'll respond as soon as possible</p>
              <a href="mailto:support@tournet.com" className="text-blue-600 font-medium hover:underline">support@tournet.com</a>
            </div>
            
            {/* Live Chat Card */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our travel experts in real-time</p>
              <button 
                onClick={() => document.querySelector('.ChatSupport button').click()} 
                className="text-blue-600 font-medium hover:underline"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form and Offices */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              {success ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                  Your message has been sent successfully! We'll get back to you as soon as possible.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
            
            {/* Office Locations */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                    <h3 className="text-xl font-semibold mb-2">{office.city}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-700 whitespace-pre-line">{office.address}</p>
                        <p className="text-gray-600 mt-2">{office.hours}</p>
                      </div>
                      <div>
                        <p className="mb-1">
                          <span className="text-gray-500">Phone: </span>
                          <a href={`tel:${office.phone}`} className="text-blue-600 hover:underline">{office.phone}</a>
                        </p>
                        <p>
                          <span className="text-gray-500">Email: </span>
                          <a href={`mailto:${office.email}`} className="text-blue-600 hover:underline">{office.email}</a>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Find Us</h2>
          <div className="bg-gray-200 rounded-xl overflow-hidden h-96 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600">
                {/* In a real app, replace this with an actual map component (Google Maps, Mapbox, etc.) */}
                Interactive map would be displayed here, showing our global office locations
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link to="/faq" className="text-blue-600 font-medium hover:underline">
              Visit our comprehensive FAQ page
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-100 text-center text-gray-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 TourNet · All rights reserved</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
              <Link to="/contact" className="hover:text-blue-600 transition">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact; 