// src/utils/eventBus.js
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  DATA_UPDATED: 'data_updated',
  FORCE_REFRESH: 'force_refresh',
  USER_REGISTERED: 'user_registered',
  REQUEST_CREATED: 'request_created'
};

// Функция для принудительного обновления всех компонентов
export const forceRefreshAll = () => {
  console.log('forceRefreshAll: Обновляем все компоненты');
  eventBus.emit(EVENTS.FORCE_REFRESH, { timestamp: Date.now() });
  window.dispatchEvent(new Event('storage'));
  // Дополнительное событие для надежности
  window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { type: 'force_refresh' } }));
};