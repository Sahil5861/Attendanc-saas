const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
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
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    teamLead: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    status: {
      type: Boolean,
      default: true,
    },

    employeeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Same team name allowed in different branches
teamSchema.index(
  { branchId: 1, slug: 1 },
  { unique: true }
);

module.exports = mongoose.model("Team", teamSchema);