// can be named as login.js as well but auth is more common
const bcrypt = require("bcrypt");
const express = require("express");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const _ = require("lodash");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: new passwordComplexity({
      min: 8,
      max: 26,
      upperCase: 1,
      lowerCase: 1,
      numeric: 1,
      symbol: 1,
    }),
  });

  return schema.validate(req);
}

module.exports = router;
