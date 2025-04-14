import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Check if user is logged in and get user type
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userType, setUserType] = useState('user');
    
    useEffect(() => {
        // Check authentication status whenever location changes
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('userType');
        
        setIsLoggedIn(!!token);
        setUserType(storedUserType || 'user');
    }, [location]);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        navigate('/login');
    };
    
    const isActive = (path) => {
        return location.pathname === path ? "text-blue-600" : "hover:text-blue-500";
    };
    
    // Determine dashboard link based on user type
    const dashboardLink = userType === 'agent' ? '/agent/dashboard' : '/dashboard';
    
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
                    <li>
                        <Link to="/tour-packages" className={isActive("/tour-packages")}>Tour Packages</Link>
                    </li>
                    {isLoggedIn && (
                        <>
                            <li>
                                <Link to={dashboardLink} className={isActive(dashboardLink)}>
                                    {userType === 'agent' ? 'Agent Dashboard' : 'Dashboard'}
                                </Link>
                            </li>
                            {userType === 'agent' ? (
                                <li>
                                    <Link to="/agent/manage-bookings" className={isActive("/agent/manage-bookings")}>Manage Bookings</Link>
                                </li>
                            ) : (
                                <li>
                                    <Link to="/booking-history" className={isActive("/booking-history")}>My Bookings</Link>
                                </li>
                            )}
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
                <div className='hidden md:flex gap-4'>
                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile">
                                <div className={`w-10 h-10 rounded-full ${userType === 'agent' ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center shadow-sm cursor-pointer ${userType === 'agent' ? 'hover:bg-green-200' : 'hover:bg-blue-200'} transition`}>
                                    <span className={`${userType === 'agent' ? 'text-green-600' : 'text-blue-600'} text-lg`}>
                                        {userType === 'agent' ? '🧑‍💼' : '👤'}
                                    </span>
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
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
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
                            </div>
                            
                            <div className="h-8 border-l border-gray-300 mx-1"></div>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">Partners</span>
                                <div className="group relative">
                                    <button className="border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-md font-semibold shadow-sm text-sm flex items-center">
                                        Partner Portal <FaChevronDown className="ml-1 text-xs" />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                        <div className="py-2 px-4 bg-green-600 text-white text-sm font-semibold">
                                            Travel Agent Portal
                                        </div>
                                        <Link to="/login?agent=true" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                            Agent Login
                                        </Link>
                                        <Link to="/signup" onClick={() => localStorage.setItem('intent', 'agent')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                            Register Agency
                                        </Link>
                                        <div className="py-2 px-4 bg-blue-600 text-white text-sm font-semibold">
                                            Hotel Portal
                                        </div>
                                        <Link to="/hotel/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                            Hotel Login
                                        </Link>
                                        <Link to="/hotel/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                            Register Hotel
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        <li>
                            <Link 
                                to="/tour-packages" 
                                className={`block px-6 py-3 ${isActive("/tour-packages")}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Tour Packages
                            </Link>
                        </li>
                        {isLoggedIn && (
                            <>
                                <li>
                                    <Link 
                                        to={dashboardLink}
                                        className={`block px-6 py-3 ${isActive(dashboardLink)}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {userType === 'agent' ? 'Agent Dashboard' : 'Dashboard'}
                                    </Link>
                                </li>
                                {userType === 'agent' ? (
                                    <li>
                                        <Link 
                                            to="/agent/manage-bookings" 
                                            className={`block px-6 py-3 ${isActive("/agent/manage-bookings")}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Manage Bookings
                                        </Link>
                                    </li>
                                ) : (
                                    <li>
                                        <Link 
                                            to="/booking-history" 
                                            className={`block px-6 py-3 ${isActive("/booking-history")}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                    </li>
                                )}
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
                                    <div className="text-center text-sm text-gray-500 font-semibold mb-2">Customer Account</div>
                                    <div className="flex gap-2">
                                        <Link 
                                            to="/login" 
                                            className="block w-full bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-md text-center"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link 
                                            to="/signup" 
                                            className="block w-full bg-blue-600 text-white px-3 py-2 rounded-md text-center"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </li>
                                <li className="px-6 py-4 bg-gray-50">
                                    <div className="text-center text-sm text-gray-500 font-semibold mb-2">Partner Portal</div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-center text-xs text-gray-500 font-semibold mb-1">Travel Agents</div>
                                        <div className="flex gap-2">
                                            <Link 
                                                to="/login?agent=true" 
                                                className="block w-full bg-white border border-green-600 text-green-600 px-3 py-2 rounded-md text-center"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Agent Login
                                            </Link>
                                            <Link 
                                                to="/signup" 
                                                className="block w-full bg-green-600 text-white px-3 py-2 rounded-md text-center"
                                                onClick={() => {
                                                    localStorage.setItem('intent', 'agent');
                                                    setIsMenuOpen(false);
                                                }}
                                            >
                                                Register Agency
                                            </Link>
                                        </div>
                                        
                                        <div className="text-center text-xs text-gray-500 font-semibold mb-1 mt-3">Hotels</div>
                                        <div className="flex gap-2">
                                            <Link 
                                                to="/hotel/login" 
                                                className="block w-full bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-md text-center"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Hotel Login
                                            </Link>
                                            <Link 
                                                to="/hotel/register" 
                                                className="block w-full bg-blue-600 text-white px-3 py-2 rounded-md text-center"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Register Hotel
                                            </Link>
                                        </div>
                                    </div>
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