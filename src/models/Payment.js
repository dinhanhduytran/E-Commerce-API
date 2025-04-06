import e from "express";

const mongoose = require("mongoose");

const { Schema } = mongoose.Schema;

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // implement stripe first
    provider: { type: String, default: "stripe" },
    amount: {
      type: Number,
    },
    paymentIntentId: {
      type: String,
    },
    currency: {
      type: String,
      default: "usd",
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
