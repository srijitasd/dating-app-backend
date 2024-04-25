const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");

require("./src/config/mongo.db");
require("./src/config/redis.db");

const authRoutes = require("./src/api/routes/auth.route");
const profileRoutes = require("./src/api/routes/profile.route");
const matcherRoutes = require("./src/api/routes/matcher.route");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Load Swagger API documentation
const swaggerDocument = require("./swagger/api.json");

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/matcher", matcherRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
