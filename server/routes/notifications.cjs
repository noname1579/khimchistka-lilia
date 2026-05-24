// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../database.cjs');

// Получить уведомления пользователя
router.get('/user/:userId', async (req, res) => {
  const db = getDb();
  const { userId } = req.params;

  try {
    const notifications = await db.all(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY id DESC
    `, [userId]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить уведомление
router.post('/', async (req, res) => {
  const db = getDb();
  const { userId, title, message, type } = req.body;

  try {
    const result = await db.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [userId, title, message, type || 'info']);

    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отметить как прочитанное
router.put('/:id/read', async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'Уведомление отмечено как прочитанное' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;