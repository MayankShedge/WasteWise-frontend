import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        {/* The Outlet component will render the current page based on the URL */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;