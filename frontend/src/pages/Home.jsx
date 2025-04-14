import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import ChatSupport from '../components/ChatSupport';
import axios from 'axios';

const features = [
    {
        title: 'Instant Bookings',
        description: 'Search, compare, and book flights and hotels in seconds.',
        icon: '✈️'
    },
    {
        title: 'Secure Payments',
        description: 'Protected by industry-standard encryption with Stripe & PayPal.',
        icon: '🔒'
    },
    {
        title: '24/7 Support',
        description: 'Live chat, AI assistants, and real agents – whenever you need.',
        icon: '💬'
    },
    {
        title: 'Exclusive Deals',
        description: 'Access to member-only discounts and limited-time offers.',
        icon: '🎁'
    }
];

const testimonials = [
    {
        name: 'Sarah Johnson',
        location: 'New York, USA',
        text: 'TourNet made planning our family vacation to Europe completely stress-free. The AI suggestions were spot-on!',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 5
    },
    {
        name: 'David Chen',
        location: 'Toronto, Canada',
        text: 'I was able to find and book the perfect beachfront hotel within minutes. Great prices and excellent service.',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4
    },
    {
        name: 'Maria Rodriguez',
        location: 'Madrid, Spain',
        text: 'The chat support saved our trip when we needed to make last-minute changes. Highly recommend!',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 5
    }
];

const Home = () => {
    const [popularDestinations, setPopularDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [originCity, setOriginCity] = useState('');

    useEffect(() => {
        // Simulate fetching popular destinations
        const fetchDestinations = async () => {
            try {
                setLoading(true);
                // In a real app, this would be an API call
                const mockDestinations = [
                    {
                        id: 1,
                        name: 'Paris',
                        country: 'France',
                        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format',
                        rating: 4.8,
                        price: '€499'
                    },
                    {
                        id: 2,
                        name: 'Bali',
                        country: 'Indonesia',
                        image: 'https://images.unsplash.com/photo-1538681105587-85640961bf8b?w=600&auto=format',
                        rating: 4.9,
                        price: '$599'
                    },
                    {
                        id: 3,
                        name: 'Tokyo',
                        country: 'Japan',
                        image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&auto=format',
                        rating: 4.7,
                        price: '$799'
                    },
                    {
                        id: 4,
                        name: 'Santorini',
                        country: 'Greece',
                        image: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?w=600&auto=format',
                        rating: 4.9,
                        price: '€649'
                    }
                ];

                // Simulate API delay
                setTimeout(() => {
                    setPopularDestinations(mockDestinations);
                    setLoading(false);
                }, 1000);

            } catch (error) {
                console.error('Error fetching destinations:', error);
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // In a real app, this would trigger a search API call with both origin and destination
        console.log('Searching for:', searchQuery, 'from', originCity);
        
        // Redirect to the search results or destination page with both parameters
        if (searchQuery) {
            const params = new URLSearchParams();
            params.append('city', searchQuery);
            if (originCity) {
                params.append('origin', originCity);
            }
            
            // Navigate to the search results
            window.location.href = `/search?${params.toString()}`;
        }
    };

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
                    <div className="text-center text-white px-4 max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg">
                            Discover Your Next Journey with <span className="text-blue-400">TourNet</span>
                        </h1>
                        <p className="text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto">
                            Book flights, hotels, and tour packages effortlessly with our AI-powered travel assistant.
                        </p>

                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative mb-8">
                            <div className="flex flex-col md:flex-row gap-2 mb-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="From (Origin City)"
                                        className="w-full px-6 py-4 rounded-full text-gray-800 bg-white/95 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={originCity}
                                        onChange={(e) => setOriginCity(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="To (Destination)"
                                        className="w-full px-6 py-4 rounded-full text-gray-800 bg-white/95 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>

                        <Link to="/signup">
                            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full text-white font-semibold transition transform hover:scale-105 shadow-lg">
                                Start Your Adventure
                        </button>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose TourNet</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} title={feature.title} description={feature.description} icon={feature.icon} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">Popular Destinations</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                        Explore our most-booked destinations and find your next perfect getaway
                    </p>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {popularDestinations.map((destination) => (
                                <div 
                                    key={destination.id} 
                                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img 
                                            src={destination.image} 
                                            alt={destination.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold">{destination.name}</h3>
                                                <p className="text-gray-600">{destination.country}</p>
                                            </div>
                                            <div className="flex items-center bg-blue-100 px-2 py-1 rounded text-sm text-blue-800">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                {destination.rating}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-lg font-bold text-blue-600">From {destination.price}</span>
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Explore
                                            </button>
                                        </div>
                            </div>
                        </div>
                    ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 bg-gray-100">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">What Our Travelers Say</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                        Thousands of travelers have had amazing experiences with TourNet. Here's what some of them have to say.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img 
                                        src={testimonial.avatar} 
                                        alt={testimonial.name} 
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                        <div>
                                        <h3 className="font-semibold">{testimonial.name}</h3>
                                        <p className="text-gray-600 text-sm">{testimonial.location}</p>
                        </div>
                        </div>
                                <div className="flex mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg 
                                            key={i}
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Next Adventure?</h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of happy travelers and discover the world with TourNet.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup">
                            <button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105 transition">
                                Sign Up Now
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="bg-transparent hover:bg-blue-700 border-2 border-white px-8 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105 transition">
                                Login
                        </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">TourNet</h3>
                        <p className="text-gray-400 mb-4">
                            Making travel planning easy, affordable, and enjoyable with AI-powered recommendations.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Home</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Destinations</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Packages</a></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Travel Blog</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Travel Guides</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">FAQs</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Travel Tips</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">COVID-19 Updates</a></li>
                        </ul>
                        </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Subscribe</h3>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest travel deals.</p>
                        <form className="flex">
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="px-4 py-2 w-full rounded-l-lg focus:outline-none text-gray-800"
                            />
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-gray-400 text-sm flex flex-col md:flex-row justify-between">
                    <p>© 2025 TourNet. All rights reserved.</p>
                    <div className="space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">Cookie Policy</a>
                    </div>
                </div>
            </footer>

            {/* Chat Support Component */}
            <ChatSupport />
        </div>
    );
};

export default Home;
