const { kafkaInstance } = require("./config/kafka");

async function init() {
  const admin = kafkaInstance.admin();
  console.log("Admin connecting..........");
  await admin.connect();
  console.log("Admin connected..........");

  console.log("creating topic.......");
  await admin.createTopics({
    topics: [
      {
        topic: "swipe-updates",
        numPartitions: 2,
      },
    ],
  });
  console.log("topic created.......");

  await admin.disconnect();
  console.log("admin disconnected.........");
}

init();
