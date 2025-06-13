const express = require("express");
const jwt = require("jsonwebtoken");
const { findUser } = require("../functions/prismaFunction");
const authRouter = express.Router();
const secretKey = "thisIsKey";

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Username and password are required" });
    }

    const response = await findUser({ username, password });

    if (response) {
      const token = jwt.sign(
        { username: response.username, role: response.role },
        secretKey,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        success: true,
        username: response.username,
        role: response.role,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials. Please try again.",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
});

module.exports = authRouter;
