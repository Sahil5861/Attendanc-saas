const mongoose = require("mongoose");
const { Schema } = mongoose;

const branchSubscriptionSchema = new Schema(
    {
        branch_id: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },
        company_id: {
            type: Schema.Types.ObjectId,
            ref: "Company",
        },
        plan_id: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            required: true,
        },

        // Razorpay identifiers
        razorpaySubscriptionId: {
            type: String,
            required: true,
            unique: true, // ek subscription id sirf ek record se map ho
        },
        razorpayPlanId: {
            type: String,
            required: true,
        },
        razorpayCustomerId: {
            type: String,
        },

        billingCycle: {
            type: String,
            enum: ["monthly", "quarterly", "halfYearly", "yearly"],
            required: true,
        },

        amount: {
            type: Number, // paise me store karo (Razorpay convention)
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },

        totalCount: {
            type: Number, // kitne billing cycles ke liye subscription banaya
        },
        paidCount: {
            type: Number,
            default: 0, // ab tak kitne cycles charge ho chuke (webhook se update hoga)
        },

        // Razorpay ke subscription statuses:
        // created, authenticated, active, pending, halted, cancelled, completed, expired
        status: {
            type: String,
            enum: [
                "created",
                "authenticated",
                "active",
                "pending",
                "halted",
                "cancelled",
                "completed",
                "expired",
            ],
            default: "created",
        },

        currentStart: { type: Date }, // current billing cycle start
        currentEnd: { type: Date },   // current billing cycle end (next charge date)

        startedAt: { type: Date },    // jab pehli baar activate hua
        endedAt: { type: Date },      // cancel/complete/expire hone ki date

        isActive: {
            type: Boolean,
            default: false, // sirf tab true jab status === 'active'
        },

        // Verification / payment trail
        lastPaymentId: { type: String },
        lastVerifiedAt: { type: Date },

        notes: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

// Ek branch ka ek time pe sirf ek active subscription ho — helpful index (optional but recommended)
branchSubscriptionSchema.index({ branch_id: 1, isActive: 1 });

module.exports = mongoose.model("BranchSubscription", branchSubscriptionSchema);