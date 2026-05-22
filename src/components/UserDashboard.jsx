import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { eventBus, EVENTS, forceRefreshAll } from '../utils/eventBus';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('new');
  const [userRequests, setUserRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    contactPhone: '',
    deliveryDate: '',
    deliveryTime: '',
    serviceId: '',
    masterId: '',
    comments: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Валидация телефона
  const validatePhone = (phone) => {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Валидация адреса
  const validateAddress = (address) => {
    return address.trim().length >= 5 && address.trim().length <= 200;
  };

  // Валидация комментария
  const validateComments = (comments) => {
    if (!comments) return true;
    return comments.length <= 500;
  };

  // Получение минимальной даты (сегодня)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Получение максимальной даты (через 3 месяца)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Валидация даты (нельзя выбрать прошедшую дату)
  const validateDate = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // Валидация времени (только рабочее время 9:00 - 21:00)
  const validateTime = (time) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 9 && hours <= 21;
  };

  // Валидация выбора услуги
  const validateService = (serviceId) => {
    return serviceId && serviceId !== '';
  };

  // Валидация всей формы
  const validateForm = () => {
    const errors = {};
    
    if (!validateAddress(formData.address)) {
      errors.address = 'Адрес должен содержать минимум 5 символов';
    }
    
    if (!validatePhone(formData.contactPhone)) {
      errors.contactPhone = 'Введите корректный номер телефона (10-11 цифр)';
    }
    
    if (!validateDate(formData.deliveryDate)) {
      errors.deliveryDate = 'Нельзя выбрать прошедшую дату';
    }
    
    if (!validateTime(formData.deliveryTime)) {
      errors.deliveryTime = 'Выберите время с 9:00 до 21:00';
    }
    
    if (!validateService(formData.serviceId)) {
      errors.serviceId = 'Выберите услугу';
    }
    
    if (!validateComments(formData.comments)) {
      errors.comments = 'Комментарий не должен превышать 500 символов';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Функция загрузки всех данных пользователя
  const loadData = useCallback(() => {
    console.log('UserDashboard: Загрузка данных...');
    
    const allServices = JSON.parse(localStorage.getItem('services') || '[]');
    if (allServices.length === 0) {
      const defaultServices = [
        { id: 1, name: 'Химчистка одежды', price: 1500, duration: '2-3 дня', popular: true, icon: '👕' },
        { id: 2, name: 'Стирка белья', price: 800, duration: '1-2 дня', popular: false, icon: '👔' },
        { id: 3, name: 'Чистка обуви', price: 1000, duration: '1 день', popular: true, icon: '👞' },
        { id: 4, name: 'Химчистка мебели', price: 3500, duration: '3-5 дней', popular: false, icon: '🛋️' },
        { id: 5, name: 'Чистка салона авто', price: 5000, duration: '2-4 дня', popular: true, icon: '🚗' },
      ];
      localStorage.setItem('services', JSON.stringify(defaultServices));
      setServices(defaultServices);
    } else {
      setServices([...allServices]);
    }

    const allMasters = JSON.parse(localStorage.getItem('masters') || '[]');
    if (allMasters.length === 0) {
      const defaultMasters = [
        { id: 1, name: 'Иванов Иван', specialty: 'Химчистка одежды', experience: 5, rating: 4.8, reviews: 124 },
        { id: 2, name: 'Петрова Анна', specialty: 'Чистка обуви', experience: 3, rating: 4.9, reviews: 89 },
        { id: 3, name: 'Сидоров Михаил', specialty: 'Мебель и авто', experience: 8, rating: 5.0, reviews: 256 },
      ];
      localStorage.setItem('masters', JSON.stringify(defaultMasters));
      setMasters(defaultMasters);
    } else {
      setMasters([...allMasters]);
    }

    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const userReqs = allRequests
      .filter(r => r.clientId == userId)
      .sort((a, b) => b.id - a.id);
    setUserRequests([...userReqs]);
    console.log('UserDashboard: Загружено заявок:', userReqs.length);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id == userId);
    setUserData(user);
  }, [userId]);

  // Загрузка уведомлений
  const loadNotifications = useCallback(() => {
    const allNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(allNotifs.filter(n => n.userId == userId).sort((a, b) => b.id - a.id));
  }, [userId]);

  // Принудительная загрузка
  const forceLoadUserData = useCallback(() => {
    console.log('UserDashboard: Принудительная загрузка данных...');
    loadData();
    loadNotifications();
  }, [loadData, loadNotifications]);

  // Подписка на события
  useEffect(() => {
    forceLoadUserData();

    const handleForceRefresh = () => {
      console.log('UserDashboard: Получен сигнал принудительного обновления');
      forceLoadUserData();
      toast.success('Данные обновлены', { icon: '🔄' });
    };
    
    const handleStorageChange = (e) => {
      console.log('UserDashboard: Storage событие', e.key);
      forceLoadUserData();
    };
    
    const handleDataUpdate = (data) => {
      console.log('UserDashboard: Получено событие обновления', data);
      forceLoadUserData();
    };

    const interval = setInterval(() => {
      const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      const currentUserReqs = allRequests.filter(r => r.clientId == userId).length;
      if (currentUserReqs !== userRequests.length) {
        console.log('UserDashboard: Обнаружено изменение количества заявок');
        forceLoadUserData();
      }
    }, 3000);
    
    window.addEventListener('storage', handleStorageChange);
    eventBus.on(EVENTS.FORCE_REFRESH, handleForceRefresh);
    eventBus.on(EVENTS.DATA_UPDATED, handleDataUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      eventBus.off(EVENTS.FORCE_REFRESH, handleForceRefresh);
      eventBus.off(EVENTS.DATA_UPDATED, handleDataUpdate);
      clearInterval(interval);
    };
  }, [forceLoadUserData, userId, userRequests.length]);

  // Добавление уведомления
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      userId: parseInt(userId),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifs.unshift(newNotif);
    localStorage.setItem('notifications', JSON.stringify(notifs));
    loadNotifications();
    toast.success(message);
  };

  const markAsRead = (notifId) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    loadNotifications();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Создание новой заявки
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const service = services.find(s => s.id == formData.serviceId);
    const master = masters.find(m => m.id == formData.masterId);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id == userId);

    const newRequest = {
      id: Date.now(),
      clientId: parseInt(userId),
      clientName: user?.fio || 'Клиент',
      clientPhone: formData.contactPhone || user?.phone,
      clientEmail: user?.email,
      clientAddress: formData.address,
      serviceId: parseInt(formData.serviceId),
      serviceName: service?.name,
      servicePrice: service?.price,
      masterId: formData.masterId ? parseInt(formData.masterId) : null,
      masterName: master?.name,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      comments: formData.comments,
      requestDate: new Date().toISOString(),
      total: service?.price || 0,
      status: 'pending',
      statusText: 'На рассмотрении'
    };

    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    allRequests.unshift(newRequest);
    localStorage.setItem('requests', JSON.stringify(allRequests));
    
    console.log('✅ Новая заявка создана:', newRequest);
    
    forceRefreshAll();
    forceLoadUserData();
    
    addNotification('📝 Заявка создана', `Ваша заявка на услугу "${service?.name}" успешно создана и отправлена на рассмотрение`, 'success');
    
    setFormData({ 
      address: '', 
      contactPhone: '', 
      deliveryDate: '', 
      deliveryTime: '', 
      serviceId: '', 
      masterId: '', 
      comments: '' 
    });
    setFormErrors({});
    setActiveTab('history');
    setLoading(false);
    toast.success('Заявка успешно создана!');
  };

  // Отмена заявки
  const cancelRequest = async (requestId) => {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const requestToCancel = allRequests.find(r => r.id === requestId);
    
    const updatedAll = allRequests.map(req => {
      if (req.id === requestId && req.status === 'pending') {
        return { ...req, status: 'cancelled', statusText: 'Отменена пользователем' };
      }
      return req;
    });
    
    localStorage.setItem('requests', JSON.stringify(updatedAll));
    forceRefreshAll();
    forceLoadUserData();
    addNotification('❌ Заявка отменена', `Ваша заявка на услугу "${requestToCancel?.serviceName}" была успешно отменена`, 'warning');
    toast.success('Заявка отменена');
  };

  // Повтор заявки
  const repeatRequest = (request) => {
    setFormData({
      address: request.clientAddress,
      contactPhone: request.clientPhone,
      deliveryDate: '',
      deliveryTime: '',
      serviceId: request.serviceId.toString(),
      masterId: request.masterId?.toString() || '',
      comments: ''
    });
    setFormErrors({});
    setActiveTab('new');
    toast.success('Данные заявки скопированы. Выберите новую дату и отправьте.');
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'На рассмотрении', border: 'border-yellow-300' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅', label: 'Подтверждена', border: 'border-blue-300' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🔄', label: 'В работе', border: 'border-purple-300' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '🎉', label: 'Выполнена', border: 'border-green-300' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Отменена', border: 'border-red-300' }
    };
    const s = statuses[status] || statuses.pending;
    return (
      <span className={`${s.bg} ${s.text} px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 border ${s.border}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Вы вышли из системы');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-2xl sm:text-3xl animate-float">🧼</div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold truncate">Химчистка «Лилия»</h1>
              <p className="text-[10px] sm:text-xs text-white/70 truncate">Добро пожаловать, {userData?.fio?.split(' ')[0] || 'Гость'}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                🔔
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-[10px] sm:text-xs flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm">
                      Уведомления
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">Нет уведомлений</div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`p-2 sm:p-3 border-b hover:bg-gray-50 cursor-pointer transition-all ${!n.read ? 'bg-purple-50' : ''}`}
                          >
                            <p className="font-semibold text-xs sm:text-sm text-gray-800">{n.title}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 sm:mt-1">{format(new Date(n.date), 'dd.MM.yyyy HH:mm', { locale: ru })}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base">
              🚪 {!isMobile && 'Выйти'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
        <div className="flex gap-1 sm:gap-2 bg-white rounded-xl p-1 shadow-md">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              activeTab === 'new' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📝 <span className={isMobile ? 'text-xs' : 'text-sm'}>Новая</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              activeTab === 'history' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 <span className={isMobile ? 'text-xs' : 'text-sm'}>Заявки ({userRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              activeTab === 'profile' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👤 <span className={isMobile ? 'text-xs' : 'text-sm'}>Профиль</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <span>📝</span> Новая заявка
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    📍 Адрес <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all`}
                    required
                  />
                  {formErrors.address && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    📞 Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    placeholder="+7 (999) 123-45-67"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border ${
                      formErrors.contactPhone ? 'border-red-500' : 'border-gray-300'
                    } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all`}
                    required
                  />
                  {formErrors.contactPhone && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.contactPhone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      📅 Дата <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border ${
                        formErrors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                      } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all`}
                      required
                    />
                    {formErrors.deliveryDate && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.deliveryDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      ⏰ Время <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      min="09:00"
                      max="21:00"
                      className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border ${
                        formErrors.deliveryTime ? 'border-red-500' : 'border-gray-300'
                      } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all`}
                      required
                    />
                    {formErrors.deliveryTime && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.deliveryTime}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    🛎️ Услуга <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border ${
                      formErrors.serviceId ? 'border-red-500' : 'border-gray-300'
                    } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all`}
                    required
                  >
                    <option value="">Выберите услугу</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name} — {s.price} ₽ {s.popular && '⭐'}
                      </option>
                    ))}
                  </select>
                  {formErrors.serviceId && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.serviceId}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    👨‍🔧 Мастер (по желанию)
                  </label>
                  <select
                    name="masterId"
                    value={formData.masterId}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  >
                    <option value="">Любой мастер</option>
                    {masters.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.specialty}) ⭐ {m.rating}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    💬 Комментарий
                  </label>
                  <textarea
                    name="comments"
                    placeholder="Дополнительные пожелания..."
                    value={formData.comments}
                    onChange={handleChange}
                    rows={isMobile ? 2 : 3}
                    maxLength="500"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl border ${
                      formErrors.comments ? 'border-red-500' : 'border-gray-300'
                    } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none`}
                  />
                  {formErrors.comments && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.comments}</p>}
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-1 text-right">{formData.comments.length}/500</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'Отправка...' : '📨 Отправить заявку'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <span>📋</span> Мои заявки ({userRequests.length})
              </h2>
              {userRequests.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-5xl sm:text-6xl mb-3">📭</div>
                  <p className="text-gray-400 text-sm sm:text-base">У вас пока нет заявок</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-semibold text-sm sm:text-base"
                  >
                    Создать первую заявку →
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {userRequests.map(req => (
                    <div key={req.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 sm:mb-3 gap-2">
                        <div>
                          <p className="font-bold text-gray-800 text-base sm:text-lg">{req.serviceName}</p>
                          <p className="text-xs text-gray-500">{format(new Date(req.requestDate), 'dd.MM.yyyy HH:mm')}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="space-y-1 sm:space-y-2 text-gray-600 text-xs sm:text-sm">
                        <p><span className="font-medium">📍 Адрес:</span> {req.clientAddress}</p>
                        <p><span className="font-medium">📅 Дата:</span> {req.deliveryDate} в {req.deliveryTime}</p>
                        {!isMobile && <p><span className="font-medium">👨‍🔧 Мастер:</span> {req.masterName || 'Не назначен'}</p>}
                        {req.comments && <p><span className="font-medium">💬 Комментарий:</span> {req.comments}</p>}
                        <p className="text-base sm:text-lg font-bold text-purple-600">💰 {req.total} ₽</p>
                      </div>
                      <div className="flex gap-3 mt-3 pt-2 sm:pt-3 border-t">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => cancelRequest(req.id)}
                            className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium transition-all"
                          >
                            ❌ Отменить
                          </button>
                        )}
                        {req.status === 'completed' && (
                          <button
                            onClick={() => repeatRequest(req)}
                            className="text-green-500 hover:text-green-700 text-xs sm:text-sm font-medium transition-all"
                          >
                            🔄 Повторить
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && userData && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <span>👤</span> Мой профиль
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-4xl sm:text-5xl">{userData.avatar || '👤'}</div>
                  <div>
                    <h3 className="font-bold text-base sm:text-xl text-gray-800">{userData.fio}</h3>
                    <p className="text-xs text-gray-500">ID: {userData.id}</p>
                    <p className="text-green-500 text-xs">Статус: Активен</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">📞 Телефон</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{userData.phone}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">📧 Email</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{userData.email}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">🔑 Логин</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{userData.login}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">📅 Регистрация</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{format(new Date(userData.id), 'dd.MM.yyyy')}</p>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-purple-50 rounded-xl">
                  <p className="text-xs sm:text-sm text-purple-600">📊 Статистика</p>
                  <div className="flex gap-3 sm:gap-4 mt-2">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{userRequests.length}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Всего</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{userRequests.filter(r => r.status === 'completed').length}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Выполнено</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">{userRequests.filter(r => r.status === 'pending').length}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">В обработке</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UserDashboard;