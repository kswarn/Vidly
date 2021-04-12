const express = require("express");
const mongoose = require("mongoose");
const { Genre } = require("../models/genre");
const { Movie, validate } = require("../models/movie");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");

  res.send(movies);
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send("Movie not found.");

  res.send(movie);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);

  if (!genre) return res.status(404).send("Invalid genre.");

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  await movie.save();

  res.send(movie);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genreId: req.body.genreId,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },
    { new: true }
  );

  if (!movie) return res.status(404).send("Movie not found.");

  res.send(movie);
});

router.delete("/:id", async (req, res) => {
  const result = await Movie.findByIdAndDelete(req.params.id);

  if (!result) return res.status(404).send("Couldn't find movie.");

  res.send(result);
});

module.exports = router;
