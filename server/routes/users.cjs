// server/routes/users.cjs
const express = require('express');
const router = express.Router();
const { getDb } = require('../database.cjs');

// Получить всех пользователей
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const users = await db.all(`
      SELECT id, fio, phone, email, login, role, avatar, created_at 
      FROM users 
      WHERE role != 'admin'
      ORDER BY id
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить пользователя по ID
router.get('/:id', async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    const user = await db.get(`
      SELECT id, fio, phone, email, login, role, avatar, created_at 
      FROM users 
      WHERE id = ?
    `, [id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить пользователя
router.delete('/:id', async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    await db.run('DELETE FROM requests WHERE client_id = ?', [id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;