import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function Register() {
  const [formData, setFormData] = useState({
    fio: '',
    phone: '',
    email: '',
    login: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.login === formData.login)) {
      toast.error('Пользователь с таким логином уже существует');
      setLoading(false);
      return;
    }

    const newUser = {
      id: Date.now(),
      ...formData
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    toast.success('Регистрация успешна! Теперь войдите в систему.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 animate-pulse">📝</div>
            <h2 className="text-3xl font-bold text-white">Регистрация</h2>
            <p className="text-white/70 mt-2">Создайте новый аккаунт</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input type="text" name="fio" placeholder="ФИО" value={formData.fio} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all" required />
            </div>
            <div className="mb-3">
              <input type="tel" name="phone" placeholder="Телефон" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all" required />
            </div>
            <div className="mb-3">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all" required />
            </div>
            <div className="mb-3">
              <input type="text" name="login" placeholder="Логин" value={formData.login} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all" required />
            </div>
            <div className="mb-4">
              <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-white to-gray-100 text-purple-600 py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50">
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <span className="text-white/70">Уже есть аккаунт? </span>
            <Link to="/login" className="text-white font-semibold hover:underline">Войти</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;