const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    attendanceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    checkin: {
      type: Date,
      default: null,
    },

    checkout: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["present", "absent", "onLeave"],
      default: "present",
    },

    workingHours: {
      type: Number,
      default: 0,
    },

    checkinLatitude:{
      type:String,
      default:null,
    },
    checkinLongitude:{
      type:String,
      default:null,
    },
    checkoutLatitude:{
      type:String,
      default:null,
    },
    checkoutLongitude:{
      type:String,
      default:null,
    },

    remarks: {
      type: String,
      default: "",
    },

    isAutoCheckout: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);