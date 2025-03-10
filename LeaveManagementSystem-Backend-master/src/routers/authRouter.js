const express = require("express");
const jwt = require("jsonwebtoken");
const { findUser } = require("../functions/prismaFunction");
const authRouter = express.Router();
const secretKey = "thisIsKey";

authRouter.post("/logIn", async (req, res) => {
  let { username, password } = req.body;
  let response = await findUser({ username, password });
  if (response) {
    const token = jwt.sign(
      { username: response.username, role: response.role },
      secretKey,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      success: true,
      username: username,
      role: response.role,
      token: token,
    });
  } else {
    res.status(401).json({
      success: false,
      username: username,
      msg: "Invalid Credentials",
    });
  }
});

module.exports = authRouter;
