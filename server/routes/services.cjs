// server/routes/services.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../database.cjs');

// Получить все услуги
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const services = await db.all('SELECT * FROM services ORDER BY id');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить услугу
router.post('/', async (req, res) => {
  const db = getDb();
  const { name, price, categoryId, duration, icon, description } = req.body;

  try {
    const result = await db.run(`
      INSERT INTO services (name, price, category_id, duration, icon, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, price, categoryId || 1, duration || '2-3 дня', icon || '✨', description || 'Новая услуга']);

    const newService = await db.get('SELECT * FROM services WHERE id = ?', [result.lastID]);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить услугу
router.delete('/:id', async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    await db.run('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Услуга удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;