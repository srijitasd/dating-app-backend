const { Match } = require("../../api/model/mongodb/match.model");
const { Swipe } = require("../../api/model/mongodb/swipes.model");

const { kafkaInstance } = require("../config/kafka");

const redisClient = require("../../config/redis.db");
const {
  potential_matches_store,
} = require("../../constants/redis/naming_convention.redis");

const BATCH_SIZE = 100; // Number of events to collect before writing to DB
const BATCH_TIME = 5000; // Time in ms to wait before writing to DB

let swipeBatch = [];
let batchTimeout = null;

const processBatch = async () => {
  if (swipeBatch.length > 0) {
    try {
      await Swipe.insertMany(swipeBatch); // Bulk insert to MongoDB
      console.log(`Batch processed. Size: ${swipeBatch.length}`);
    } catch (error) {
      console.error("Error saving batch to MongoDB:", error);
    }
    swipeBatch = []; // Reset the batch
  }
  batchTimeout = setTimeout(processBatch, BATCH_TIME); // Reset the timer
};

async function processMatch(swipeEvent) {
  await Swipe.insertOne(swipeEvent);

  // Create a match entry
  const newMatch1 = new Match({
    userId: swipeEvent.swiperId,
    matchedUserId: swipeEvent.swipedId,
  });
  const newMatch2 = new Match({
    userId: swipeEvent.swipedId,
    matchedUserId: swipeEvent.swiperId,
  }); // Mutual

  // Use MongoDB's bulkWrite to efficiently insert both match records
  await Match.bulkWrite([
    { insertOne: { document: newMatch1 } },
    { insertOne: { document: newMatch2 } },
  ]);

  // Optionally, trigger any post-match actions (notifications, emails, etc.)
}

async function init() {
  const consumer = kafkaInstance.consumer({ groupId: "consumer-group-1" });
  console.log("consumer connecting..........");
  await consumer.connect();
  console.log("consumer connected..........");

  console.log("consumer subscribed..........");
  await consumer.subscribe({ topic: "swipe-updates", fromBeginning: true });

  batchTimeout = setTimeout(processBatch, BATCH_TIME); // Initialize batch processing timer

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const swipeEvent = JSON.parse(message.value.toString());

      if (!swipeEvent.matched) {
        swipeBatch.push(swipeEvent);
      } else {
        await processMatch(swipeEvent);
        await redisClient.sRem(potential_matches_store(swipeEvent.swiperId));
      }

      if (swipeBatch.length >= BATCH_SIZE) {
        clearTimeout(batchTimeout); // Clear the existing timer
        await processBatch(); // Process the current batch immediately
      }

      console.log(
        `[${topic}]: PARTITION:${partition}: ${message.value.toString()}`
      );
    },
  });
  console.log("message received..........");
}

init().catch(console.error);
