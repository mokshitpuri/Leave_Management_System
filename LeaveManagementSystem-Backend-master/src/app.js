require("dotenv").config();
const express = require("express");
const router = require("./routers/index");
const cors = require("cors");

const port = 3000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);
app.options("*", cors());

app.use("/", router);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke in the server");
});

app.listen(port, () => {
  console.log("server is running on port", port);
});