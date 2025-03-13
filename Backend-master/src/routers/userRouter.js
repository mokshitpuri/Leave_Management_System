const { PrismaClient } = require("@prisma/client");
const express = require("express");
const authenticate = require("../middlewares/authentication");
const getUserInfo = require("../middlewares/getUserInfo");
const userRouter = express.Router();

const prisma = new PrismaClient();

userRouter.get("/loggedInUser", authenticate, getUserInfo, async (req, res) => {
  res.status(200).json(req.userInfo);
});

module.exports = userRouter;
