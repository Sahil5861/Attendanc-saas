const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Razorpay Order ID
    orderId: {
      type: String,
      required: true,
    },

    // Razorpay Payment ID
    paymentId: {
      type: String,
      default: null,      
    },

    // Razorpay Signature
    signature: {
      type: String,
      default: null,
    },

    // Amount in Rupees
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // Receipt generated while creating order
    receipt: {
      type: String,
      required: true,
    },

    // Payment Status
    status: {
      type: String,
      enum: [
        "created",
        "paid",
        "failed"
      ],
      default: "created",
    },

    // Signature verified or not
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Store complete Razorpay response if needed
    razorpayResponse: {
      type: Object,
      default: {},
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);