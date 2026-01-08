const { Kafka } = require('kafkajs'); // Kafka client library for consuming messages from Kafka topics
const logger = require('./config/logger'); // logger for tracking CDC events and errors

const kafka = new Kafka({
  // creates Kafka client instance
  clientId: 'cdc-consumer', // identifies this application to the Kafka cluster
  brokers: [process.env.KAFKA_BROKER || 'kafka:29092'], // Kafka broker addresses to connect to
});

const consumer = kafka.consumer({ groupId: 'cdc-group' }); // creates consumer instance with group ID for coordinated consumption

const run = async () => {
  // main function that sets up and runs the Kafka consumer
  await consumer.connect(); // establishes connection to Kafka cluster
  logger.info('Kafka consumer connected'); // logs successful connection

  await consumer.subscribe({ topic: 'tidb-cdc', fromBeginning: true }); // subscribes to CDC topic and reads from the earliest available message

  await consumer.run({
    // starts consuming messages from the subscribed topic
    eachMessage: async ({ topic, partition, message }) => {
      // callback function executed for each received message
      try {
        const value = message.value.toString(); // converts message buffer to string
        const cdcEvent = JSON.parse(value); // parses JSON string into object

        if (cdcEvent.data && cdcEvent.data.length > 0) {
          // checks if CDC event contains data changes
          cdcEvent.data.forEach((change) => {
            // iterates through each database change in the event
            const logEntry = {
              // constructs structured log entry for the database change
              timestamp: new Date().toISOString(), // records when the change was processed
              source: 'CDC', // marks this as a Change Data Capture event
              database: cdcEvent.database || 'taskmanager', // database where the change occurred
              table: cdcEvent.table, // table that was modified
              operation: cdcEvent.type, // type of operation: INSERT, UPDATE, or DELETE
              data: change, // actual data that changed
              kafka_topic: topic, // Kafka topic the message came from
              kafka_partition: partition, // partition number within the topic
              kafka_offset: message.offset, // message position in the partition
            };

            logger.info(JSON.stringify(logEntry)); // logs the structured change event as JSON
          });
        }
      } catch (error) {
        logger.error('Error processing CDC message:', error.message); // logs any errors during message processing
      }
    },
  });
};

run().catch((error) => {
  // starts the consumer and handles any startup errors
  logger.error('Kafka consumer error:', error); // logs critical errors
  process.exit(1); // exits process with error code
});

process.on('SIGTERM', async () => {
  // listens for termination signal for graceful shutdown
  await consumer.disconnect(); // cleanly closes Kafka connection
  process.exit(0); // exits process successfully
});
