const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    status: {
  type: String,
  enum: [
    "pending",
    "accepted",
    "rejected",
    "in_progress",
    "completed",
  ],
  default: "pending",
},
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", requestSchema);