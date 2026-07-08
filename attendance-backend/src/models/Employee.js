const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // Relations
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",      
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    // Basic Details
    employeeCode: {
      type: String,
      unique: true,
      required: false,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      ref: "uploads/employees",
      required: false,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dateOfBirth: {
      type: Date,
    },

    // Employment
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "intern", "contract"],
      default: "full_time",
    },

    // Salary
    basicSalary: {
      type: Number,
      default: 0,
    },

    salaryType: {
      type: String,
      enum: ["monthly", "daily", "hourly"],
      default: "monthly",
    },

    // Address
    address: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    country: {
      type: String,
      default: "India",
    },

    pincode: {
      type: String,
    },

    // Attendance
    shiftName: {
      type: String,
    },

    shiftStartTime: {
      type: String,
    },

    shiftEndTime: {
      type: String,
    },

    // Profile
    profileImage: {
      type: String,
    },

    // Login
    password: {
      type: String,
    },

    isLoginEnabled: {
      type: Boolean,
      default: true,
    },

    siteCheckinEnabled: {
      type:Boolean,
      default: false,
    },

    // Status
    status: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);