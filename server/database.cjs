// server/database.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

let db;

async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Создание таблиц
  await db.exec(`
    -- Пользователи
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fio TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT DEFAULT '👤',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Категории услуг
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    -- Услуги
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      category_id INTEGER DEFAULT 1,
      duration TEXT DEFAULT '2-3 дня',
      popular BOOLEAN DEFAULT 0,
      icon TEXT DEFAULT '✨',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Мастера
    CREATE TABLE IF NOT EXISTS masters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      experience INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 0,
      avatar TEXT DEFAULT '👨‍🔧',
      phone TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Заявки
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      client_address TEXT NOT NULL,
      service_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      service_price INTEGER NOT NULL,
      master_id INTEGER,
      master_name TEXT,
      delivery_date DATE NOT NULL,
      delivery_time TIME NOT NULL,
      comments TEXT,
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      status_text TEXT DEFAULT 'На рассмотрении',
      cancel_reason TEXT,
      completed_date DATETIME,
      FOREIGN KEY (client_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (master_id) REFERENCES masters(id)
    );

    -- Уведомления
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Отзывы
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      text TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      avatar TEXT DEFAULT '👤',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Вставка начальных данных
  await insertInitialData();

  return db;
}

async function insertInitialData() {
  // Проверяем, есть ли уже данные
  const adminExists = await db.get('SELECT * FROM users WHERE login = ?', 'adminka');
  
  if (!adminExists) {
    // Хешируем пароль администратора
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Добавляем администратора
    await db.run(`
      INSERT INTO users (fio, phone, email, login, password, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, 'Администратор Системы', '+7 (999) 000-00-00', 'admin@lilia.ru', 'adminka', hashedPassword, 'admin', '👑');

    // Добавляем тестовых пользователей
    const testUsers = [
      { fio: 'Иванов Иван Иванович', phone: '+7 (999) 111-22-33', email: 'ivan@example.com', login: 'ivan', password: '123456', avatar: '👨' },
      { fio: 'Петрова Анна Сергеевна', phone: '+7 (999) 222-33-44', email: 'anna@example.com', login: 'anna', password: '123456', avatar: '👩' },
      { fio: 'Сидоров Михаил Петрович', phone: '+7 (999) 333-44-55', email: 'mikhail@example.com', login: 'mikhail', password: '123456', avatar: '👨‍🦰' },
      { fio: 'Козлова Елена Дмитриевна', phone: '+7 (999) 444-55-66', email: 'elena@example.com', login: 'elena', password: '123456', avatar: '👩‍🦳' }
    ];

    for (const user of testUsers) {
      const hashedUserPassword = await bcrypt.hash(user.password, 10);
      await db.run(`
        INSERT INTO users (fio, phone, email, login, password, role, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, user.fio, user.phone, user.email, user.login, hashedUserPassword, 'user', user.avatar);
    }

    // Добавляем категории
    const categories = ['Химчистка одежды', 'Чистка обуви', 'Химчистка мебели'];
    for (const cat of categories) {
      await db.run('INSERT INTO categories (name) VALUES (?)', cat);
    }

    // Добавляем услуги
    const services = [
      { name: 'Химчистка одежды', price: 1500, categoryId: 1, duration: '2-3 дня', popular: 1, icon: '👕', description: 'Деликатная чистка любых тканей' },
      { name: 'Стирка белья', price: 800, categoryId: 1, duration: '1-2 дня', popular: 0, icon: '👔', description: 'Профессиональная стирка' },
      { name: 'Чистка обуви', price: 1000, categoryId: 2, duration: '1 день', popular: 1, icon: '👞', description: 'Восстановление обуви' },
      { name: 'Химчистка мебели', price: 3500, categoryId: 3, duration: '3-5 дней', popular: 0, icon: '🛋️', description: 'Глубокая чистка мебели' },
      { name: 'Чистка салона авто', price: 5000, categoryId: 3, duration: '2-4 дня', popular: 1, icon: '🚗', description: 'Химчистка салона' }
    ];

    for (const service of services) {
      await db.run(`
        INSERT INTO services (name, price, category_id, duration, popular, icon, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, service.name, service.price, service.categoryId, service.duration, service.popular, service.icon, service.description);
    }

    // Добавляем мастеров
    const masters = [
      { name: 'Иванов Иван', specialty: 'Химчистка одежды', experience: 5, rating: 4.8, reviews: 124, avatar: '👨‍🦰', phone: '+7 (999) 111-22-33' },
      { name: 'Петрова Анна', specialty: 'Чистка обуви', experience: 3, rating: 4.9, reviews: 89, avatar: '👩‍🦳', phone: '+7 (999) 222-33-44' },
      { name: 'Сидоров Михаил', specialty: 'Мебель и авто', experience: 8, rating: 5.0, reviews: 256, avatar: '👨‍🦲', phone: '+7 (999) 333-44-55' }
    ];

    for (const master of masters) {
      await db.run(`
        INSERT INTO masters (name, specialty, experience, rating, reviews, avatar, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, master.name, master.specialty, master.experience, master.rating, master.reviews, master.avatar, master.phone);
    }
  }
}

function getDb() {
  return db;
}

module.exports = { initializeDatabase, getDb };