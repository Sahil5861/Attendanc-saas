// models/Country.js

const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  countryId: Number,
  name: String,
  iso2: String,
  iso3: String,
  phonecode: String,
});

module.exports = mongoose.model("Country", countrySchema);