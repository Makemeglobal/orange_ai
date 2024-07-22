const User = require('../model/User');
const OTP = require('../model/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();
const sendInvitationEmail= require("../utils/sendInvitationEmail")
const InvitationToken = require("../model/InvitationToken")


exports.signup = async (req, res) => {
  
  const { fullName, country, email, phone, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    await OTP.create({ email, otp });

    await sendEmail(email, 'OTP Verification', `Your OTP is ${otp}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.verifyOtpAndCreateUser = async (req, res) => {
  const { email, otp, fullName, country, phone, password } = req.body;
  console.log(otp)

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ fullName, country, email, phone, password: hashedPassword });

    await OTP.deleteOne({ email, otp });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
  console.log(email)
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Invite Sub-user
exports.inviteSubUser = async (req, res) => {
  const { email } = req.body;
  const {inviterId} = req.body; 
  console.log(inviterId)

  try {
    const inviter = await User.findById(inviterId);
    console.log(inviter)
    if (!inviter) {
      return res.status(400).json({ message: 'Inviter not found' });
    }

    const token = jwt.sign({ email, inviterId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(token)
   const iToken= await InvitationToken.create({ email, inviter: inviterId, token });

console.log(iToken ,"ji")

    await sendInvitationEmail(email, inviter.fullName, token);

    res.status(200).json({ message: 'Invitation sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error)
  }
};


exports.acceptInvitation = async (req, res) => {
  const { token } = req.query;
  const { fullName, country, phone, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, inviterId } = decoded;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, country, email, phone, password: hashedPassword });

    await User.findByIdAndUpdate(inviterId, { $push: { subUsers: newUser._id } });

    await InvitationToken.deleteOne({ token });

    res.status(201).json({ message: 'User created successfully and added as sub-user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteSubUser = async (req, res) => {
  const { subUserId } = req.body;
  const {inviterId }= req.body; // Assume you have a middleware that sets req.user

  try {
    await User.findByIdAndUpdate(inviterId, { $pull: { subUsers: subUserId } });
    await User.findByIdAndDelete(subUserId);

    res.status(200).json({ message: 'Sub-user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    await OTP.create({ email, otp });

    await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { password: hashedPassword });

    await OTP.deleteOne({ email, otp });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
