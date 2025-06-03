require("dotenv").config();
const express = require("express");
const cors = require("cors");

const reportRouter = require("./routers/reportRouter"); // Report router

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3001", // React frontend URL
  })
);

app.options("*", cors());

// Mount report router at /api/report
app.use("/api/report", reportRouter);

// Basic error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke in the server");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
