// src/services/dbAPI.js
import * as indexedDB from './indexedDB';

let db = null;

// Инициализация базы данных
export const initDB = async () => {
  if (!db) {
    db = await indexedDB.openDB();
  }
  return db;
};

// ============ АВТОРИЗАЦИЯ ============
export const authAPI = {
  login: async (login, password) => {
    await initDB();
    const user = await indexedDB.getUserByLogin(login);
    
    if (!user) {
      return { user: null, error: 'Пользователь не найден' };
    }
    
    if (user.password !== password) {
      return { user: null, error: 'Неверный пароль' };
    }
    
    return { user, error: null };
  },

  register: async (userData) => {
    await initDB();
    const existingUser = await indexedDB.getUserByLogin(userData.login);
    
    if (existingUser) {
      return { data: null, error: 'Пользователь с таким логином уже существует' };
    }
    
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'user',
      avatar: '👤',
      createdAt: new Date().toISOString()
    };
    
    await indexedDB.addUser(db, newUser);
    return { data: newUser, error: null };
  }
};

// ============ ЗАЯВКИ ============
export const requestsAPI = {
  getAll: async () => {
    await initDB();
    const requests = await indexedDB.getAllRequests();
    return { data: requests, error: null };
  },

  getUserRequests: async (userId) => {
    await initDB();
    const requests = await indexedDB.getUserRequests(userId);
    return { data: requests, error: null };
  },

  create: async (request) => {
    await initDB();
    const newRequest = {
      ...request,
      requestDate: new Date().toISOString(),
      status: 'pending',
      statusText: 'На рассмотрении'
    };
    const id = await indexedDB.addRequest(newRequest);
    
    // Добавляем уведомление
    await notificationsAPI.add({
      userId: request.clientId,
      title: '📝 Заявка создана',
      message: `Ваша заявка на услугу "${request.serviceName}" успешно создана`,
      type: 'success'
    });
    
    return { data: { ...newRequest, id }, error: null };
  },

  updateStatus: async (id, status, statusText, cancelReason = null) => {
    await initDB();
    const updated = await indexedDB.updateRequestStatus(id, status, statusText, cancelReason);
    return { data: updated, error: null };
  },

  cancel: async (id) => {
    await initDB();
    await indexedDB.deleteRequest(id);
    return { error: null };
  }
};

// ============ УСЛУГИ ============
export const servicesAPI = {
  getAll: async () => {
    await initDB();
    const services = await indexedDB.getAllServices();
    return { data: services, error: null };
  },

  add: async (service) => {
    await initDB();
    const newService = {
      id: Date.now(),
      ...service,
      popular: false,
      icon: '✨'
    };
    await indexedDB.addService(db, newService);
    return { data: newService, error: null };
  },

  delete: async (id) => {
    await initDB();
    await indexedDB.deleteService(id);
    return { error: null };
  }
};

// ============ МАСТЕРА ============
export const mastersAPI = {
  getAll: async () => {
    await initDB();
    const masters = await indexedDB.getAllMasters();
    return { data: masters, error: null };
  },

  add: async (master) => {
    await initDB();
    const newMaster = {
      id: Date.now(),
      ...master,
      rating: 5.0,
      reviews: 0,
      avatar: '👨‍🔧',
      status: 'active'
    };
    await indexedDB.addMaster(db, newMaster);
    return { data: newMaster, error: null };
  },

  delete: async (id) => {
    await initDB();
    await indexedDB.deleteMaster(id);
    return { error: null };
  }
};

// ============ ПОЛЬЗОВАТЕЛИ ============
export const usersAPI = {
  getAll: async () => {
    await initDB();
    const users = await indexedDB.getAllUsers();
    return { data: users, error: null };
  },

  getById: async (id) => {
    await initDB();
    const user = await indexedDB.getUserById(id);
    return { data: user, error: null };
  },

  delete: async (id) => {
    await initDB();
    await indexedDB.deleteUser(id);
    return { error: null };
  }
};

// ============ УВЕДОМЛЕНИЯ ============
export const notificationsAPI = {
  getUserNotifications: async (userId) => {
    await initDB();
    const notifications = await indexedDB.getUserNotifications(userId);
    return { data: notifications, error: null };
  },

  add: async (notification) => {
    await initDB();
    const id = await indexedDB.addNotification(notification);
    return { data: { ...notification, id }, error: null };
  },

  markAsRead: async (id) => {
    await initDB();
    await indexedDB.markNotificationAsRead(id);
    return { error: null };
  }
};