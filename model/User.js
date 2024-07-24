const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  subUsers: [{ type: String }],
  profilePicture: { type: String, required: false },
});

module.exports = mongoose.model("User", UserSchema);
