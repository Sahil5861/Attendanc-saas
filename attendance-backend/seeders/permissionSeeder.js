require("dotenv").config();

const mongoose = require("mongoose");

const Permission =
require("../src/models/Permission");

const permissions =
require("../src/config/defaultPermissions");

mongoose.connect(
  process.env.MONGO_URI
);

async function runSeeder() {

    try {

        for(const permission of permissions){

            await Permission.updateOne(
                {
                    name: permission.name
                },
                {
                    $set: permission
                },
                {
                    upsert: true
                }
            );
        }

        console.log(
            "Permissions Seeded Successfully"
        );

        process.exit();

    } catch(error){

        console.log(error);

        process.exit(1);
    }
}

runSeeder();