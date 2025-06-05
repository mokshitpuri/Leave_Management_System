const express = require("express");
const adminRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const { createUser } = require("../functions/prismaFunction");

const prisma = new PrismaClient();

// ✅ Add a new user with duplicate check (case-insensitive username check)
adminRouter.post("/addUser", async (req, res) => {
  try {
    const { username, password, firstName, lastName, role } = req.body;

    if (!username || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔁 Case-insensitive check for existing username
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists. Please choose a different one.",
      });
    }

    // Use createUser function that also checks fullName clash
    const newUser = await createUser({
      username,
      password,
      firstName,
      lastName,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      body: newUser,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    res.status(500).json({
      error: `Failed to create user: ${error.message}`,
    });
  }
});

// ❌ Delete user by username (case-insensitive)
adminRouter.delete("/deleteUser", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is missing." });
  }

  try {
    // Find user first with case-insensitive match
    const userToDelete = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    // Delete records related to this username (case-sensitive to stored username)
    await prisma.record.deleteMany({
      where: { username: userToDelete.username },
    });

    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { username: userToDelete.username },
    });

    res.status(200).json({
      success: true,
      message: `User '${userToDelete.username}' and related records have been deleted.`,
      body: deletedUser,
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({
      error: `Failed to delete user: ${error.message}`,
    });
  }
});

// 📦 Get all user data
adminRouter.get("/userData", async (req, res) => {
  try {
    const userData = await prisma.user.findMany();
    res.status(200).json(userData);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to retrieve user data." });
  }
});

module.exports = adminRouter;
