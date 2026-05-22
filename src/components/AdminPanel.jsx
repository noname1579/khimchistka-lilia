import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { eventBus, EVENTS, forceRefreshAll } from '../utils/eventBus';

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    inProgressRequests: 0,
    totalRevenue: 0,
    totalUsers: 0,
    averageRating: 0
  });
  const [newService, setNewService] = useState({ name: '', price: '', categoryId: 1 });
  const [newMaster, setNewMaster] = useState({ name: '', specialty: '', experience: 0, phone: '' });
  const navigate = useNavigate();

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция загрузки всех данных
  const loadData = useCallback(() => {
    console.log('AdminPanel: Загрузка данных...', new Date().toLocaleTimeString());
    
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allServices = JSON.parse(localStorage.getItem('services') || '[]');
    const allMasters = JSON.parse(localStorage.getItem('masters') || '[]');
    
    console.log('AdminPanel: Найдено заявок:', allRequests.length);
    console.log('AdminPanel: Найдено пользователей:', allUsers.length);
    
    setRequests([...allRequests]);
    setUsers(allUsers.filter(u => u.login !== 'adminka' && u.id !== 0));
    setServices([...allServices]);
    setMasters([...allMasters]);
    
    const completedReqs = allRequests.filter(r => r.status === 'completed');
    const totalRevenue = completedReqs.reduce((sum, r) => sum + (r.total || 0), 0);
    const inProgressReqs = allRequests.filter(r => r.status === 'in_progress');
    
    setStats({
      totalRequests: allRequests.length,
      pendingRequests: allRequests.filter(r => r.status === 'pending').length,
      completedRequests: completedReqs.length,
      inProgressRequests: inProgressReqs.length,
      totalRevenue: totalRevenue,
      totalUsers: allUsers.filter(u => u.login !== 'adminka' && u.id !== 0).length,
      averageRating: 4.8
    });
    
    setLastUpdate(Date.now());
  }, []);

  // Принудительное обновление
  const forceLoadData = useCallback(() => {
    console.log('AdminPanel: Принудительная загрузка данных...');
    loadData();
    toast.success('Данные обновлены', { icon: '🔄' });
  }, [loadData]);

  // Подписка на события
  useEffect(() => {
    loadData();
    
    const handleForceRefresh = () => {
      console.log('AdminPanel: Получен сигнал принудительного обновления');
      loadData();
      toast.success('Данные обновлены', { icon: '🔄' });
    };
    
    const handleStorageChange = (e) => {
      console.log('AdminPanel: Storage событие', e.key);
      if (e.key === 'requests' || e.key === 'users' || e.key === 'services' || e.key === 'masters' || !e.key) {
        loadData();
      }
    };
    
    const handleDataUpdate = (data) => {
      console.log('AdminPanel: Получено событие обновления', data);
      loadData();
    };
    
    // Интервал для периодической проверки (каждые 3 секунды)
    const interval = setInterval(() => {
      const currentRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      if (currentRequests.length !== requests.length) {
        console.log('AdminPanel: Обнаружено изменение количества заявок');
        loadData();
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
  }, [loadData, requests.length]);

  // Обновление статуса заявки
  const updateRequestStatus = (requestId, newStatus, reason = '') => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        const updates = { 
          ...req, 
          status: newStatus, 
          statusText: newStatus === 'completed' ? 'Выполнена' : 
                      newStatus === 'confirmed' ? 'Подтверждена' :
                      newStatus === 'in_progress' ? 'В работе' : 'Отменена',
          cancelReason: reason
        };
        if (newStatus === 'completed') {
          updates.completedDate = new Date().toISOString();
        }
        return updates;
      }
      return req;
    });
    
    localStorage.setItem('requests', JSON.stringify(updatedRequests));
    
    eventBus.emit(EVENTS.DATA_UPDATED, { type: 'status_changed', requestId, newStatus });
    forceRefreshAll();
    loadData();
    
    const request = requests.find(r => r.id === requestId);
    if (request && request.clientId) {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const newNotification = {
        id: Date.now(),
        userId: request.clientId,
        title: `Статус заявки изменён`,
        message: `Ваша заявка "${request.serviceName}" теперь: ${updatedRequests.find(r => r.id === requestId)?.statusText}`,
        type: 'info',
        date: new Date().toISOString(),
        read: false
      };
      notifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
    
    toast.success(`Заявка ${newStatus === 'completed' ? 'выполнена' : 
                         newStatus === 'confirmed' ? 'подтверждена' :
                         newStatus === 'in_progress' ? 'взята в работу' : 'отменена'}`);
    setSelectedRequest(null);
  };

  // Добавление услуги
  const addService = () => {
    if (!newService.name || !newService.price) {
      toast.error('Заполните все поля');
      return;
    }
    const updated = [...services, { 
      id: Date.now(), 
      ...newService, 
      price: parseInt(newService.price),
      popular: false,
      icon: '✨',
      description: 'Новая услуга',
      duration: '2-3 дня'
    }];
    localStorage.setItem('services', JSON.stringify(updated));
    eventBus.emit(EVENTS.DATA_UPDATED, { type: 'service_added' });
    forceRefreshAll();
    loadData();
    setNewService({ name: '', price: '', categoryId: 1 });
    toast.success('Услуга добавлена');
  };

  // Удаление услуги
  const deleteService = (id) => {
    if (window.confirm('Удалить эту услугу?')) {
      const updated = services.filter(s => s.id !== id);
      localStorage.setItem('services', JSON.stringify(updated));
      eventBus.emit(EVENTS.DATA_UPDATED, { type: 'service_deleted' });
      forceRefreshAll();
      loadData();
      toast.success('Услуга удалена');
    }
  };

  // Добавление мастера
  const addMaster = () => {
    if (!newMaster.name || !newMaster.specialty || !newMaster.experience) {
      toast.error('Заполните все поля');
      return;
    }
    const updated = [...masters, {
      id: Date.now(),
      ...newMaster,
      experience: parseInt(newMaster.experience),
      rating: 5.0,
      reviews: 0,
      avatar: '👨‍🔧',
      status: 'active'
    }];
    localStorage.setItem('masters', JSON.stringify(updated));
    eventBus.emit(EVENTS.DATA_UPDATED, { type: 'master_added' });
    forceRefreshAll();
    loadData();
    setNewMaster({ name: '', specialty: '', experience: 0, phone: '' });
    toast.success('Мастер добавлен');
  };

  // Удаление мастера
  const deleteMaster = (id) => {
    if (window.confirm('Удалить мастера?')) {
      const updated = masters.filter(m => m.id !== id);
      localStorage.setItem('masters', JSON.stringify(updated));
      eventBus.emit(EVENTS.DATA_UPDATED, { type: 'master_deleted' });
      forceRefreshAll();
      loadData();
      toast.success('Мастер удалён');
    }
  };

  // Удаление пользователя
  const deleteUser = (id) => {
    if (window.confirm('Удалить пользователя? Все его заявки также будут удалены.')) {
      const updatedUsers = users.filter(u => u.id !== id);
      const updatedRequests = requests.filter(r => r.clientId !== id);
      const adminUser = { 
        id: 0, 
        fio: 'Администратор Системы', 
        phone: '+7 (999) 000-00-00', 
        email: 'admin@lilia.ru', 
        login: 'adminka', 
        password: 'password', 
        role: 'admin', 
        avatar: '👑', 
        createdAt: new Date().toISOString() 
      };
      localStorage.setItem('users', JSON.stringify([adminUser, ...updatedUsers]));
      localStorage.setItem('requests', JSON.stringify(updatedRequests));
      eventBus.emit(EVENTS.DATA_UPDATED, { type: 'user_deleted' });
      forceRefreshAll();
      loadData();
      toast.success('Пользователь удалён');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Вы вышли из системы');
    window.location.href = '/';
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: '⏳', label: 'На рассмотрении', border: 'border-yellow-500/30' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '✅', label: 'Подтверждена', border: 'border-blue-500/30' },
      in_progress: { bg: 'bg-purple-500/20', text: 'text-purple-300', icon: '🔄', label: 'В работе', border: 'border-purple-500/30' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-300', icon: '🎉', label: 'Выполнена', border: 'border-green-500/30' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-300', icon: '❌', label: 'Отменена', border: 'border-red-500/30' }
    };
    const s = statuses[status] || statuses.pending;
    return (
      <span className={`${s.bg} ${s.text} px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 border ${s.border}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-pink-900 text-white sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-2xl sm:text-3xl animate-float">👑</div>
            <div>
              <h1 className="text-base sm:text-xl font-bold">Панель администратора</h1>
              <p className="text-[10px] sm:text-xs text-white/60">Управление системой</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={forceLoadData} 
              className="bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all text-sm"
              title="Обновить данные"
            >
              🔄
            </button>
            {!isMobile && (
              <div className="text-right">
                <p className="text-sm font-semibold">Администратор</p>
                <p className="text-xs text-white/60">Онлайн</p>
              </div>
            )}
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              🚪 {!isMobile && 'Выйти'}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
          {[
            { icon: '📋', label: 'Всего заявок', value: stats.totalRequests, color: 'from-blue-500 to-cyan-500' },
            { icon: '⏳', label: 'В обработке', value: stats.pendingRequests, color: 'from-yellow-500 to-orange-500' },
            { icon: '🔄', label: 'В работе', value: stats.inProgressRequests, color: 'from-purple-500 to-pink-500' },
            { icon: '✅', label: 'Выполнено', value: stats.completedRequests, color: 'from-green-500 to-teal-500' },
            { icon: '💰', label: 'Выручка', value: `${stats.totalRevenue.toLocaleString()} ₽`, color: 'from-emerald-500 to-green-500' },
            { icon: '👥', label: 'Клиенты', value: stats.totalUsers, color: 'from-indigo-500 to-blue-500' },
            { icon: '⭐', label: 'Рейтинг', value: stats.averageRating, color: 'from-yellow-500 to-amber-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-r ${stat.color} rounded-xl sm:rounded-2xl p-2 sm:p-4 text-white shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{stat.icon}</div>
              <div className="text-sm sm:text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] sm:text-xs opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-3 sm:px-4 mt-2 sm:mt-4">
        <div className="flex gap-1 sm:gap-2 flex-wrap bg-gray-800/50 rounded-xl p-1 sm:p-2 backdrop-blur-sm">
          {[
            { id: 'overview', icon: '📊', label: 'Обзор' },
            { id: 'requests', icon: '📋', label: 'Заявки' },
            { id: 'users', icon: '👥', label: 'Пользователи' },
            { id: 'services', icon: '🛠️', label: 'Услуги' },
            { id: 'masters', icon: '👨‍🔧', label: 'Мастера' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                activeSection === item.id 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {item.icon} {!isMobile && item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span>📊</span> Последние заявки
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {requests.slice(0, isMobile ? 3 : 5).map(req => (
                    <div key={req.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-700/30 rounded-lg sm:rounded-xl hover:bg-gray-700/50 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{req.clientName}</p>
                        <p className="text-xs text-gray-400 truncate">{req.serviceName} • {req.deliveryDate}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 ml-2">
                        <p className="text-purple-400 font-semibold text-sm">{req.total} ₽</p>
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Requests Section */}
          {activeSection === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <span>📋</span> Все заявки ({requests.length})
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-700/30 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 sm:mb-3 gap-2">
                      <div className="w-full sm:w-auto">
                        <p className="font-bold text-white text-base sm:text-lg">{req.clientName}</p>
                        <p className="text-xs text-gray-400">📞 {req.clientPhone}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
                      <p className="truncate">📍 {req.clientAddress}</p>
                      <p>🛎️ {req.serviceName} — {req.servicePrice} ₽</p>
                      <p>📅 {req.deliveryDate} в {req.deliveryTime}</p>
                      <p>👨‍🔧 {req.masterName || 'Не назначен'}</p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 sm:pt-3 border-t border-white/10">
                        <button
                          onClick={() => updateRequestStatus(req.id, 'confirmed')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
                        >
                          ✅ Подтвердить
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'in_progress')}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
                        >
                          🔄 В работу
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'completed')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
                        >
                          🎉 Выполнена
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Причина отклонения:');
                            if (reason) updateRequestStatus(req.id, 'cancelled', reason);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
                        >
                          ❌ Отклонить
                        </button>
                      </div>
                    )}
                    {(req.status === 'confirmed' || req.status === 'in_progress') && (
                      <div className="flex gap-2 mt-3 pt-2 sm:pt-3 border-t border-white/10">
                        {req.status === 'confirmed' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'in_progress')}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
                          >
                            🔄 В работу
                          </button>
                        )}
                        {req.status === 'in_progress' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
                          >
                            🎉 Завершить
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-400">Нет заявок</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <span>👥</span> Пользователи ({users.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {users.map(user => {
                  const userRequests = requests.filter(r => r.clientId === user.id);
                  return (
                    <div key={user.id} className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-700/50 transition-all">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-3xl sm:text-4xl">{user.avatar || '👤'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm sm:text-base truncate">{user.fio}</p>
                          <p className="text-xs text-gray-400 truncate">📞 {user.phone}</p>
                          <p className="text-xs text-gray-400 truncate">📧 {user.email}</p>
                          <p className="text-xs text-purple-400 mt-1">🔑 {user.login}</p>
                          <div className="flex justify-between items-center mt-2 sm:mt-3 pt-2 border-t border-white/10">
                            <p className="text-xs text-gray-400">📋 Заявок: {userRequests.length}</p>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 text-xs transition-all"
                            >
                              🗑️ Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {users.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-400 col-span-full">Нет пользователей</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Services Section */}
          {activeSection === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Управление услугами</h2>
              
              <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">➕ Добавить услугу</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder="Название"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 outline-none text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    placeholder="Цена"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    className="w-full sm:w-32 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 outline-none text-sm sm:text-base"
                  />
                  <button
                    onClick={addService}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base"
                  >
                    ➕ Добавить
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {services.map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 sm:p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="font-medium text-white text-sm">{s.icon || '✨'} {s.name}</span>
                      <span className="text-purple-400 font-bold text-sm">{s.price} ₽</span>
                      {s.popular && <span className="text-yellow-400 text-xs">⭐ Популярное</span>}
                    </div>
                    <button
                      onClick={() => deleteService(s.id)}
                      className="text-red-400 hover:text-red-300 transition-all text-sm text-left sm:text-right"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Masters Section */}
          {activeSection === 'masters' && (
            <motion.div
              key="masters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Управление мастерами</h2>
              
              <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">➕ Добавить мастера</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder="ФИО"
                    value={newMaster.name}
                    onChange={(e) => setNewMaster({...newMaster, name: e.target.value})}
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 outline-none text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Специальность"
                    value={newMaster.specialty}
                    onChange={(e) => setNewMaster({...newMaster, specialty: e.target.value})}
                    className="w-full sm:w-40 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 outline-none text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    placeholder="Стаж"
                    value={newMaster.experience}
                    onChange={(e) => setNewMaster({...newMaster, experience: e.target.value})}
                    className="w-full sm:w-24 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 outline-none text-sm sm:text-base"
                  />
                  <button
                    onClick={addMaster}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base"
                  >
                    ➕ Добавить
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {masters.map(m => (
                  <div key={m.id} className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-700/50 transition-all">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-3xl sm:text-4xl">{m.avatar || '👨‍🔧'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <p className="font-bold text-white text-sm sm:text-base truncate">{m.name}</p>
                            <p className="text-xs text-gray-400">🔧 {m.specialty}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <span>⭐</span>
                            <span className="text-white text-sm">{m.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">📅 Стаж: {m.experience} лет</p>
                        <p className="text-xs text-gray-400">📞 {m.phone || 'Не указан'}</p>
                        <div className="flex justify-between items-center mt-2 sm:mt-3 pt-2 border-t border-white/10">
                          <p className="text-xs text-gray-400">📋 Отзывов: {m.reviews}</p>
                          <button
                            onClick={() => deleteMaster(m.id)}
                            className="text-red-400 hover:text-red-300 text-xs transition-all"
                          >
                            🗑️ Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminPanel;