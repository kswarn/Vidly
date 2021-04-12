const mongoose = require("mongoose");
const genreSchema = require("./genre");
const Joi = require("joi");

const Movie = mongoose.model(
  "movie",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    genre: {
      type: genreSchema,
      required: true,
    },
    numberInStock: {
      type: Number,
      min: 0,
      max: 255,
    },
    dailyRentalRate: {
      type: Number,
      min: 0,
      max: 255,
    },
  })
);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    genreId: Joi.objectId(),
    numberInStock: Joi.number(),
    dailyRentalRate: Joi.number(),
  });

  return schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validate = validateMovie;
