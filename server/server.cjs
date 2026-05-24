// server/server.cjs
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initializeDatabase, getDb } = require('./database.cjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Маршруты
const authRoutes = require('./routes/auth.cjs');
const requestRoutes = require('./routes/requests.cjs');
const serviceRoutes = require('./routes/services.cjs');
const masterRoutes = require('./routes/masters.cjs');
const userRoutes = require('./routes/users.cjs');
const notificationRoutes = require('./routes/notifications.cjs');

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Запуск сервера
async function startServer() {
  await initializeDatabase();
  console.log('✅ База данных SQLite инициализирована');
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 API доступен по адресу http://localhost:${PORT}/api`);
  });
}

startServer();