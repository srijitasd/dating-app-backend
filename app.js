const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");

require("./src/config/mongo.db");
require("./src/config/redis.db");

const authRoutes = require("./src/api/routes/auth.route");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Load Swagger API documentation
const swaggerDocument = require("./swagger/api.json");

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
