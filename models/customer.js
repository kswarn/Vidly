const mongoose = require("mongoose");
const Joi = require("Joi");

const Customer = mongoose.model(
  "customer",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    isGold: Boolean,
    phone: {
      type: Number,
    },
  })
);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    phone: Joi.number().min(10).required(),
    isGold: Joi.boolean().required(),
  });

  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
