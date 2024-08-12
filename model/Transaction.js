const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  planId: { type: String },
  sessionId: { type: String },
  sessionUrl: { type: String },
  status: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  date:{

    type:Date,
  },
  amount: { type: Number },
});

module.exports = mongoose.model("Transaction", transactionSchema);
