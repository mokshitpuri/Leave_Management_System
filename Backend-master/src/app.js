require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routers/index");  // Adjust if necessary
const reportRouter = require('./routers/reportRouter'); // Import the reportRouter

const app = express();

// Middleware setup
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001", // Ensure your frontend URL is correct (React app is running on port 3001)
  })
);
app.options("*", cors());

// Set up the reportRouter under /api/report
app.use('/api/report', reportRouter);  // Attach the reportRouter here

// Set up other routes (if any)
app.use("/", router);  // Adjust if needed

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke in the server");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
