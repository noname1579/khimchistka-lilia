// src/services/indexedDB.js

const DB_NAME = 'KhimchistkaLiliaDB';
const DB_VERSION = 1;

// Названия хранилищ (таблиц)
const STORES = {
  USERS: 'users',
  REQUESTS: 'requests',
  SERVICES: 'services',
  MASTERS: 'masters',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews'
};

// Открытие/создание базы данных
export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Ошибка открытия базы данных:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Создаём хранилище пользователей
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const usersStore = db.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('login', 'login', { unique: true });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('phone', 'phone', { unique: true });
      }

      // Создаём хранилище заявок
      if (!db.objectStoreNames.contains(STORES.REQUESTS)) {
        const requestsStore = db.createObjectStore(STORES.REQUESTS, { keyPath: 'id', autoIncrement: true });
        requestsStore.createIndex('clientId', 'clientId');
        requestsStore.createIndex('status', 'status');
        requestsStore.createIndex('date', 'requestDate');
      }

      // Создаём хранилище услуг
      if (!db.objectStoreNames.contains(STORES.SERVICES)) {
        const servicesStore = db.createObjectStore(STORES.SERVICES, { keyPath: 'id', autoIncrement: true });
        servicesStore.createIndex('name', 'name');
        servicesStore.createIndex('categoryId', 'categoryId');
      }

      // Создаём хранилище мастеров
      if (!db.objectStoreNames.contains(STORES.MASTERS)) {
        const mastersStore = db.createObjectStore(STORES.MASTERS, { keyPath: 'id', autoIncrement: true });
        mastersStore.createIndex('name', 'name');
        mastersStore.createIndex('specialty', 'specialty');
      }

      // Создаём хранилище уведомлений
      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        const notificationsStore = db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id', autoIncrement: true });
        notificationsStore.createIndex('userId', 'userId');
        notificationsStore.createIndex('isRead', 'isRead');
      }

      // Создаём хранилище отзывов
      if (!db.objectStoreNames.contains(STORES.REVIEWS)) {
        const reviewsStore = db.createObjectStore(STORES.REVIEWS, { keyPath: 'id', autoIncrement: true });
        reviewsStore.createIndex('userId', 'userId');
        reviewsStore.createIndex('rating', 'rating');
      }

      // Заполняем начальными данными
      fillInitialData(db);
    };
  });
};

// Заполнение начальными данными
const fillInitialData = async (db) => {
  // Проверяем, есть ли уже пользователи
  const transaction = db.transaction([STORES.USERS], 'readonly');
  const countRequest = transaction.objectStore(STORES.USERS).count();
  
  countRequest.onsuccess = () => {
    if (countRequest.result === 0) {
      // Добавляем администратора
      addUser(db, {
        id: 0,
        fio: 'Администратор Системы',
        phone: '+7 (999) 000-00-00',
        email: 'admin@lilia.ru',
        login: 'adminka',
        password: 'password',
        role: 'admin',
        avatar: '👑',
        createdAt: new Date().toISOString()
      });

      // Добавляем тестовых пользователей
      const testUsers = [
        { fio: 'Иванов Иван Иванович', phone: '+7 (999) 111-22-33', email: 'ivan@example.com', login: 'ivan', password: '123456', avatar: '👨' },
        { fio: 'Петрова Анна Сергеевна', phone: '+7 (999) 222-33-44', email: 'anna@example.com', login: 'anna', password: '123456', avatar: '👩' },
        { fio: 'Сидоров Михаил Петрович', phone: '+7 (999) 333-44-55', email: 'mikhail@example.com', login: 'mikhail', password: '123456', avatar: '👨‍🦰' },
        { fio: 'Козлова Елена Дмитриевна', phone: '+7 (999) 444-55-66', email: 'elena@example.com', login: 'elena', password: '123456', avatar: '👩‍🦳' }
      ];

      testUsers.forEach(user => {
        addUser(db, {
          ...user,
          id: Date.now() + Math.random(),
          role: 'user',
          createdAt: new Date().toISOString()
        });
      });
    }
  };

  // Добавляем услуги
  const servicesTransaction = db.transaction([STORES.SERVICES], 'readonly');
  const servicesCount = servicesTransaction.objectStore(STORES.SERVICES).count();
  
  servicesCount.onsuccess = () => {
    if (servicesCount.result === 0) {
      const services = [
        { id: 1, name: 'Химчистка одежды', price: 1500, categoryId: 1, duration: '2-3 дня', popular: true, icon: '👕', description: 'Деликатная чистка любых тканей' },
        { id: 2, name: 'Стирка белья', price: 800, categoryId: 1, duration: '1-2 дня', popular: false, icon: '👔', description: 'Профессиональная стирка' },
        { id: 3, name: 'Чистка обуви', price: 1000, categoryId: 2, duration: '1 день', popular: true, icon: '👞', description: 'Восстановление обуви' },
        { id: 4, name: 'Химчистка мебели', price: 3500, categoryId: 3, duration: '3-5 дней', popular: false, icon: '🛋️', description: 'Глубокая чистка мебели' },
        { id: 5, name: 'Чистка салона авто', price: 5000, categoryId: 3, duration: '2-4 дня', popular: true, icon: '🚗', description: 'Химчистка салона' },
        { id: 6, name: 'Химчистка пуховиков', price: 2000, categoryId: 1, duration: '2-3 дня', popular: true, icon: '🧥', description: 'Особая забота о пухе' }
      ];

      services.forEach(service => addService(db, service));
    }
  };

  // Добавляем мастеров
  const mastersTransaction = db.transaction([STORES.MASTERS], 'readonly');
  const mastersCount = mastersTransaction.objectStore(STORES.MASTERS).count();
  
  mastersCount.onsuccess = () => {
    if (mastersCount.result === 0) {
      const masters = [
        { id: 1, name: 'Иванов Иван', specialty: 'Химчистка одежды', experience: 5, rating: 4.8, reviews: 124, avatar: '👨‍🦰', phone: '+7 (999) 111-22-33', status: 'active' },
        { id: 2, name: 'Петрова Анна', specialty: 'Чистка обуви', experience: 3, rating: 4.9, reviews: 89, avatar: '👩‍🦳', phone: '+7 (999) 222-33-44', status: 'active' },
        { id: 3, name: 'Сидоров Михаил', specialty: 'Мебель и авто', experience: 8, rating: 5.0, reviews: 256, avatar: '👨‍🦲', phone: '+7 (999) 333-44-55', status: 'active' }
      ];

      masters.forEach(master => addMaster(db, master));
    }
  };
};

