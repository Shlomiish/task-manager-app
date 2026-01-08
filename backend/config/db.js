const mysql = require('mysql2/promise'); // imports mysql2 with promise support for async/await syntax

const pool = mysql.createPool({
  // creates a pool that reuses connections instead of opening a new one for each query
  host: process.env.DB_HOST || 'localhost', // server address where MySQL is running
  port: process.env.DB_PORT || 4000, // port MySQL is listening on
  user: process.env.DB_USER || 'root', // MySQL username for authentication
  password: process.env.DB_PASSWORD || '', // MySQL password for authentication
  database: process.env.DB_NAME || 'taskmanager', // specific database to connect to
  waitForConnections: true, // queues requests when all connections are in use instead of immediately failing
  connectionLimit: 10, // maximum number of simultaneous connections the pool can maintain
  queueLimit: 0, // unlimited queue size for pending connection requests
});

module.exports = pool;
