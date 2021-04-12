const Joi = require("joi");
const { noConflict } = require("lodash");

module.exports = function () {
  Joi.objectId = require("joi-objectid")(Joi);
};
