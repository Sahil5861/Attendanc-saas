require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI);

async function seedAdmin() {

    const exists = await User.findOne({
        role: "SUPER_ADMIN"
    });

    if(exists){
        console.log("Super Admin Already Exists");
        process.exit();
    }

    const hashedPassword = await bcrypt.hash(
        "Admin@123",
        10
    );

    await User.create({
        name: "Super Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "SUPER_ADMIN"
    });

    console.log("Super Admin Created");

    process.exit();
}

seedAdmin();