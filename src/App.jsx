import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Client from './pages/Client';
import Admin from './pages/Admin';
import { ShieldAlert } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      {/* Simple Navigation Bar */}
      <nav className="bg-white shadow-sm absolute top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900">
                Client (Nhận TB)
              </Link>
              <Link to="/admin" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <ShieldAlert className="w-4 h-4 mr-1 text-gray-400" />
                Admin Lên Lịch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 min-h-screen">
        <Routes>
          <Route path="/" element={<Client />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
