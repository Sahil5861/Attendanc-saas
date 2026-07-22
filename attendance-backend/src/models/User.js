const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: null,
    },

    realPassword: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "COMPANY_ADMIN",
        "BRANCH_MANAGER",
        "EMPLOYEE",
      ],
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    },

    status: {
      type: Boolean,
      default: true,
    },

    fcmToken: {
      type: String,
      default: null
    },

    notificationStatus :{
      type:Boolean,
      default: false
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);