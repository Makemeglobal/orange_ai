// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const upload = require("../middleware/multerConfig");
const { authMiddleware } = require("../middleware/auth");
const Feedback = require("../model/Feedback");
router.post("/signup", authController.signup);
router.post("/users/sub-users", authController.getSubUsersById);
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const User = require("../model/User");
const Otp = require("../model/Otp");

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

router.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
});

router.get("/get-users" , async (req,res)=>{
    try{

        // const emails = ['harshvchawla998@gmail.com' , 'forbgmi2307@gmail.com' , 'harshvchawla996@gmail.com'];
        // emails.forEach((user) =>{
        //     User.deleteOne({email:user}).then(()=>{
        //         console.log('deleted')
        //     }).catch((err)=>{
        //         console.log(err)
        //     });
        // })
        const users = await User.find();
        users.forEach(async (user)=>{
            await User.findByIdAndUpdate(user._id,{
                userType:'user'
            });
        // console.log('hi')
        }
        
    )
        return res.send(users);
    }
    catch(err){
        console.log(err)
        return res.send(err)
    }
})

router.get('/get-otp' ,async (req,res) => {
  try{
    const otps = await Otp.find();
    return res.send(otps);
  }
  catch(err){
    console.log(err)
  }
})

router.get('/get-otp' ,async (req,res) => {
  try{
    const otps = await Otp.find();
    return res.send(otps);
  }
  catch(err){
    console.log(err)
  }
})
router.post("/feedback", async (req, res) => {
  const { name, email, message, prompt, reason, category } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newFeedback = new Feedback({
      name,
      email,
      message,
      prompt,
      reason,
      category,
    });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
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

router.post("/charge", async (req, res) => {
  const { amount, currency, source } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
      description: "Charge for payment",
    });
    res.status(200).json({ success: true, charge });
  } catch (err) {
    res.status(500).json({ error: "Failed to create charge" });
  }
});
router.post(
  "/upload-image",
  upload.single("image"),
  authController.uploadImage
);

//

router.post("/plan-add", authController.addPlan);

router.post("/create-checkout-session", authController.stripeSession);

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  authController.stripePaymentStatus
);

module.exports = router;
