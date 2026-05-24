// src/components/UserDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('new');
  const [userRequests, setUserRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const API_URL = 'http://localhost:5000/api';

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

  const validateAddress = (address) => address.trim().length >= 5;
  const validateComments = (comments) => !comments || comments.length <= 500;

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const validateDate = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const validateTime = (time) => {
    if (!time) return false;
    const [hours] = time.split(':').map(Number);
    return hours >= 9 && hours <= 21;
  };

  const validateForm = () => {
    const errors = {};
    if (!validateAddress(formData.address)) errors.address = 'Адрес минимум 5 символов';
    if (!validatePhone(formData.contactPhone)) errors.contactPhone = 'Введите корректный телефон';
    if (!validateDate(formData.deliveryDate)) errors.deliveryDate = 'Нельзя выбрать прошедшую дату';
    if (!validateTime(formData.deliveryTime)) errors.deliveryTime = 'Время с 9:00 до 21:00';
    if (!formData.serviceId) errors.serviceId = 'Выберите услугу';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Загрузка данных с сервера
  const loadUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
    }
  }, [userId]);

  const loadServices = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    }
  }, []);

  const loadMasters = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/masters`);
      if (response.ok) {
        const data = await response.json();
        setMasters(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    }
  }, []);

  const loadUserRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/requests/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserRequests(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    }
  }, [userId]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    }
  }, [userId]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadUserData(),
      loadServices(),
      loadMasters(),
      loadUserRequests(),
      loadNotifications()
    ]);
    setLoading(false);
  }, [loadUserData, loadServices, loadMasters, loadUserRequests, loadNotifications]);

  useEffect(() => {
    loadAllData();
    
    // Интервал для периодического обновления
    const interval = setInterval(() => {
      loadAllData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Создание заявки
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки');
      return;
    }
    
    setSubmitting(true);
    
    const service = services.find(s => s.id == formData.serviceId);
    
    const newRequest = {
      clientId: parseInt(userId),
      clientName: userData?.fio,
      clientPhone: formData.contactPhone,
      clientEmail: userData?.email,
      clientAddress: formData.address,
      serviceId: parseInt(formData.serviceId),
      serviceName: service?.name,
      servicePrice: service?.price,
      masterId: formData.masterId ? parseInt(formData.masterId) : null,
      masterName: masters.find(m => m.id == formData.masterId)?.name,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      comments: formData.comments,
      total: service?.price
    };

    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      
      if (!response.ok) throw new Error('Ошибка создания');
      
      toast.success('Заявка создана!');
      await loadUserRequests();
      
      setFormData({
        address: '', contactPhone: '', deliveryDate: '', deliveryTime: '',
        serviceId: '', masterId: '', comments: ''
      });
      setActiveTab('history');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка создания заявки');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', statusText: 'Отменена пользователем' })
      });
      
      if (!response.ok) throw new Error('Ошибка отмены');
      
      toast.success('Заявка отменена');
      await loadUserRequests();
    } catch (error) {
      toast.error('Ошибка отмены заявки');
    }
  };

  const repeatRequest = (request) => {
    setFormData({
      address: request.client_address,
      contactPhone: request.client_phone,
      deliveryDate: '',
      deliveryTime: '',
      serviceId: request.service_id.toString(),
      masterId: request.master_id?.toString() || '',
      comments: ''
    });
    setActiveTab('new');
    toast.success('Данные скопированы');
  };

  const markAsRead = async (notifId) => {
    try {
      await fetch(`${API_URL}/notifications/${notifId}/read`, { method: 'PUT' });
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'На рассмотрении' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅', label: 'Подтверждена' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🔄', label: 'В работе' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '🎉', label: 'Выполнена' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Отменена' }
    };
    const s = statuses[status] || statuses.pending;
    return (
      <span className={`${s.bg} ${s.text} px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-spin">🔄</div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧼</div>
            <div>
              <h1 className="text-xl font-bold">Химчистка «Лилия»</h1>
              <p className="text-xs text-white/70">Добро пожаловать, {userData?.fio?.split(' ')[0] || 'Гость'}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/20 rounded-lg">
                🔔
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">Уведомления</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Нет уведомлений</div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} onClick={() => markAsRead(n.id)}
                            className={`p-3 border-b cursor-pointer ${!n.is_read ? 'bg-purple-50' : ''}`}
                          >
                            <p className="font-semibold text-sm">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{format(new Date(n.date), 'dd.MM.yyyy HH:mm')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">🚪 Выйти</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md">
          <button onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === 'new' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600'}`}>
            📝 Новая
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === 'history' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600'}`}>
            📋 Заявки ({userRequests.length})
          </button>
          <button onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === 'profile' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600'}`}>
            👤 Профиль
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'new' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">📝 Новая заявка</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">📍 Адрес *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 outline-none`}
                  required />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">📞 Телефон *</label>
                <input type="tel" name="contactPhone" placeholder="+7 (999) 123-45-67" value={formData.contactPhone} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.contactPhone ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 outline-none`}
                  required />
                {formErrors.contactPhone && <p className="text-red-500 text-xs mt-1">{formErrors.contactPhone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">📅 Дата *</label>
                  <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange}
                    min={getMinDate()} max={getMaxDate()}
                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.deliveryDate ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 outline-none`}
                    required />
                  {formErrors.deliveryDate && <p className="text-red-500 text-xs mt-1">{formErrors.deliveryDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">⏰ Время *</label>
                  <input type="time" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange}
                    min="09:00" max="21:00"
                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.deliveryTime ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 outline-none`}
                    required />
                  {formErrors.deliveryTime && <p className="text-red-500 text-xs mt-1">{formErrors.deliveryTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">🛎️ Услуга *</label>
                <select name="serviceId" value={formData.serviceId} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.serviceId ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 outline-none`}
                  required>
                  <option value="">Выберите услугу</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name} — {s.price} ₽</option>)}
                </select>
                {formErrors.serviceId && <p className="text-red-500 text-xs mt-1">{formErrors.serviceId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">👨‍🔧 Мастер (по желанию)</label>
                <select name="masterId" value={formData.masterId} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none">
                  <option value="">Любой мастер</option>
                  {masters.map(m => <option key={m.id} value={m.id}>{m.name} ({m.specialty}) ⭐ {m.rating}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">💬 Комментарий</label>
                <textarea name="comments" rows="3" value={formData.comments} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none resize-none"
                  placeholder="Дополнительные пожелания..."/>
                <p className="text-gray-400 text-xs text-right">{formData.comments.length}/500</p>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl disabled:opacity-50">
                {submitting ? 'Отправка...' : '📨 Отправить заявку'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">📋 Мои заявки ({userRequests.length})</h2>
            {userRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📭</div>
                <p className="text-gray-400">У вас пока нет заявок</p>
                <button onClick={() => setActiveTab('new')} className="mt-4 text-purple-600 font-semibold">Создать заявку →</button>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map(req => (
                  <div key={req.id} className="border rounded-xl p-4 hover:shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{req.service_name}</p>
                        <p className="text-sm text-gray-500">{format(new Date(req.request_date), 'dd.MM.yyyy HH:mm')}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="space-y-1 text-gray-600 text-sm">
                      <p><span className="font-medium">📍 Адрес:</span> {req.client_address}</p>
                      <p><span className="font-medium">📅 Дата:</span> {req.delivery_date} в {req.delivery_time}</p>
                      <p className="text-lg font-bold text-purple-600">💰 {req.total} ₽</p>
                    </div>
                    <div className="flex gap-3 mt-3 pt-3 border-t">
                      {req.status === 'pending' && (
                        <button onClick={() => cancelRequest(req.id)} className="text-red-500 text-sm">❌ Отменить</button>
                      )}
                      {req.status === 'completed' && (
                        <button onClick={() => repeatRequest(req)} className="text-green-500 text-sm">🔄 Повторить</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && userData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">👤 Мой профиль</h2>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mb-4">
              <div className="text-5xl">{userData.avatar || '👤'}</div>
              <div>
                <h3 className="font-bold text-xl">{userData.fio}</h3>
                <p className="text-gray-500">ID: {userData.id}</p>
                <p className="text-green-500 text-sm">Статус: Активен</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">📞 Телефон</p><p className="font-semibold">{userData.phone}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">📧 Email</p><p className="font-semibold">{userData.email}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">🔑 Логин</p><p className="font-semibold">{userData.login}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">📅 Регистрация</p><p className="font-semibold">{format(new Date(userData.created_at), 'dd.MM.yyyy')}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;