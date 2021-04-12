const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const Rental = mongoose.model(
  "rental",
  new mongoose.Schema({
    customer: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 255,
        },
        phone: {
          type: String,
          required: true,
        },
        isGold: {
          type: Boolean,
          required: true,
        },
      }),
      required: true,
    },
    movie: {
      type: new mongoose.Schema({
        title: {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 255,
        },
        dailyRentalRate: {
          type: Number,
          required: true,
        },
      }),
      required: true,
    },
    dateOut: {
      type: Date,
      required: true,
      default: new Date(),
    },
    dateReturned: {
      type: Date,
    },
    rentalFee: {
      type: Number,
      min: 0,
    },
  })
);

function validateRental(rental) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.validate = validateRental;
