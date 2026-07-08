// scripts/import-location.js

const mongoose = require("mongoose");
const Country = require("../models/Country");
const State = require("../models/State");
const City = require("../models/City");

const data = require("../data/countries.json");

async function importData() {
  try {

    await mongoose.connect(
      "mongodb+srv://test-0001:ZFN0q5fn7ZV5yPXH@test.nl2myav.mongodb.net/attendance_saas"
    );

    

    console.log("MongoDB Connected");

    const countries = [];
    const states = [];
    const cities = [];

    data.forEach(country => {

      countries.push({
        countryId: country.id,
        name: country.name,
        iso2: country.iso2,
        iso3: country.iso3,
        phonecode: country.phonecode,
      });

      country.states.forEach(state => {

        states.push({
          stateId: state.id,
          countryId: country.id,
          name: state.name,
          iso2: state.iso2,
        });

        state.cities.forEach(city => {

          cities.push({
            cityId: city.id,
            stateId: state.id,
            countryId: country.id,
            name: city.name,
          });

        });

      });

    });

    console.log("Countries:", countries.length);
    console.log("States:", states.length);
    console.log("Cities:", cities.length);

    await Country.deleteMany({});
    await State.deleteMany({});
    await City.deleteMany({});

    await Country.insertMany(countries);
    await State.insertMany(states);
    await City.insertMany(cities);

    console.log("Import Completed");

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importData();