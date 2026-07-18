const mongoose = require("mongoose");

const employeeHistorySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    entryType: {
      type: String,
      enum: [
        "checkin",
        "checkout",
        "login",
        "logout",
        "breakin",
        "breakout",
      ],
      required: true,
    },

    time: {
      type: Date,
      required: true,
      default: Date.now,
    },

    remarks: {
      type: String,
      default: null,
      trim: true,
    },

    device: {
      type: String,
      default: null,
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmployeeHistory",
  employeeHistorySchema
);