const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decodedPayload = jwt.verify(token, config.get("jwtPrivateKey"));

    // attach the payload to the req obj, so it can be extracted in the route handlers

    // req object is not accessible using supertest, so we write unit test for this
    req.user = decodedPayload;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
