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
import { useEffect, useState } from 'react';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes wrapped in Layout */}
        <Route path='/dashboard' element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
        <Route path='/my-bookings' element={<ProtectedRoute><MyBookings/></ProtectedRoute>} />
        <Route path='/admin-support' element={<ProtectedRoute><AdminSupport/></ProtectedRoute>} />
        <Route path='/destinations' element={<Layout><Destinations/></Layout>} />
        <Route path='/contact' element={<Layout><Contact/></Layout>} />
        <Route path='/booking-history' element={<ProtectedRoute><BookingHistory/></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>} />
      </Routes>
      
      {/* Chat Support Widget - Available on all pages */}
      <ChatSupport />
    </BrowserRouter>
  );
}

export default App;