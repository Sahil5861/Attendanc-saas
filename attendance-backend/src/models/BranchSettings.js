// models/BranchSettings.js

const mongoose = require("mongoose");

const branchSettingsSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
            unique: true,
            index: true,
        },

        // Basic Settings
        branchName: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
        },

        city: String,
        state: String,
        country: {
            type: String,
            default: "India",
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },

        postalCode: String,

        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },

        currency: {
            type: String,
            default: "INR",
        },

        dateFormat: {
            type: String,
            default: "DD/MM/YYYY",
        },

        timeFormat: {
            type: String,
            enum: ["12", "24"],
            default: "12",
        },

        logo: {
            type: String,
            default: "",
        },

        startTime: {
            type:String,
        },
        endTime: {
            type:String,
        },
        recess: {
            type:String,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("BranchSettings", branchSettingsSchema);