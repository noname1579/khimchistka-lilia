// server/routes/auth.cjs
const express = require('express');
const router = express.Router();
const { getDb } = require('../database.cjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'khimchistka_lilia_secret_key_2024';

// Регистрация
router.post('/register', async (req, res) => {
  const { fio, phone, email, login, password } = req.body;
  const db = getDb();

  try {
    const existingUser = await db.get(
      'SELECT * FROM users WHERE login = ? OR email = ? OR phone = ?',
      [login, email, phone]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с такими данными уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users (fio, phone, email, login, password, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fio, phone, email, login, hashedPassword, 'user', '👤']
    );

    res.status(201).json({ 
      id: result.lastID,
      message: 'Регистрация успешна' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  const db = getDb();

  try {
    const user = await db.get('SELECT * FROM users WHERE login = ?', [login]);

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fio: user.fio,
        login: user.login,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;