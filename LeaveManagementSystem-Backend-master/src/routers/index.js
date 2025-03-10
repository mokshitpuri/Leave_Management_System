const express = require("express");
const authRouter = require("./authRouter");
const adminRouter = require("./adminRouter");
const userRouter = require("./userRouter");
const leaveRouter = require("./leaveRouter");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send("Health Check");
});
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/leave", leaveRouter);

module.exports = router;
