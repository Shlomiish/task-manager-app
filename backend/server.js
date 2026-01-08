const express = require('express'); // framework for building the web server and handling HTTP requests
const cors = require('cors'); // middleware that allows the frontend to make requests to this backend from a different origin
const db = require('./config/db'); // database connection pool for executing MySQL queries
const authRoutes = require('./routes/auth'); // routes handling user registration and login
const taskRoutes = require('./routes/tasks'); // routes handling task CRUD operations
const logger = require('./config/logger'); // winston logger for tracking server events and errors

const app = express();
const PORT = 3001; // port number where the server listens for incoming requests

app.use(cors()); // allows requests from any origin, necessary for frontend-backend communication
app.use(express.json()); // automatically parses JSON request bodies and makes data available in req.body

app.get('/health', (req, res) => {
  // simple endpoint to check if server is alive and responding
  res.json({ status: 'ok', message: 'Server is running' }); // returns JSON confirming server status
});

app.get('/db-test', async (req, res) => {
  // endpoint to verify database connectivity
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result'); // executes a basic query to test the connection
    res.json({ status: 'ok', message: 'Database connected', result: rows[0].result }); // returns success with query result
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message }); // returns error details if connection fails
  }
});

app.use('/api/auth', authRoutes); // all routes defined in authRoutes are accessible under /api/auth prefix
app.use('/api/tasks', taskRoutes); // all routes defined in taskRoutes are accessible under /api/tasks prefix

app.listen(PORT, () => {
  // starts the server and binds it to the specified port
  logger.info(`Server running on port ${PORT}`); // logs a message when server successfully starts
});
