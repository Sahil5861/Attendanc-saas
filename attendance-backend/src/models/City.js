// models/City.js

const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  cityId: Number,
  stateId: Number,
  countryId: Number,
  name: String,
});

module.exports = mongoose.model("City", citySchema);