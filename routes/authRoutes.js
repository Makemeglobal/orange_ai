const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { jwtAuth } = require('./authMiddleware');

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOtpAndCreateUser);
router.post('/login',authController.login);
router.post('/forgot-password',authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/invite-sub-user',jwtAuth,  authController.inviteSubUser);
router.post('/accept-invitation',jwtAuth, authController.acceptInvitation);
router.delete('/delete-sub-user',jwtAuth,  authController.deleteSubUser);

module.exports = router;
