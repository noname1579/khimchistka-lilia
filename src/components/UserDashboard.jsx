import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('new');
  const [userRequests, setUserRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    contactPhone: '',
    deliveryDate: '',
    deliveryTime: '',
    serviceId: '',
    masterId: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadData();
    loadNotifications();
  }, []);

  const loadData = () => {
    if (!localStorage.getItem('services')) {
      localStorage.setItem('services', JSON.stringify([
        { id: 1, name: 'Химчистка одежды', price: 1500, categoryId: 1, duration: '2-3 дня', popular: true },
        { id: 2, name: 'Стирка белья', price: 800, categoryId: 1, duration: '1-2 дня', popular: false },
        { id: 3, name: 'Чистка обуви', price: 1000, categoryId: 2, duration: '1 день', popular: true },
        { id: 4, name: 'Химчистка мебели', price: 3500, categoryId: 3, duration: '3-5 дней', popular: false },
        { id: 5, name: 'Чистка салона авто', price: 5000, categoryId: 3, duration: '2-4 дня', popular: true },
      ]));
    }
    if (!localStorage.getItem('masters')) {
      localStorage.setItem('masters', JSON.stringify([
        { id: 1, name: 'Иванов Иван', specialty: 'Химчистка одежды', experience: 5, rating: 4.8, reviews: 124 },
        { id: 2, name: 'Петрова Анна', specialty: 'Чистка обуви', experience: 3, rating: 4.9, reviews: 89 },
        { id: 3, name: 'Сидоров Михаил', specialty: 'Мебель и авто', experience: 8, rating: 5.0, reviews: 256 },
      ]));
    }
    
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    setUserRequests(allRequests.filter(r => r.clientId == userId).sort((a,b) => b.id - a.id));
    setServices(JSON.parse(localStorage.getItem('services') || '[]'));
    setMasters(JSON.parse(localStorage.getItem('masters') || '[]'));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    setUserData(users.find(u => u.id == userId));
  };

  const loadNotifications = () => {
    const allNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(allNotifs.filter(n => n.userId == userId));
  };

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
    notifs.push(newNotif);
    localStorage.setItem('notifications', JSON.stringify(notifs));
    loadNotifications();
    toast.success(message);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    allRequests.push(newRequest);
    localStorage.setItem('requests', JSON.stringify(allRequests));
    
    addNotification('Заявка создана', `Ваша заявка на услугу "${service?.name}" успешно создана`, 'success');
    
    loadData();
    setFormData({ address: '', contactPhone: '', deliveryDate: '', deliveryTime: '', serviceId: '', masterId: '', comments: '' });
    setActiveTab('history');
    setLoading(false);
  };

  const cancelRequest = async (requestId) => {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const updatedAll = allRequests.map(req => {
      if (req.id === requestId && req.status === 'pending') {
        return { ...req, status: 'cancelled', statusText: 'Отменена пользователем' };
      }
      return req;
    });
    
    localStorage.setItem('requests', JSON.stringify(updatedAll));
    loadData();
    addNotification('Заявка отменена', 'Ваша заявка была успешно отменена', 'warning');
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
      <span className={`${s.bg} ${s.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-float">🧼</div>
            <div>
              <h1 className="text-xl font-bold">Химчистка «Лилия»</h1>
              <p className="text-xs text-white/70">Добро пожаловать, {userData?.fio?.split(' ')[0] || 'Гость'}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                🔔
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
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
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 bg-gray-50 border-b font-semibold text-gray-700">Уведомления</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Нет уведомлений</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                          <p className="font-semibold text-sm">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(n.date), 'dd.MM.yyyy')}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all">
              🚪 Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'new' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📝 Новая заявка
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📋 Мои заявки ({userRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            👤 Профиль
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📝</span> Новая заявка
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📍 Адрес</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Ваш адрес"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📞 Контактный телефон</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    placeholder="Контактный телефон"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">📅 Дата</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">⏰ Время</label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🛎️ Услуга</label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none transition-all"
                    required
                  >
                    <option value="">Выберите услугу</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.price} ₽ {s.popular && '⭐'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👨‍🔧 Мастер (по желанию)</label>
                  <select
                    name="masterId"
                    value={formData.masterId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none transition-all"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">💬 Комментарий (опционально)</label>
                  <textarea
                    name="comments"
                    placeholder="Дополнительные пожелания..."
                    value={formData.comments}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50"
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
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📋</span> Мои заявки
              </h2>
              {userRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">📭</div>
                  <p className="text-gray-400">У вас пока нет заявок</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Создать первую заявку →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRequests.map(req => (
                    <div key={req.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800">{req.serviceName}</p>
                          <p className="text-sm text-gray-500">{format(new Date(req.requestDate), 'dd.MM.yyyy HH:mm')}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="space-y-2 text-gray-600">
                        <p><span className="font-medium">📍 Адрес:</span> {req.clientAddress}</p>
                        <p><span className="font-medium">📅 Дата доставки:</span> {req.deliveryDate} в {req.deliveryTime}</p>
                        <p><span className="font-medium">👨‍🔧 Мастер:</span> {req.masterName || 'Не назначен'}</p>
                        <p className="text-lg font-bold text-purple-600">💰 {req.total} ₽</p>
                      </div>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => cancelRequest(req.id)}
                          className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Отменить заявку
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>👤</span> Мой профиль
              </h2>
              {userData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-5xl">👤</div>
                    <div>
                      <h3 className="font-bold text-xl">{userData.fio}</h3>
                      <p className="text-gray-500">ID: {userData.id}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Телефон</p>
                      <p className="font-semibold">{userData.phone}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold">{userData.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Логин</p>
                      <p className="font-semibold">{userData.login}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Дата регистрации</p>
                      <p className="font-semibold">{format(new Date(userData.id), 'dd.MM.yyyy')}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UserDashboard;