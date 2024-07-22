const mongoose = require('mongoose');

const InvitationTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, 
});

module.exports = mongoose.model('InvitationToken', InvitationTokenSchema);
