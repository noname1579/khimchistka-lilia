import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import { initDB } from './services/dbAPI';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Инициализируем базу данных при запуске
    initDB().then(() => {
      console.log('✅ IndexedDB инициализирована');
      setDbReady(true);
    }).catch(err => {
      console.error('❌ Ошибка инициализации IndexedDB:', err);
      setDbReady(true);
    });

    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-spin">🔄</div>
          <p>Загрузка базы данных...</p>
        </div>
      </div>
    );
  }

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