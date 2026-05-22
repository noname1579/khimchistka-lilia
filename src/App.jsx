// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import { initializeData } from './utils/initData';
import { eventBus, EVENTS } from './utils/eventBus';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initializeData();
    
    // Глобальная обработка обновления данных
    const handleDataUpdate = () => {
      console.log('App: Данные обновлены, перерендер');
      setRefreshKey(prev => prev + 1);
    };
    
    eventBus.on(EVENTS.DATA_UPDATED, handleDataUpdate);
    
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      eventBus.off(EVENTS.DATA_UPDATED, handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div key={refreshKey} className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
          <Route path="/dashboard" element={token && !isAdmin ? <UserDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={token && isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;