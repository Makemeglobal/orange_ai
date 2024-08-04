const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const { swaggerUi, specs } = require("./config/swagger");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

connectDB();
const app = express();

// Middleware for general JSON parsing and CORS
app.use(cors());
app.use(bodyParser.json()); // This is used for parsing JSON bodies for other routes

// Webhook route
app.post(
  "/api/auth/webhook",
  express.raw({ type: "application/json" }), // Use express.raw to get the raw body for verification
  (request, response) => {
    const endpointSecret = process.env.END_POINT_SECRET;
    const signature = request.headers["stripe-signature"];
    console.log("Raw body:", request.body.toString());
    try {
      const event = stripe.webhooks.constructEvent(
        request.body, // Raw body here
        signature,
        endpointSecret
      );

      let subscription;
      let status;

      switch (event.type) {
        case "customer.subscription.created":
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          break;
        default:
          console.log(`Unhandled event type ${event.type}.`);
      }

      response.status(200).send("Event received");
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

app.use("/api/auth", authRoutes);
// Uncomment if using Swagger
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
