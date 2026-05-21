// src/utils/initData.js

// Предустановленные пользователи
export const defaultUsers = [
  {
    id: 1,
    fio: 'Иванов Иван Иванович',
    phone: '+7 (999) 111-22-33',
    email: 'ivan@example.com',
    login: 'ivan',
    password: '123456',
    role: 'user',
    avatar: '👨',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    fio: 'Петрова Анна Сергеевна',
    phone: '+7 (999) 222-33-44',
    email: 'anna@example.com',
    login: 'anna',
    password: '123456',
    role: 'user',
    avatar: '👩',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    fio: 'Сидоров Михаил Петрович',
    phone: '+7 (999) 333-44-55',
    email: 'mikhail@example.com',
    login: 'mikhail',
    password: '123456',
    role: 'user',
    avatar: '👨‍🦰',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    fio: 'Козлова Елена Дмитриевна',
    phone: '+7 (999) 444-55-66',
    email: 'elena@example.com',
    login: 'elena',
    password: '123456',
    role: 'user',
    avatar: '👩‍🦳',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    fio: 'Морозов Дмитрий Алексеевич',
    phone: '+7 (999) 555-66-77',
    email: 'dmitry@example.com',
    login: 'dmitry',
    password: '123456',
    role: 'user',
    avatar: '👨‍🦱',
    createdAt: new Date().toISOString()
  }
];

