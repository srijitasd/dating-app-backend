const Redis = require("ioredis");

const client = new Redis({
  password: process.env.REDIS_PASS,
  // socket: {
  host: process.env.REDIS_URI,
  port: process.env.REDIS_PORT,
  // },
});
// client.connect().then(() => console.log("Connected to Redis successfully"));

client.on("error", (err) => console.log("Redis Client Error", err));

module.exports = client;
