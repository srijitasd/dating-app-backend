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

    const isMatch = await redisClient.sIsMember(
      potential_matches_store(swiperId),
      swipedId
    );

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

exports.nearByUsersService = async (userId, query) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw {
        message: "user not found!",
      };
    }

    const preferences = currentUser.preferences;
    // Use aggregation to exclude users already swiped on
    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: currentUser.location.coordinates,
          },
          distanceField: "dist.calculated",
          maxDistance:
            preferences.maxDistance.unit == "mi"
              ? preferences.maxDistance.value * 1609.34
              : preferences.maxDistance.value * 1000,
          spherical: true,
        },
      },
      {
        $skip: query.limit * query.offset,
      },
      {
        $limit: query.limit,
      },
      {
        $lookup: {
          from: "swipes",
          localField: "_id",
          foreignField: "swipedId",
          as: "swipes",
        },
      },
      {
        $match: {
          $and: [
            { _id: { $ne: currentUser._id } }, // Exclude current user
            {
              swipes: {
                $not: {
                  $elemMatch: { swiperId: mongoose.Types.ObjectId(userId) },
                },
              },
            }, // Exclude swiped users
          ],
        },
      },
      { $project: { swipes: 0 } }, // Optionally remove the swipes field from the output
    ]);

    return nearbyUsers;
  } catch (error) {
    throw error;
  }
};