// ============ CRUD ОПЕРАЦИИ ============

// ----- ПОЛЬЗОВАТЕЛИ -----
export const addUser = async (db, user) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USERS], 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    const request = store.add(user);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getUserByLogin = async (login) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USERS], 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    const index = store.index('login');
    const request = index.get(login);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getUserById = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USERS], 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    const request = store.get(parseInt(id));
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllUsers = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USERS], 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const users = request.result.filter(u => u.role !== 'admin');
      resolve(users);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteUser = async (id) => {
  const db = await openDB();
  
  // Удаляем заявки пользователя
  const userRequests = await getUserRequests(id);
  for (const req of userRequests) {
    await deleteRequest(req.id);
  }
  
  // Удаляем пользователя
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USERS], 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    const request = store.delete(parseInt(id));
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// ----- ЗАЯВКИ -----
export const addRequest = async (request) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REQUESTS], 'readwrite');
    const store = transaction.objectStore(STORES.REQUESTS);
    const req = store.add({ ...request, id: Date.now() });
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getUserRequests = async (userId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REQUESTS], 'readonly');
    const store = transaction.objectStore(STORES.REQUESTS);
    const index = store.index('clientId');
    const request = index.getAll(parseInt(userId));
    
    request.onsuccess = () => {
      const requests = request.result.sort((a, b) => b.id - a.id);
      resolve(requests);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllRequests = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REQUESTS], 'readonly');
    const store = transaction.objectStore(STORES.REQUESTS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const requests = request.result.sort((a, b) => b.id - a.id);
      resolve(requests);
    };
    request.onerror = () => reject(request.error);
  });
};

export const updateRequestStatus = async (requestId, status, statusText, cancelReason = null) => {
  const db = await openDB();
  const request = await getRequestById(requestId);
  
  if (!request) return null;
  
  request.status = status;
  request.statusText = statusText;
  if (cancelReason) request.cancelReason = cancelReason;
  if (status === 'completed') request.completedDate = new Date().toISOString();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REQUESTS], 'readwrite');
    const store = transaction.objectStore(STORES.REQUESTS);
    const req = store.put(request);
    
    req.onsuccess = () => resolve(request);
    req.onerror = () => reject(req.error);
  });
};

export const getRequestById = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REQUESTS], 'readonly');
    const store = transaction.objectStore(STORES.REQUESTS);
    const request = store.get(parseInt(id));
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteRequest = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REQUESTS], 'readwrite');
    const store = transaction.objectStore(STORES.REQUESTS);
    const request = store.delete(parseInt(id));
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// ----- УСЛУГИ -----
export const addService = async (db, service) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SERVICES], 'readwrite');
    const store = transaction.objectStore(STORES.SERVICES);
    const request = store.add(service);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllServices = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SERVICES], 'readonly');
    const store = transaction.objectStore(STORES.SERVICES);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteService = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SERVICES], 'readwrite');
    const store = transaction.objectStore(STORES.SERVICES);
    const request = store.delete(parseInt(id));
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// ----- МАСТЕРА -----
export const addMaster = async (db, master) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MASTERS], 'readwrite');
    const store = transaction.objectStore(STORES.MASTERS);
    const request = store.add(master);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllMasters = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MASTERS], 'readonly');
    const store = transaction.objectStore(STORES.MASTERS);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteMaster = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MASTERS], 'readwrite');
    const store = transaction.objectStore(STORES.MASTERS);
    const request = store.delete(parseInt(id));
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// ----- УВЕДОМЛЕНИЯ -----
export const addNotification = async (notification) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.NOTIFICATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.NOTIFICATIONS);
    const req = store.add({ ...notification, id: Date.now(), date: new Date().toISOString(), isRead: false });
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getUserNotifications = async (userId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.NOTIFICATIONS], 'readonly');
    const store = transaction.objectStore(STORES.NOTIFICATIONS);
    const index = store.index('userId');
    const request = index.getAll(parseInt(userId));
    
    request.onsuccess = () => {
      const notifications = request.result.sort((a, b) => b.id - a.id);
      resolve(notifications);
    };
    request.onerror = () => reject(request.error);
  });
};

export const markNotificationAsRead = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.NOTIFICATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.NOTIFICATIONS);
    const getRequest = store.get(parseInt(id));
    
    getRequest.onsuccess = () => {
      const notification = getRequest.result;
      if (notification) {
        notification.isRead = true;
        const putRequest = store.put(notification);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve(false);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};