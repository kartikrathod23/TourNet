import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link to={"/"}>
                    <h1 className="text-2xl font-extrabold text-blue-600">TourNet</h1>
                </Link>
                <ul className="hidden md:flex space-x-6 text-gray-800 font-medium">
                    <li className="hover:text-blue-500 cursor-pointer">Home</li>
                    <li className="hover:text-blue-500 cursor-pointer">Destinations</li>
                    <li className="hover:text-blue-500 cursor-pointer">Bookings</li>
                    <li className="hover:text-blue-500 cursor-pointer">Support</li>
                </ul>
                <div className='flex gap-5'>
                    <Link to="/login">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow">
                            Login
                        </button>
                    </Link>
                    <Link to="/signup">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow">
                            Sign Up
                        </button>
                    </Link>
                </div>
            </div>
        </nav>

    );
};

export default Navbar;