const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const defaultDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'users_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function createPool(config = defaultDbConfig) {
  return mysql.createPool(config);
}

function createApp(databasePool) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/users', async (_req, res) => {
    try {
      const [rows] = await databasePool.query(
        'SELECT id, username, email, first_name, last_name, is_active, created_at FROM users ORDER BY id ASC'
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const [rows] = await databasePool.query(
        'SELECT id, username, email, first_name, last_name, is_active, created_at FROM users WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    const { username, email, password_hash, first_name, last_name } = req.body;

    if (!username || !email || !password_hash) {
      return res.status(400).json({ error: 'username, email, and password_hash are required' });
    }

    try {
      await databasePool.query(
        'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [username, email, password_hash, first_name || null, last_name || null]
      );

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    const { first_name, last_name, email, is_active } = req.body;

    try {
      const [result] = await databasePool.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, is_active = ? WHERE id = ?',
        [first_name ?? null, last_name ?? null, email ?? null, is_active ?? true, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const [result] = await databasePool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  return app;
}

async function startServer() {
  const pool = await createPool();
  const app = createApp(pool);
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Users API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = { createApp, createPool };
