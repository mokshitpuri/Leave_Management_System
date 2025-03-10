const jwt = require("jsonwebtoken");

async function authenticate(req, res, next) {
  let token = req.headers.token;
  try {
    let decoded = jwt.verify(token, "thisIsKey");
    req.decoded = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
module.exports = authenticate;
