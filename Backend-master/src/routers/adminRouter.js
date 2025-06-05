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

// Delete user by username
adminRouter.delete("/deleteUser", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    // Delete related records in the Record table
    await prisma.record.deleteMany({
      where: { username },
    });

    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { username },
    });

    res.status(200).json({
      success: true,
      message: `User '${username}' has been deleted successfully.`,
      body: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ error: `Failed to delete user: ${error.message}` });
  }
});

// 📦 Get all user data
adminRouter.get("/userData", async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Fetch all fields for each user
    res.status(200).json(users); // Return the full user data
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to retrieve user data." });
  }
});

module.exports = adminRouter;
