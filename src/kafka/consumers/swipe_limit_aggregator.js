const { kafkaInstance } = require("../config/kafka");

const redisClient = require("../../config/redis.db");
const {
  swipe_limit_store,
} = require("../../constants/redis/naming_convention.redis");

const BATCH_SIZE = 100; // Maximum number of messages to process in a batch
let batch = [];
let batchTimeout = null;

// Function to process batches of swipes
async function processBatch() {
  console.log(`Processing batch of ${batch.length} swipes`);
  const pipeline = redisClient.pipeline();

  batch.forEach((swipe) => {
    pipeline.incr(swipe_limit_store(swipe.id));
  });

  // Execute all commands in the pipeline
  const results = await pipeline.exec();
  console.log("Batch processed:", results);

  // Clear the current batch
  batch = [];
}

// Function to add swipes to the batch and set a timeout for processing
function addToBatch(message) {
  const swipe = JSON.parse(message.value.toString());
  batch.push(swipe);

  if (batch.length >= BATCH_SIZE) {
    clearTimeout(batchTimeout);
    processBatch();
  } else if (!batchTimeout) {
    // Set a timeout to process the batch if not already set
    batchTimeout = setTimeout(() => {
      processBatch();
      batchTimeout = null;
    }, 5000); // Process the batch after 5 seconds of inactivity
  }
}

async function init() {
  const consumer = kafkaInstance.consumer({ groupId: "consumer-group-2" });
  console.log("consumer connecting..........");
  await consumer.connect();
  console.log("consumer connected..........");

  console.log("consumer subscribed..........");
  await consumer.subscribe({ topic: "swipe-updates", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      addToBatch(message);
    },
  });
  console.log("message received..........");
}

init().catch(console.error);
