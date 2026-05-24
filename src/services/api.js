// src/services/api.js
const API_URL = 'http://localhost:5000/api';

// ============ АВТОРИЗАЦИЯ ============
export const authAPI = {
  // Вход пользователя
  login: async (login, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await response.json();
      if (!response.ok) {
        return { user: null, error: data.error || 'Ошибка входа' };
      }
      return { user: data.user, token: data.token, error: null };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { user: null, error: 'Ошибка соединения с сервером' };
    }
  },

  // Регистрация пользователя
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) {
        return { data: null, error: data.error || 'Ошибка регистрации' };
      }
      return { data, error: null };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { data: null, error: 'Ошибка соединения с сервером' };
    }
  }
};

// ============ ПОЛЬЗОВАТЕЛИ ============
export const usersAPI = {
  // Получить всех пользователей
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      return [];
    }
  },

  // Получить пользователя по ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователя');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return null;
    }
  },

  // Удалить пользователя
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления пользователя');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      return { error: error.message };
    }
  }
};

// ============ ЗАЯВКИ ============
export const requestsAPI = {
  // Получить все заявки
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/requests`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки заявок');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения заявок:', error);
      return [];
    }
  },

  // Получить заявки пользователя
  getUserRequests: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/requests/user/${userId}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки заявок пользователя');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения заявок пользователя:', error);
      return [];
    }
  },

  // Создать заявку
  create: async (request) => {
    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error('Ошибка создания заявки');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      return { error: error.message };
    }
  },

  // Обновить статус заявки
  updateStatus: async (id, status, statusText, cancelReason = null) => {
    try {
      const response = await fetch(`${API_URL}/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusText, cancelReason })
      });
      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      return { error: error.message };
    }
  },

  // Отменить заявку
  cancel: async (id) => {
    try {
      const response = await fetch(`${API_URL}/requests/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Ошибка отмены заявки');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка отмены заявки:', error);
      return { error: error.message };
    }
  }
};

// ============ УСЛУГИ ============
export const servicesAPI = {
  // Получить все услуги
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки услуг');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения услуг:', error);
      return [];
    }
  },

  // Добавить услугу
  add: async (service) => {
    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      if (!response.ok) {
        throw new Error('Ошибка добавления услуги');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка добавления услуги:', error);
      return { error: error.message };
    }
  },

  // Удалить услугу
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления услуги');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка удаления услуги:', error);
      return { error: error.message };
    }
  },

  // Обновить услугу
  update: async (id, service) => {
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      if (!response.ok) {
        throw new Error('Ошибка обновления услуги');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления услуги:', error);
      return { error: error.message };
    }
  }
};

// ============ МАСТЕРА ============
export const mastersAPI = {
  // Получить всех мастеров
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/masters`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки мастеров');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения мастеров:', error);
      return [];
    }
  },

  // Добавить мастера
  add: async (master) => {
    try {
      const response = await fetch(`${API_URL}/masters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(master)
      });
      if (!response.ok) {
        throw new Error('Ошибка добавления мастера');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка добавления мастера:', error);
      return { error: error.message };
    }
  },

  // Удалить мастера
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/masters/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления мастера');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка удаления мастера:', error);
      return { error: error.message };
    }
  },

  // Обновить мастера
  update: async (id, master) => {
    try {
      const response = await fetch(`${API_URL}/masters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(master)
      });
      if (!response.ok) {
        throw new Error('Ошибка обновления мастера');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления мастера:', error);
      return { error: error.message };
    }
  }
};

// ============ УВЕДОМЛЕНИЯ ============
export const notificationsAPI = {
  // Получить уведомления пользователя
  getUserNotifications: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/user/${userId}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки уведомлений');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения уведомлений:', error);
      return [];
    }
  },

  // Добавить уведомление
  add: async (notification) => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
      if (!response.ok) {
        throw new Error('Ошибка добавления уведомления');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка добавления уведомления:', error);
      return { error: error.message };
    }
  },

  // Отметить уведомление как прочитанное
  markAsRead: async (id) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Ошибка отметки уведомления');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
      return { error: error.message };
    }
  }
};

// ============ СТАТИСТИКА ============
export const statsAPI = {
  // Получить статистику
  getStats: async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        totalRevenue: 0,
        totalUsers: 0
      };
    }
  }
};

// ============ ОТЗЫВЫ ============
export const reviewsAPI = {
  // Получить все отзывы
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/reviews`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки отзывов');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения отзывов:', error);
      return [];
    }
  },

  // Добавить отзыв
  add: async (review) => {
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!response.ok) {
        throw new Error('Ошибка добавления отзыва');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка добавления отзыва:', error);
      return { error: error.message };
    }
  },

  // Удалить отзыв
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления отзыва');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка удаления отзыва:', error);
      return { error: error.message };
    }
  }
};