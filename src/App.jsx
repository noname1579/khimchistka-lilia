// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
        <Route path="/dashboard" element={token && !isAdmin ? <UserDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={token && isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;