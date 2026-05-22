import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { eventBus, EVENTS, forceRefreshAll } from '../utils/eventBus';

function Register() {
  const [formData, setFormData] = useState({
    fio: '',
    phone: '',
    email: '',
    login: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validateFio = (fio) => {
    const fioRegex = /^[а-яА-Яa-zA-Z\s-]{2,}$/;
    const words = fio.trim().split(/\s+/);
    return fioRegex.test(fio) && words.length >= 2 && words.length <= 4;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    const digits = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 11;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
  };

  const validateLogin = (login) => {
    const loginRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return loginRegex.test(login);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    return password === confirmPassword && confirmPassword !== '';
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7`;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'phone') {
      newValue = formatPhone(value);
    }
    
    setFormData({ ...formData, [name]: newValue });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!validateFio(formData.fio)) errors.fio = 'Введите полное ФИО (минимум 2 слова)';
    if (!validatePhone(formData.phone)) errors.phone = 'Введите корректный номер телефона';
    if (!validateEmail(formData.email)) errors.email = 'Введите корректный email';
    if (!validateLogin(formData.login)) errors.login = 'Логин: 3-20 символов (буквы, цифры, _)';
    if (!validatePassword(formData.password)) errors.password = 'Пароль: минимум 6 символов (буквы + цифры)';
    if (!validateConfirmPassword(formData.password, formData.confirmPassword)) errors.confirmPassword = 'Пароли не совпадают';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setLoading(true);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.login === formData.login)) {
      toast.error('Пользователь с таким логином уже существует');
      setLoading(false);
      return;
    }
    
    if (users.find(u => u.email === formData.email)) {
      toast.error('Пользователь с таким email уже существует');
      setLoading(false);
      return;
    }

    const newUser = {
      id: Date.now(),
      fio: formData.fio.trim(),
      phone: formData.phone,
      email: formData.email.toLowerCase(),
      login: formData.login.toLowerCase(),
      password: formData.password,
      role: 'user',
      avatar: '👤',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ Новый пользователь зарегистрирован:', newUser);
    console.log('📋 Все пользователи:', JSON.parse(localStorage.getItem('users')));
    
    // ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ВСЕХ КОМПОНЕНТОВ
    forceRefreshAll();
    
    toast.success('Регистрация успешна! Теперь войдите в систему.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-8 border border-white/20">
          <div className="text-center mb-4 sm:mb-8">
            <div className="text-4xl sm:text-5xl mb-3 animate-pulse">📝</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Регистрация</h2>
            <p className="text-white/70 text-sm sm:text-base mt-1 sm:mt-2">Создайте новый аккаунт</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <input
                type="text"
                name="fio"
                placeholder={isMobile ? "Иванов Иван" : "Иванов Иван Иванович"}
                value={formData.fio}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border ${
                  formErrors.fio ? 'border-red-500' : 'border-white/20'
                } rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all`}
                required
              />
              {formErrors.fio && <p className="text-red-400 text-xs mt-1">{formErrors.fio}</p>}
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border ${
                  formErrors.phone ? 'border-red-500' : 'border-white/20'
                } rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all`}
                required
              />
              {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="ivan@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border ${
                  formErrors.email ? 'border-red-500' : 'border-white/20'
                } rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all`}
                required
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                name="login"
                placeholder="ivan_2024"
                value={formData.login}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border ${
                  formErrors.login ? 'border-red-500' : 'border-white/20'
                } rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all`}
                required
              />
              {formErrors.login && <p className="text-red-400 text-xs mt-1">{formErrors.login}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border ${
                    formErrors.password ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all pr-10 sm:pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all text-sm sm:text-base"
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
              {formErrors.password && <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Подтвердите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-white/50 focus:border-white focus:outline-none transition-all pr-10 sm:pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all text-sm sm:text-base"
                >
                  {showConfirmPassword ? '👁️' : '🔒'}
                </button>
              </div>
              {formErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{formErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-white to-gray-100 text-purple-600 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div className="text-center mt-4 sm:mt-6">
            <span className="text-white/70 text-sm sm:text-base">Уже есть аккаунт? </span>
            <Link to="/login" className="text-white font-semibold hover:underline text-sm sm:text-base">
              Войти
            </Link>
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <p className="text-white/30 text-[10px] sm:text-xs text-center">
              Регистрируясь, вы соглашаетесь с условиями обработки персональных данных
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;