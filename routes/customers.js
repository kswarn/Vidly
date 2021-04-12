const express = require("express");
const { Customer, validate } = require("../models/customer");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send("Customer not found.");

  res.send(customer);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const newCustomer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });

  await newCustomer.save();

  res.send(newCustomer);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
    { new: true }
  );

  if (!customer) return res.status(404).send("Customer not found.");

  res.send(customer);
});

router.delete("/:id", async (req, res) => {
  const result = await Customer.findByIdAndDelete(req.params.id);

  if (!result) return res.status(404).send("Customer not found.");

  res.send(result);
});

module.exports = router;
