import React from 'react';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';

const features = [
    {
        title: 'Instant Bookings',
        description: 'Search, compare, and book flights and hotels in seconds.'
    },
    {
        title: 'Secure Payments',
        description: 'Protected by industry-standard encryption with Stripe & PayPal.'
    },
    {
        title: '24/7 Support',
        description: 'Live chat, AI assistants, and real agents – whenever you need.'
    }
];

const Home = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <header
                className="relative h-screen bg-cover bg-center"
                style={{
                    backgroundImage: `url("https://images.unsplash.com/photo-1558979158-65a1eaa08691?auto=format&fit=crop&w=1600&q=80")`
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 z-10" />

                {/* Content */}
                <div className="relative z-20 flex items-center justify-center h-full">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
                            Discover Your Next Journey with <span className="text-blue-400">TourNet</span>
                        </h1>
                        <p className="text-lg font-light mb-6">
                            Book flights, hotels, and tour packages effortlessly.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-semibold transition">
                            Start Exploring
                        </button>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="bg-sky-50 py-20 px-4 md:px-16 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">Why Choose TourNet?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} {...feature} />
                    ))}
                </div>
            </section>

            {/* Popular Plans Section */}
            <section className="bg-white py-20 px-4 md:px-16">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Popular Travel Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-cover bg-center rounded-xl shadow-lg h-64 overflow-hidden relative"
                            style={{
                                backgroundImage: `url(https://source.unsplash.com/400x300/?travel&sig=${i})`
                            }}
                        >
                            <div className="absolute bottom-0 bg-black bg-opacity-40 text-white w-full p-4">
                                <h3 className="text-xl font-bold">Plan #{i}</h3>
                                <p className="text-sm">Explore new destinations with curated experiences.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-blue-50 py-20 px-4 md:px-16">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Get in Touch</h2>
                <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-8">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                            <textarea
                                rows="4"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Tell us what’s on your mind..."
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </section>


            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">TourNet</h3>
                        <p className="text-sm text-gray-400">
                            Your ultimate travel companion – making every journey seamless and unforgettable.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-white">Home</a></li>
                            <li><a href="#" className="hover:text-white">Plans</a></li>
                            <li><a href="#" className="hover:text-white">About</a></li>
                            <li><a href="#" className="hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook-f" /></a>
                            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram" /></a>
                            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter" /></a>
                            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-linkedin-in" /></a>
                        </div>
                    </div>
                </div>
                <div className="text-center text-gray-500 text-sm mt-10">
                    © {new Date().getFullYear()} TourNet. All rights reserved.
                </div>
            </footer>

        </div>
    );
};

export default Home;
