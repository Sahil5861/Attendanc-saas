// models/State.js

const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  stateId: Number,
  countryId: Number,
  name: String,
  iso2: String,
});

module.exports = mongoose.model("State", stateSchema);