const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../app');

function buildMockPool() {
  const users = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  return {
    async query(sql, params) {
      if (sql.includes('SELECT') && !sql.includes('WHERE')) {
        return [users];
      }

      if (sql.includes('WHERE id = ?')) {
        const id = Number(params[0]);
        const match = users.find((user) => user.id === id);
        return [match ? [match] : []];
      }

      if (sql.includes('INSERT')) {
        const [username, email, passwordHash, firstName, lastName] = params;
        const newUser = {
          id: users.length + 1,
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password_hash: passwordHash,
          is_active: true,
        };
        users.push(newUser);
        return [{ insertId: newUser.id }];
      }

      if (sql.includes('UPDATE')) {
        return [{ affectedRows: 1 }];
      }

      if (sql.includes('DELETE')) {
        return [{ affectedRows: 1 }];
      }

      return [[]];
    },
  };
}

test('GET /api/users returns user list', async () => {
  const app = createApp(buildMockPool());
  const response = await request(app).get('/api/users');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.equal(response.body[0].username, 'john_doe');
});

test('POST /api/users creates a user', async () => {
  const app = createApp(buildMockPool());
  const response = await request(app)
    .post('/api/users')
    .send({
      username: 'alice',
      email: 'alice@example.com',
      password_hash: 'hash123',
      first_name: 'Alice',
      last_name: 'Wonderland',
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.message, 'User created successfully');
});

test('POST /api/users validates required fields', async () => {
  const app = createApp(buildMockPool());
  const response = await request(app).post('/api/users').send({ username: 'alice' });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /required/);
});

test('GET / serves the frontend HTML', async () => {
  const app = createApp(buildMockPool());
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
  assert.match(response.text, /User Directory/);
});
