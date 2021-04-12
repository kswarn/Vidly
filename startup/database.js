const { info } = require("winston");
const config = require("config");
const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(config.get("database"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => info(`Connected to ${config.get("database")}.`));
};
