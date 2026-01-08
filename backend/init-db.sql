CREATE DATABASE IF NOT EXISTS taskmanager;

USE taskmanager;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create default user (email: admin@example.com, password: admin123)
INSERT INTO users (id, email, password) 
VALUES (
  'admin-id', 
  'admin@example.com', 
  '$2b$10$t7NdaOpMPONu8fJey7TLUOA/X2PL70BGRQjnbbGZyMkEEA5UrYvle'
) ON DUPLICATE KEY UPDATE email=email;