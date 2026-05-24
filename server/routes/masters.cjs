// server/routes/masters.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../database.cjs');

// Получить всех мастеров
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const masters = await db.all('SELECT * FROM masters WHERE status = "active" ORDER BY id');
    res.json(masters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить мастера
router.post('/', async (req, res) => {
  const db = getDb();
  const { name, specialty, experience, phone } = req.body;

  try {
    const result = await db.run(`
      INSERT INTO masters (name, specialty, experience, phone, avatar)
      VALUES (?, ?, ?, ?, ?)
    `, [name, specialty, experience || 0, phone || '', '👨‍🔧']);

    const newMaster = await db.get('SELECT * FROM masters WHERE id = ?', [result.lastID]);
    res.status(201).json(newMaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить мастера
router.delete('/:id', async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    await db.run('UPDATE masters SET status = "inactive" WHERE id = ?', [id]);
    res.json({ message: 'Мастер удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;