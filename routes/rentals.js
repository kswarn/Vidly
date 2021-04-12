const express = require("express");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const { Rental, validate } = require("../models/rental");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

Fawn.init(mongoose);

router.get("/", [auth, admin], async (req, res) => {
  const rentals = await Rental.find();
  res.send(rentals);
});

router.get("/:id", [auth, admin], async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(404).send("Rental not found.");

  res.send(rental);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);

  if (!customer) return res.status(404).send("Customer not found.");

  const movie = await Movie.findById(req.body.movieId);

  if (!movie) return res.status(404).send("Movie not found.");

  if (movie.numberInStock == 0)
    return res.status(400).send("Movie not in stock.");

  const newRental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  //   rental = await rental.save();

  //   movie.numberInStock--;
  //   movie.save();

  // we create a fawn task that emulates a transaction

  // save newRental is the first operation and the first argument is the collection name = rentals(its singular form is used while
  // creating a mongoose model)

  // the second operation is the update() method to update the movies collection with the new value of numberInStock for the given movie
  try {
    new Fawn.Task()
      .save("rentals", newRental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 },
        }
      )
      .run();

    res.send(newRental);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const rental = await Rental.findByIdAndDelete(req.params.id);

  if (!rental) return res.status(404).send("Rental not found.");

  res.send(rental);
});

module.exports = router;
