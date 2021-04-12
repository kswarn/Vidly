const express = require("express");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const moment = require("moment");
const validateObjectId = require("../middleware/validateObjectId");
// const Fawn = require("fawn");
const { Rental, validate } = require("../models/rental");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");

const router = express.Router();

// Fawn.init(mongoose);

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findOne({
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId,
  });

  if (!rental) return res.status(404).send("Rental not found.");

  if (rental.dateReturned)
    return res.status(400).send("Return already processed.");

  rental.dateReturned = new Date();

  rental.rentalFee =
    moment().diff(rental.dateOut, "days") * rental.movie.dailyRentalRate;

  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.status(200).send(rental);

  // try {
  //   new Fawn.Task()
  //     .save("rentals", rental)
  //     .update(
  //       "movies",
  //       { _id: movie._id },
  //       {
  //         $inc: { numberInStock: 1 },
  //       }
  //     )
  //     .run();

  //   res.send(rental);
  // } catch (ex) {
  //   res.status(500).send("Something failed.");
  // }
});

module.exports = router;
