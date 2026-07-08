const mongoose = require("mongoose");
 
const branchPlanRelationSchema = new mongoose.Schema(
  {
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    billingCycle :{
        type: String,
        required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);
 
// Helpful compound index: fast lookup of a branch's active plan
branchPlanRelationSchema.index({ branch_id: 1, status: 1 });
 
module.exports = mongoose.model("BranchPlanRelation", branchPlanRelationSchema);