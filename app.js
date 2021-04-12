const winston = require("winston");
const express = require("express");
const app = express();

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/database")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 3000;

// app.listen() returns a server object and we need to export it to be able to use it
// in this testing module as integration tests have additional dependencies
const server = app.listen(port, () => winston.info(`Listening on ${port}.`));

module.exports = server;
