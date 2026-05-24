// src/components/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0, pendingRequests: 0, completedRequests: 0,
    inProgressRequests: 0, totalRevenue: 0, totalUsers: 0
  });
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [newMaster, setNewMaster] = useState({ name: '', specialty: '', experience: 0, phone: '' });
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [usersRes, requestsRes, servicesRes, mastersRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/requests`),
        fetch(`${API_URL}/services`),
        fetch(`${API_URL}/masters`)
      ]);
      
      const usersData = await usersRes.json();
      const requestsData = await requestsRes.json();
      const servicesData = await servicesRes.json();
      const mastersData = await mastersRes.json();
      
      setUsers(usersData);
      setRequests(requestsData);
      setServices(servicesData);
      setMasters(mastersData);
      
      const completedReqs = requestsData.filter(r => r.status === 'completed');
      const totalRevenue = completedReqs.reduce((sum, r) => sum + (r.total || 0), 0);
      
      setStats({
        totalRequests: requestsData.length,
        pendingRequests: requestsData.filter(r => r.status === 'pending').length,
        completedRequests: completedReqs.length,
        inProgressRequests: requestsData.filter(r => r.status === 'in_progress').length,
        totalRevenue: totalRevenue,
        totalUsers: usersData.length
      });
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const updateRequestStatus = async (id, status, statusText, cancelReason = '') => {
    try {
      const response = await fetch(`${API_URL}/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusText, cancelReason })
      });
      if (!response.ok) throw new Error();
      toast.success(`Заявка ${statusText.toLowerCase()}`);
      loadData();
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const addService = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Заполните поля');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newService.name, price: parseInt(newService.price) })
      });
      if (!response.ok) throw new Error();
      toast.success('Услуга добавлена');
      loadData();
      setNewService({ name: '', price: '' });
    } catch (error) {
      toast.error('Ошибка добавления');
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Удалить услугу?')) return;
    try {
      await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
      toast.success('Услуга удалена');
      loadData();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const addMaster = async () => {
    if (!newMaster.name || !newMaster.specialty) {
      toast.error('Заполните имя и специальность');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/masters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaster)
      });
      if (!response.ok) throw new Error();
      toast.success('Мастер добавлен');
      loadData();
      setNewMaster({ name: '', specialty: '', experience: 0, phone: '' });
    } catch (error) {
      toast.error('Ошибка добавления');
    }
  };

  const deleteMaster = async (id) => {
    if (!confirm('Удалить мастера?')) return;
    try {
      await fetch(`${API_URL}/masters/${id}`, { method: 'DELETE' });
      toast.success('Мастер удалён');
      loadData();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Удалить пользователя?')) return;
    try {
      await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      toast.success('Пользователь удалён');
      loadData();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: '⏳', label: 'На рассмотрении' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '✅', label: 'Подтверждена' },
      in_progress: { bg: 'bg-purple-500/20', text: 'text-purple-300', icon: '🔄', label: 'В работе' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-300', icon: '🎉', label: 'Выполнена' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-300', icon: '❌', label: 'Отменена' }
    };
    const s = statuses[status] || statuses.pending;
    return <span className={`${s.bg} ${s.text} px-2 py-1 rounded-full text-xs font-semibold`}>{s.icon} {s.label}</span>;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white text-center"><div className="text-4xl mb-4 animate-spin">🔄</div><p>Загрузка...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gradient-to-r from-purple-900 to-pink-900 text-white sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="text-3xl">👑</div><div><h1 className="text-xl font-bold">Панель администратора</h1><p className="text-xs text-white/60">Управление системой</p></div></div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl">🔄</button>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl">🚪 Выйти</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: '📋', label: 'Всего заявок', value: stats.totalRequests },
            { icon: '⏳', label: 'В обработке', value: stats.pendingRequests },
            { icon: '🔄', label: 'В работе', value: stats.inProgressRequests },
            { icon: '✅', label: 'Выполнено', value: stats.completedRequests },
            { icon: '💰', label: 'Выручка', value: `${stats.totalRevenue.toLocaleString()} ₽` },
            { icon: '👥', label: 'Клиенты', value: stats.totalUsers }
          ].map((stat, i) => (
            <div key={i} className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex gap-2 flex-wrap bg-gray-800/50 rounded-xl p-2">
          {['overview', 'requests', 'users', 'services', 'masters'].map(section => (
            <button key={section} onClick={() => setActiveSection(section)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeSection === section ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {section === 'overview' && '📊 Обзор'}
              {section === 'requests' && '📋 Заявки'}
              {section === 'users' && '👥 Пользователи'}
              {section === 'services' && '🛠️ Услуги'}
              {section === 'masters' && '👨‍🔧 Мастера'}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeSection === 'requests' && (
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Все заявки ({requests.length})</h2>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div><p className="font-bold text-white text-lg">{req.client_name}</p><p className="text-sm text-gray-400">📞 {req.client_phone}</p></div>
                    {getStatusBadge(req.status)}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                    <p>📍 {req.client_address}</p><p>🛎️ {req.service_name} — {req.service_price} ₽</p>
                    <p>📅 {req.delivery_date} в {req.delivery_time}</p><p>👨‍🔧 {req.master_name || 'Не назначен'}</p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                      <button onClick={() => updateRequestStatus(req.id, 'confirmed', 'Подтверждена')} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">✅ Подтвердить</button>
                      <button onClick={() => updateRequestStatus(req.id, 'in_progress', 'В работе')} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">🔄 В работу</button>
                      <button onClick={() => updateRequestStatus(req.id, 'completed', 'Выполнена')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">🎉 Выполнена</button>
                      <button onClick={() => { const reason = prompt('Причина отклонения:'); if (reason) updateRequestStatus(req.id, 'cancelled', 'Отменена', reason); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">❌ Отклонить</button>
                    </div>
                  )}
                  {(req.status === 'confirmed' || req.status === 'in_progress') && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      {req.status === 'confirmed' && <button onClick={() => updateRequestStatus(req.id, 'in_progress', 'В работе')} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">🔄 В работу</button>}
                      {req.status === 'in_progress' && <button onClick={() => updateRequestStatus(req.id, 'completed', 'Выполнена')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">🎉 Завершить</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">👥 Пользователи ({users.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(user => (
                <div key={user.id} className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{user.avatar || '👤'}</div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{user.fio}</p>
                      <p className="text-sm text-gray-400">📞 {user.phone}</p>
                      <p className="text-sm text-gray-400">📧 {user.email}</p>
                      <p className="text-sm text-purple-400">🔑 {user.login}</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400">📋 Заявок: {requests.filter(r => r.client_id === user.id).length}</p>
                        <button onClick={() => deleteUser(user.id)} className="text-red-400 hover:text-red-300 text-xs">🗑️ Удалить</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🛠️ Управление услугами</h2>
            <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-white mb-3">➕ Добавить услугу</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Название" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                <input type="number" placeholder="Цена" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-32 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                <button onClick={addService} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">➕ Добавить</button>
              </div>
            </div>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div><span className="text-white">{s.icon || '✨'} {s.name}</span><span className="text-purple-400 ml-3">{s.price} ₽</span></div>
                  <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-300">🗑️ Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'masters' && (
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">👨‍🔧 Управление мастерами</h2>
            <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-white mb-3">➕ Добавить мастера</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="ФИО" value={newMaster.name} onChange={e => setNewMaster({...newMaster, name: e.target.value})} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                <input type="text" placeholder="Специальность" value={newMaster.specialty} onChange={e => setNewMaster({...newMaster, specialty: e.target.value})} className="w-40 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                <input type="number" placeholder="Стаж" value={newMaster.experience} onChange={e => setNewMaster({...newMaster, experience: e.target.value})} className="w-24 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                <button onClick={addMaster} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">➕ Добавить</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {masters.map(m => (
                <div key={m.id} className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{m.avatar || '👨‍🔧'}</div>
                    <div className="flex-1"><p className="font-bold text-white">{m.name}</p><p className="text-sm text-gray-400">🔧 {m.specialty}</p><p className="text-sm text-gray-400">📅 Стаж: {m.experience} лет</p><div className="flex justify-between items-center mt-3 pt-2 border-t"><p className="text-xs text-gray-400">⭐ {m.rating} ({m.reviews} отзывов)</p><button onClick={() => deleteMaster(m.id)} className="text-red-400 text-xs">🗑️ Удалить</button></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'overview' && (
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📊 Последние заявки</h3>
            <div className="space-y-3">
              {requests.slice(0, 5).map(req => (
                <div key={req.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
                  <div><p className="font-semibold text-white">{req.client_name}</p><p className="text-sm text-gray-400">{req.service_name} • {req.delivery_date}</p></div>
                  <div className="flex items-center gap-3"><p className="text-purple-400">{req.total} ₽</p>{getStatusBadge(req.status)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;