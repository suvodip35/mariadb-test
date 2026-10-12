-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('john_doe', 'john@example.com', '$2y$10$aFfK9wFhB2WzXc2aN5k2rOtx9pYV8qw7n2Yg0n1E6N0YxTj1XJ5Py', 'John', 'Doe'),
('jane_smith', 'jane@example.com', '$2y$10$WvI0Wj9Gfgo1r9Ot5GJr0u7kR9gXBNWcQmQ0X.YU7Y2OQdI2GfAW', 'Jane', 'Smith'),
('bob_wilson', 'bob@example.com', '$2y$10$8mXrW8upE5KQv6uayt2o3eTnY7ZfNQJfLzNQbQ0c4vJNwQm8r1rG', 'Bob', 'Wilson')
ON DUPLICATE KEY UPDATE username = VALUES(username);
