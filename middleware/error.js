const winston = require("winston");
// const { error } = require("winston");
// error(err.message, err);

module.exports = function (err, req, res, next) {
  // or winston.log("error", err.message, err);
  winston.error(err.message, err);
  res.status(500).send("Something failed.");
};
