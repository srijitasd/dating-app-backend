const { Kafka } = require("kafkajs");

const kafkaInstance = new Kafka({
  clientId: "rider-app",
  brokers: ["192.168.0.124:9092"],
});

module.exports = { kafkaInstance };
