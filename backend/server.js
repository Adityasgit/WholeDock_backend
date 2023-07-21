const path = require("path");
const app = require("./app");
const dotenv = require("dotenv");
const connect = require("./config/database");

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaughtException`);
  process.exit(1);
});

// Config
dotenv.config({ path: "backend/config/config.env" });

// Connect to DataBase
connect();

const server = app.listen(process.env.PORT, () => {
  console.log(`server is listening on http://localhost:${process.env.PORT}`);
});

// Uhandeled Promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
