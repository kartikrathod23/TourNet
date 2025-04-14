import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import ChatSupport from './components/ChatSupport';
import AdminSupport from './pages/AdminSupport';
import Destinations from './pages/Destinations';
import Contact from './pages/Contact';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import AgentDashboard from './pages/AgentDashboard';
import TourPackageForm from './pages/TourPackageForm';
import TourPackages from './pages/TourPackages';
import PackageDetail from './pages/PackageDetail';
import { useEffect, useState } from 'react';
import HotelLogin from './pages/HotelLogin';
import HotelRegister from './pages/HotelRegister';
import HotelDashboard from './pages/HotelDashboard';
import axios from 'axios';

// Global API configuration
export const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Agent route component - only accessible by agents
const AgentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token || userType !== 'agent') {
    return <Navigate to="/login" />;
  }
  return children;
};

// Hotel route component - only accessible by hotels
const HotelRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token || userType !== 'hotel') {
    return <Navigate to="/hotel/login" />;
  }
  return children;
};

// Search Results component that handles the search parameters
const SearchResults = () => {
  const [searchParams, setSearchParams] = useState(null);
  
  useEffect(() => {
    // Get search parameters from URL
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const origin = params.get('origin');
    
    if (city) {
      setSearchParams({ city, origin });
    }
  }, []);
  
  // If no valid search parameters, redirect to destinations
  if (!searchParams) {
    return <Navigate to="/destinations" />;
  }
  
  // Render the destinations component with search parameters
  return (
    <Layout>
      <Destinations initialSearch={searchParams} />
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Search route */}
        <Route path="/search" element={<SearchResults />} />
        
        {/* Protected routes wrapped in Layout */}
        <Route path='/dashboard' element={<ProtectedRoute><Layout><DashboardPage/></Layout></ProtectedRoute>} />
        <Route path='/my-bookings' element={<ProtectedRoute><Layout><MyBookings/></Layout></ProtectedRoute>} />
        <Route path='/admin-support' element={<ProtectedRoute><Layout><AdminSupport/></Layout></ProtectedRoute>} />
        <Route path='/destinations' element={<Layout><Destinations/></Layout>} />
        <Route path='/tour-packages' element={<Layout><TourPackages/></Layout>} />
        <Route path='/contact' element={<Layout><Contact/></Layout>} />
        <Route path='/booking-history' element={<ProtectedRoute><Layout><BookingHistory/></Layout></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Layout><Profile/></Layout></ProtectedRoute>} />
        
        {/* Agent routes */}
        <Route path='/agent/dashboard' element={<AgentRoute><Layout><AgentDashboard/></Layout></AgentRoute>} />
        <Route path='/agent/create-package' element={<AgentRoute><Layout><TourPackageForm/></Layout></AgentRoute>} />
        <Route path='/agent/edit-package/:id' element={<AgentRoute><Layout><TourPackageForm/></Layout></AgentRoute>} />
        <Route path='/agent/manage-bookings' element={<AgentRoute><Layout><MyBookings isAgentView={true}/></Layout></AgentRoute>} />
        
        {/* View package route (public) */}
        <Route path='/packages/:id' element={<Layout><PackageDetail/></Layout>} />
        
        {/* Hotel routes */}
        <Route path="/hotel/login" element={<HotelLogin />} />
        <Route path="/hotel/register" element={<HotelRegister />} />
        <Route path="/hotel/dashboard" element={<HotelRoute><HotelDashboard /></HotelRoute>} />
      </Routes>
      
      {/* Chat Support Widget - Available on all pages */}
      <ChatSupport />
    </BrowserRouter>
  );
}

export default App;