// Администратор
export const defaultAdmin = {
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

// Предустановленные услуги
export const defaultServices = [
  { id: 1, name: 'Химчистка одежды', price: 1500, categoryId: 1, duration: '2-3 дня', popular: true, icon: '👕', description: 'Деликатная чистка любых тканей' },
  { id: 2, name: 'Стирка белья', price: 800, categoryId: 1, duration: '1-2 дня', popular: false, icon: '👔', description: 'Профессиональная стирка' },
  { id: 3, name: 'Чистка обуви', price: 1000, categoryId: 2, duration: '1 день', popular: true, icon: '👞', description: 'Восстановление обуви' },
  { id: 4, name: 'Химчистка мебели', price: 3500, categoryId: 3, duration: '3-5 дней', popular: false, icon: '🛋️', description: 'Глубокая чистка мебели' },
  { id: 5, name: 'Чистка салона авто', price: 5000, categoryId: 3, duration: '2-4 дня', popular: true, icon: '🚗', description: 'Химчистка салона' },
  { id: 6, name: 'Химчистка пуховиков', price: 2000, categoryId: 1, duration: '2-3 дня', popular: true, icon: '🧥', description: 'Особая забота о пухе' },
  { id: 7, name: 'Выведение пятен', price: 500, categoryId: 1, duration: '1 день', popular: false, icon: '✨', description: 'Любые виды пятен' },
  { id: 8, name: 'Глажка', price: 300, categoryId: 1, duration: '1 день', popular: false, icon: '👔', description: 'Профессиональная глажка' }
];

// Предустановленные мастера
export const defaultMasters = [
  { id: 1, name: 'Иванов Иван Иванович', specialty: 'Химчистка одежды', experience: 5, rating: 4.8, reviews: 124, avatar: '👨‍🦰', phone: '+7 (999) 111-22-33', status: 'active' },
  { id: 2, name: 'Петрова Анна Сергеевна', specialty: 'Чистка обуви', experience: 3, rating: 4.9, reviews: 89, avatar: '👩‍🦳', phone: '+7 (999) 222-33-44', status: 'active' },
  { id: 3, name: 'Сидоров Михаил Петрович', specialty: 'Мебель и авто', experience: 8, rating: 5.0, reviews: 256, avatar: '👨‍🦲', phone: '+7 (999) 333-44-55', status: 'active' },
  { id: 4, name: 'Козлова Елена Дмитриевна', specialty: 'Деликатные ткани', experience: 6, rating: 4.9, reviews: 178, avatar: '👩‍🦱', phone: '+7 (999) 444-55-66', status: 'active' }
];

// Предустановленные заявки
export const defaultRequests = [
  {
    id: 1001,
    clientId: 1,
    clientName: 'Иванов Иван Иванович',
    clientPhone: '+7 (999) 111-22-33',
    clientEmail: 'ivan@example.com',
    clientAddress: 'г. Москва, ул. Ленина, д. 10, кв. 5',
    serviceId: 1,
    serviceName: 'Химчистка одежды',
    servicePrice: 1500,
    masterId: 1,
    masterName: 'Иванов Иван Иванович',
    deliveryDate: '2024-12-20',
    deliveryTime: '10:00',
    comments: 'Пожалуйста, аккуратно с пуговицами',
    requestDate: '2024-12-15T10:00:00.000Z',
    total: 1500,
    status: 'completed',
    statusText: 'Выполнена',
    completedDate: '2024-12-18T15:00:00.000Z'
  },
  {
    id: 1002,
    clientId: 2,
    clientName: 'Петрова Анна Сергеевна',
    clientPhone: '+7 (999) 222-33-44',
    clientEmail: 'anna@example.com',
    clientAddress: 'г. Москва, ул. Пушкина, д. 25',
    serviceId: 3,
    serviceName: 'Чистка обуви',
    servicePrice: 1000,
    masterId: 2,
    masterName: 'Петрова Анна Сергеевна',
    deliveryDate: '2024-12-18',
    deliveryTime: '14:00',
    comments: '2 пары зимних ботинок',
    requestDate: '2024-12-16T12:00:00.000Z',
    total: 2000,
    status: 'in_progress',
    statusText: 'В работе'
  },
  {
    id: 1003,
    clientId: 3,
    clientName: 'Сидоров Михаил Петрович',
    clientPhone: '+7 (999) 333-44-55',
    clientEmail: 'mikhail@example.com',
    clientAddress: 'г. Москва, ул. Гагарина, д. 5',
    serviceId: 4,
    serviceName: 'Химчистка мебели',
    servicePrice: 3500,
    masterId: 3,
    masterName: 'Сидоров Михаил Петрович',
    deliveryDate: '2024-12-22',
    deliveryTime: '11:00',
    comments: 'Диван и два кресла',
    requestDate: '2024-12-17T09:00:00.000Z',
    total: 3500,
    status: 'confirmed',
    statusText: 'Подтверждена'
  },
  {
    id: 1004,
    clientId: 1,
    clientName: 'Иванов Иван Иванович',
    clientPhone: '+7 (999) 111-22-33',
    clientEmail: 'ivan@example.com',
    clientAddress: 'г. Москва, ул. Ленина, д. 10, кв. 5',
    serviceId: 5,
    serviceName: 'Чистка салона авто',
    servicePrice: 5000,
    masterId: 3,
    masterName: 'Сидоров Михаил Петрович',
    deliveryDate: '2024-12-25',
    deliveryTime: '09:00',
    comments: 'Toyota Camry, полная чистка',
    requestDate: '2024-12-18T14:30:00.000Z',
    total: 5000,
    status: 'pending',
    statusText: 'На рассмотрении'
  },
  {
    id: 1005,
    clientId: 4,
    clientName: 'Козлова Елена Дмитриевна',
    clientPhone: '+7 (999) 444-55-66',
    clientEmail: 'elena@example.com',
    clientAddress: 'г. Москва, ул. Чехова, д. 15',
    serviceId: 6,
    serviceName: 'Химчистка пуховиков',
    servicePrice: 2000,
    masterId: 4,
    masterName: 'Козлова Елена Дмитриевна',
    deliveryDate: '2024-12-21',
    deliveryTime: '15:00',
    comments: '2 пуховика белого цвета',
    requestDate: '2024-12-17T16:20:00.000Z',
    total: 4000,
    status: 'in_progress',
    statusText: 'В работе'
  }
];

// Функция инициализации данных
export const initializeData = () => {
  // Инициализация пользователей (включая админа)
  if (!localStorage.getItem('users')) {
    const allUsers = [defaultAdmin, ...defaultUsers];
    localStorage.setItem('users', JSON.stringify(allUsers));
  }

  // Инициализация услуг
  if (!localStorage.getItem('services')) {
    localStorage.setItem('services', JSON.stringify(defaultServices));
  }

  // Инициализация мастеров
  if (!localStorage.getItem('masters')) {
    localStorage.setItem('masters', JSON.stringify(defaultMasters));
  }

  // Инициализация заявок
  if (!localStorage.getItem('requests')) {
    localStorage.setItem('requests', JSON.stringify(defaultRequests));
  }

  // Инициализация уведомлений
  if (!localStorage.getItem('notifications')) {
    localStorage.setItem('notifications', JSON.stringify([]));
  }
};