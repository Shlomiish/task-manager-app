// import express to create router for authentication routes
const express = require('express');
// import bcryptjs to hash and compare passwords securely
const bcrypt = require('bcryptjs');
// import jsonwebtoken to generate authentication tokens
const jwt = require('jsonwebtoken');
// import uuid to generate unique user ids
const { v4: uuidv4 } = require('uuid');
// import my database connection pool
const db = require('../config/db');
// import my logger to log authentication events
const logger = require('../config/logger');

// create a new router instance for authentication routes
const router = express.Router();

// Register endpoint
// handle user registration - POST /register
router.post('/register', async (req, res) => {
  try {
    // extract email and password from request body
    const { email, password } = req.body;

    // validate that both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    // query database to check if user with this email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // if user exists, return error
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    // hash the password with bcrypt using 10 salt rounds for security
    const hashedPassword = await bcrypt.hash(password, 10);
    // generate a unique user id
    const userId = uuidv4();

    // Insert user
    // insert the new user into the database with hashed password
    await db.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [
      userId,
      email,
      hashedPassword,
    ]);

    // log the successful registration with user details and timestamp
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'USER_REGISTERED',
        userId: userId,
        email: email,
        ip: req.ip,
      })
    );

    // return success response with user id
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    // log any errors that occur during registration
    logger.error('Register error:', error.message);
    // return error response
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
// handle user login - POST /login
router.post('/login', async (req, res) => {
  try {
    // extract email and password from request body
    const { email, password } = req.body;

    // validate that both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    // query database to find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    // if no user found, return invalid credentials error
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // get the first (and only) user from results
    const user = users[0];

    // Verify password
    // compare provided password with hashed password in database
    const isValid = await bcrypt.compare(password, user.password);

    // if password doesn't match, return invalid credentials error
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    // create JWT token with user info that expires in 24 hours
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Log login activity
    // log successful login with user details and timestamp
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'USER_LOGIN',
        userId: user.id,
        email: user.email,
        ip: req.ip,
      })
    );

    // return token and user info to client
    res.json({ token, userId: user.id, email: user.email });
  } catch (error) {
    // log any errors that occur during login
    logger.error('Login error:', error.message);
    // return error response
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
