const redisClient = require("../../config/redis.db");
const {
  potential_matches_store,
  swipe_limit_store,
} = require("../../constants/redis/naming_convention.redis");

const { kafkaInstance } = require("../../kafka/config/kafka");

const { Swipe } = require("../model/mongodb/swipes.model");
const { User } = require("../model/mongodb/user.model");

exports.swipeService = async (data) => {
  let producer;
  try {
    const { swiperId, swipedId, action } = data;

    const dailyLimit = await redisClient.get(swipe_limit_store(swipedId));
    if (!dailyLimit) {
      await redisClient.set(swipe_limit_store(swipedId), 1, {
        EX: 60 * 60 * 24, // Set an expiry, e.g., 1 day in seconds
        NX: true, // Set only if the key does not exist
      });
    } else if (dailyLimit >= 30) {
      throw {
        message: "Daily limit reached",
      };
    }

    if (!isMatch) {
      producer = kafkaInstance.producer();
      console.log("producer connecting..........");
      await producer.connect();
      console.log("producer connected..........");

      console.log("sending message..........");

      const newSwipe = new Swipe({ swiperId, swipedId, action });

      await producer.send({
        topic: "swipe-updates",
        messages: [
          {
            partition: action == "like" ? 0 : 1,
            key: "swipe-update",
            value: JSON.stringify({ ...newSwipe, matched: false }),
          },
        ],
      });
      console.log("message sent..........");
    } else {
      producer = kafkaInstance.producer();
      console.log("producer connecting..........");
      await producer.connect();
      console.log("producer connected..........");

      console.log("sending message..........");

      const newSwipe = new Swipe({ swiperId, swipedId, action });

      await producer.send({
        topic: "swipe-updates",
        messages: [
          {
            partition: action == "like" ? 0 : 1,
            key: "swipe-update",
            value: JSON.stringify({ ...newSwipe, matched: true }),
          },
        ],
      });
      console.log("message sent..........");
    }

    return {
      matched: isMatch ? true : false,
    };
  } catch (error) {
    throw error;
  } finally {
    await producer.disconnect();
    console.log("producer disconnected.........");
  }
};
