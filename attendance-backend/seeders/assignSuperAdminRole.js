require("dotenv").config();

const mongoose = require("mongoose");

const User =
require("../src/models/User");

const Role =
require("../src/models/Role");

mongoose.connect(
  process.env.MONGO_URI
);

async function assignRole() {

    const role =
    await Role.findOne({
        name: "SUPER_ADMIN"
    });

    await User.updateOne(
        {
            email:
            "admin@example.com"
        },
        {
            roleId: role._id
        }
    );

    console.log(
      "Super Admin Role Assigned"
    );

    process.exit();
}

assignRole();