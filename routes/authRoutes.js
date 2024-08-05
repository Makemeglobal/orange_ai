// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const upload = require("../middleware/multerConfig");
const { authMiddleware } = require("../middleware/auth");
const  Feedback = require("../model/Feedback")
router.post("/signup", authController.signup);
router.post("/users/sub-users", authController.getSubUsersById);
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);  


/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and create user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - fullName
 *               - companyName
 *               - phone
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               fullName:
 *                 type: string
 *               companyName:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/verify-otp", authController.verifyOtpAndCreateUser);



router.get('/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
});
router.post('/feedback', async (req, res) => {
    const { name, email, message ,prompt,reason,category} = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newFeedback = new Feedback({ name, email, message ,prompt,reason,category});
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid input
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid input
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/auth/invite-sub-user:
 *   post:
 *     summary: Invite a sub-user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: Invalid input
 */
router.post("/invite-sub-user", authController.inviteSubUser);

/**
 * @swagger
 * /api/auth/accept-invitation:
 *   post:
 *     summary: Accept invitation and create sub-user
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Invitation token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - companyName
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               companyName:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sub-user created successfully
 *       400:
 *         description: Invalid input
 */
router.get("/accept-invitation", authController.acceptInvitation);

/**
 * @swagger
 * /api/auth/delete-sub-user:
 *   delete:
 *     summary: Delete a sub-user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subUserId
 *             properties:
 *               subUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sub-user deleted successfully
 *       400:
 *         description: Invalid input
 */
router.delete("/delete-sub-user", authController.deleteSubUser);
router.put("/update-profile", authMiddleware, authController.updateProfile);
router.get("/get-profile", authMiddleware, authController.getProfile);

router.post('/charge', async (req, res) => {
    const { amount, currency, source } = req.body;

    try {
        // Validate request data
        if (!amount || !currency || !source) {
            return res.status(400).json({ error: 'Invalid request, missing parameters' });
        }

        // Create a charge using the provided source (e.g., a card token)
        const charge = await stripe.charges.create({
            amount: Math.round(amount * 100), // Amount should be in the smallest unit (e.g., cents for USD)
            currency,
            source,
            description: 'Charge for payment',
        });

        res.status(200).json({ success: true, charge });
    } catch (err) {
        console.error('Error creating charge:', err);
        res.status(500).json({ error: 'Failed to create charge', details: err.message });
    }
});
router.post(
  "/upload-image",
  upload.single("image"),
  authController.uploadImage
);
module.exports = router;
