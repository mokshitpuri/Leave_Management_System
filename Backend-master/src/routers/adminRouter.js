const createUser = require("../functions/prismaFunction").createUser;
const express = require("express");
const adminRouter = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

adminRouter.post("/addUser", async (req, res) => {
  try {
    let { username, password, firstName, lastName, role } = req.body;
    if (!username || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    let newUser = await createUser({
      username,
      password,
      firstName,
      lastName,
      role,
    });
    res.status(201).json({
      success: true,
      body: newUser,
    });
  } catch (error) {
    res.status(500).json({
      error: `failed to addUser :- ${error}`,
    });
  }
});

adminRouter.delete("/deleteUser", async (req, res) => {
  if (req.body.username === undefined || req.body.username === null)
    res.status(500).send("Username is missing");
  try {
    let deletedUser = await prisma.user.delete({
      where: {
        username: req.body.username,
      },
    });

    await prisma.record.deleteMany({
      where: {
        username: req.body.username,
      },
    });

    res.status(200).json({
      success: true,
      msg: "Following user has been deleted",
      body: deletedUser,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
});

adminRouter.get("/userData", async (req, res) => {
  try {
    let userData = await prisma.user.findMany();
    res.status(200).json(userData);
  } catch (error) {
    res.send(error);
  }
});

module.exports = adminRouter;
