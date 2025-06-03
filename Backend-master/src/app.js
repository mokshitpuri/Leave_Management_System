require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routers/index"); // Main router

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// Register the main router
app.use("/", router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke in the server");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
