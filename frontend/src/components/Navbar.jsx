import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Check if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        // Check authentication status whenever location changes
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [location]);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    
    const isActive = (path) => {
        return location.pathname === path ? "text-blue-600" : "hover:text-blue-500";
    };
    
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link to={"/"}>
                    <h1 className="text-2xl font-extrabold text-blue-600">TourNet</h1>
                </Link>
                
                {/* Desktop Navigation */}
                <ul className="hidden md:flex space-x-6 text-gray-800 font-medium">
                    <li>
                        <Link to="/" className={isActive("/")}>Home</Link>
                    </li>
                    <li>
                        <Link to="/destinations" className={isActive("/destinations")}>Destinations</Link>
                    </li>
                    {isLoggedIn && (
                        <>
                            <li>
                                <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/booking-history" className={isActive("/booking-history")}>My Bookings</Link>
                            </li>
                        </>
                    )}
                    <li>
                        <Link to="/contact" className={isActive("/contact")}>Contact</Link>
                    </li>
                </ul>
                
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="p-2 text-gray-700 hover:text-blue-600"
                    >
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        )}
                    </button>
                </div>
                
                {/* Auth Buttons */}
                <div className='hidden md:flex gap-5'>
                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-200 transition">
                                    <span className="text-blue-600 text-lg">👤</span>
                                </div>
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm hover:bg-red-200 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-semibold shadow-sm">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-sm">
                                    Sign Up
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-2">
                    <ul className="flex flex-col text-gray-800">
                        <li>
                            <Link 
                                to="/" 
                                className={`block px-6 py-3 ${isActive("/")}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/destinations" 
                                className={`block px-6 py-3 ${isActive("/destinations")}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Destinations
                            </Link>
                        </li>
                        {isLoggedIn && (
                            <>
                                <li>
                                    <Link 
                                        to="/dashboard" 
                                        className={`block px-6 py-3 ${isActive("/dashboard")}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/booking-history" 
                                        className={`block px-6 py-3 ${isActive("/booking-history")}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Bookings
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/profile" 
                                        className={`block px-6 py-3 ${isActive("/profile")}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}
                        <li>
                            <Link 
                                to="/contact" 
                                className={`block px-6 py-3 ${isActive("/contact")}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </li>
                        
                        {/* Mobile Auth Buttons */}
                        {isLoggedIn ? (
                            <li className="px-6 py-3 border-t border-gray-100 mt-2">
                                <button 
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm hover:bg-red-200 transition text-center"
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="px-6 py-3 border-t border-gray-100 mt-2">
                                    <Link 
                                        to="/login" 
                                        className="block w-full bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-md text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="px-6 py-3">
                                    <Link 
                                        to="/signup" 
                                        className="block w-full bg-blue-600 text-white px-3 py-2 rounded-md text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;