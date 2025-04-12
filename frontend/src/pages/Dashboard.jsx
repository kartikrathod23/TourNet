// src/pages/Dashboard.jsx

import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <header className="bg-gray-300/80 backdrop-blur-md shadow-md px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-700">TourNet</h1>

        {/* Nav Links */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-blue-600 transition">Home</a>
          <a href="#" className="hover:text-blue-600 transition">Destinations</a>
          <a href="#" className="hover:text-blue-600 transition">Bookings</a>
          <a href="#" className="hover:text-blue-600 transition">Support</a>
          <a href="#" className="hover:text-blue-600 transition">Contact</a>
        </nav>

        {/* Auth Buttons */}
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-md cursor-pointer">
          <span className="text-purple-600 text-lg">👤</span>
        </div>
      </header>

      {/* Search Section */}
      <section className="relative w-[97.5vw] h-64 md:h-80 lg:h-[22rem] bg-cover bg-center my-10 rounded-xl mx-4 shadow-lg overflow-hidden"
  style={{
    backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')`,
  }}
>
  {/* Dark overlay for background image */}
  <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center text-center px-4">
    <div>
      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Discover Your Dream Getaway</h3>
      <p className="text-white text-lg md:text-xl mb-6">Explore top destinations, compare travel deals, and book with ease.</p>
      
      {/* Search Section */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">Where do you want to go?</h2>
      <div className="flex justify-center flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search destinations..."
          className="w-72 md:w-96 px-4 py-2 rounded-md border-3 border-gray-100 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
          Search
        </button>
      </div>
    </div>
  </div>
</section>


      {/* Popular Travel Plans */}
      <section className="px-6 md:px-12 py-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">🌍 Popular Travel Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Goa Getaway', 'Himachal Escape', 'Jaipur Heritage'].map((title, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-lg font-bold text-blue-700 mb-2">{title}</h4>
              <p className="text-sm text-gray-600">
                Enjoy a curated travel experience with exclusive deals and hand-picked destinations.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Sections */}
      <section className="px-6 md:px-12 py-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">🚗 Book Your Vehicle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Sedan', 'SUV', 'Tempo Traveller'].map((vehicle, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-lg font-bold text-blue-700 mb-2">{vehicle}</h4>
              <p className="text-sm text-gray-600">Comfortable {vehicle.toLowerCase()} for all your travel needs.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Check Availability
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">🏨 Book Your Stay</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Luxury Hotel', 'Budget Stay', 'Beach Resort'].map((hotel, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-lg font-bold text-blue-700 mb-2">{hotel}</h4>
              <p className="text-sm text-gray-600">Top-rated comfort and amenities in our {hotel.toLowerCase()}s.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Book Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Button */}
      <section className="text-center py-12">
        <button className="px-8 py-3 text-lg bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition">
          Proceed to Booking & Payment
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-gray-600 py-4">
        © 2025 TourNet · Designed with ❤️ by Team
      </footer>
    </div>
  );
};

export default Dashboard;
