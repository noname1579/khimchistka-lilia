import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Загружаем тестовых пользователей из localStorage для демо
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers.filter(u => u.role !== 'admin'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Проверка для демо-режима (локальное хранилище)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const localUser = storedUsers.find(u => u.login === login && u.password === password);
    
    if (localUser) {
      localStorage.setItem('token', `user-token-${localUser.id}`);
      localStorage.setItem('isAdmin', localUser.role === 'admin' ? 'true' : 'false');
      localStorage.setItem('userId', localUser.id);
      localStorage.setItem('userName', localUser.fio);
      
      if (localUser.role === 'admin') {
        toast.success('Добро пожаловать, Администратор! 👑');
        window.location.href = '/admin';
      } else {
        toast.success(`С возвращением, ${localUser.fio.split(' ')[0]}! 🎉`);
        window.location.href = '/dashboard';
      }
      setLoading(false);
      return;
    }

    // Если не нашли в localStorage, пробуем через API
    const { user, error } = await authAPI.login(login, password);
    
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    if (user) {
      localStorage.setItem('token', user.token || `user-token-${user.id}`);
      localStorage.setItem('isAdmin', user.role === 'admin' ? 'true' : 'false');
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.fio);
      
      if (user.role === 'admin') {
        toast.success('Добро пожаловать, Администратор! 👑');
        window.location.href = '/admin';
      } else {
        toast.success(`С возвращением, ${user.fio.split(' ')[0]}! 🎉`);
        window.location.href = '/dashboard';
      }
    }
    setLoading(false);
  };

  const quickLogin = (userLogin, userPassword) => {
    setLogin(userLogin);
    setPassword(userPassword);
    setShowUsers(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-4 inline-block"
            >
              🧼
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">С возвращением!</h2>
            <p className="text-white/60">Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all"
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-white/60">Нет аккаунта? </span>
            <Link to="/register" className="text-purple-400 font-semibold hover:text-purple-300">
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="w-full text-center text-white/50 text-sm hover:text-white/70"
            >
              {showUsers ? '▼ Скрыть демо-аккаунты' : '▶ Демо-аккаунты для входа'}
            </button>
            
            <AnimatePresence>
              {showUsers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2"
                >
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 text-xs mb-2">👑 Администратор:</p>
                    <button
                      onClick={() => quickLogin('adminka', 'password')}
                      className="w-full flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <span className="text-white text-sm">adminka</span>
                      <span className="text-green-400 text-xs">Нажмите для входа →</span>
                    </button>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 text-xs mb-2">👥 Тестовые пользователи (пароль: 123456):</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => quickLogin('ivan', '123456')}
                        className="w-full flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <span className="text-white text-sm">ivan (Иван)</span>
                        <span className="text-purple-400 text-xs">Войти →</span>
                      </button>
                      <button
                        onClick={() => quickLogin('anna', '123456')}
                        className="w-full flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <span className="text-white text-sm">anna (Анна)</span>
                        <span className="text-purple-400 text-xs">Войти →</span>
                      </button>
                      <button
                        onClick={() => quickLogin('mikhail', '123456')}
                        className="w-full flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <span className="text-white text-sm">mikhail (Михаил)</span>
                        <span className="text-purple-400 text-xs">Войти →</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;