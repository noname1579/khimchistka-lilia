// server/routes/requests.cjs
const express = require('express');
const router = express.Router();
const { getDb } = require('../database.cjs');

// Получить все заявки
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const requests = await db.all(`
      SELECT r.*, u.fio as user_fio 
      FROM requests r
      LEFT JOIN users u ON r.client_id = u.id
      ORDER BY r.id DESC
    `);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заявки пользователя
router.get('/user/:userId', async (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  
  try {
    const requests = await db.all(
      'SELECT * FROM requests WHERE client_id = ? ORDER BY id DESC',
      [userId]
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать заявку
router.post('/', async (req, res) => {
  const db = getDb();
  const {
    clientId, clientName, clientPhone, clientEmail, clientAddress,
    serviceId, serviceName, servicePrice, masterId, masterName,
    deliveryDate, deliveryTime, comments, total
  } = req.body;

  try {
    const result = await db.run(`
      INSERT INTO requests (
        client_id, client_name, client_phone, client_email, client_address,
        service_id, service_name, service_price, master_id, master_name,
        delivery_date, delivery_time, comments, total, status, status_text, request_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientId, clientName, clientPhone, clientEmail, clientAddress,
      serviceId, serviceName, servicePrice, masterId, masterName,
      deliveryDate, deliveryTime, comments, total,
      'pending', 'На рассмотрении', new Date().toISOString()
    ]);

    res.status(201).json({ id: result.lastID, message: 'Заявка создана' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Обновить статус заявки
router.put('/:id/status', async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status, statusText, cancelReason } = req.body;

  try {
    await db.run(`
      UPDATE requests 
      SET status = ?, status_text = ?, cancel_reason = ?, completed_date = ?
      WHERE id = ?
    `, [
      status, 
      statusText, 
      cancelReason || null,
      status === 'completed' ? new Date().toISOString() : null,
      id
    ]);

    res.json({ message: 'Статус обновлён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;