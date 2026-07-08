// models/Captcha.js

const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },

    // TTL index: MongoDB will automatically delete this document
    // 300 seconds (5 minutes) after `createdAt`.
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes
    },
});

module.exports = mongoose.model("Captcha", captchaSchema);