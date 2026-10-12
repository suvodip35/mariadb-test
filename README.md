# MariaDB Users App

A small users application using Express.js and MariaDB.

## What it includes

- MariaDB in Docker Compose
- A `users` table with sample data
- Express REST API for CRUD operations
- Environment configuration

## Quick start

1. Start MariaDB:

```bash
docker-compose up -d
```

2. Install Node dependencies:

```bash
npm install
```

3. Copy the sample environment file:

```bash
cp .env.example .env
```

4. Start the app:

```bash
npm start
```

The server runs on `http://localhost:3000`.

## API endpoints

- `GET /health`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Example payload

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password_hash": "hashed_password_here",
  "first_name": "Alice",
  "last_name": "Wonderland"
}
```

## Default MariaDB config

- Database: `users_db`
- User: `appuser`
- Password: `apppassword`
- Root password: `rootpassword`

## Stop services

```bash
docker-compose down
```
