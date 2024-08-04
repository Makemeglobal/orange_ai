const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ["user", "subUser"],
  },
  subUsers: [{ type: String }],
  profilePicture: { type: String, required: false },
  activePlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: false,
  },
});

module.exports = mongoose.model("User", UserSchema);
