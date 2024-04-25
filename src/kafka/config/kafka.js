const { Kafka } = require("kafkajs");

const kafkaInstance = new Kafka({
  clientId: "rider-app",
  brokers: ["kafka:9092"],
});

module.exports = { kafkaInstance };
