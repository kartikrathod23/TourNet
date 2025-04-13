import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16"> {/* Add padding-top to account for fixed navbar */}
        {children}
      </main>
    </div>
  );
};

export default Layout; 