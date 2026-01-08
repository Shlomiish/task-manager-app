const log4js = require('log4js'); // logging library for tracking application events and errors

log4js.configure({
  // sets up the logging configuration
  appenders: {
    // defines output destinations for logs
    console: { type: 'console' }, // sends log messages to the console/terminal
  },
  categories: {
    // defines logging rules for different parts of the application
    default: { appenders: ['console'], level: 'info' }, // uses console appender and logs messages at 'info' level and above
  },
});

const logger = log4js.getLogger(); // creates a logger instance for use throughout the application

module.exports = logger;
