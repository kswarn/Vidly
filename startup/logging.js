const winston = require("winston");
// require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  // we can handle uncaught exceptions using winston.handleExceptions and there's no specifc method for
  // unhandled rejections, so we throw the exception caught by unhandled rejection and let winston handle it

  winston.handleExceptions(
    //   write exceptions to the console and to the file
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  // this approach of catching uncaught exceptions works only for sync code, not for async(promises)
  // process.on("uncaughtException", (ex) => {
  //   winston.error(ex.message, ex);
  //   process.exit(1);
  // });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(winston.transports.File, { filename: "logfile.log" });
  // winston.add(winston.transports.MongoDB, { db: "mongodb://localhost/vidly" });

  // throw new Error("Something failed at startup.");

  // const p = Promise.reject(new Error("Something failed miserably."));
  // p.then(() => console.log("Done"));
};
