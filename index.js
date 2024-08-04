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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Use express.raw() before bodyParser.json() to capture raw payload
app.use(
  "/api/auth/webhook",
  express.raw({ type: "application/json" }), // Middleware to preserve raw body
  (request, response) => {
    const endpointSecret = process.env.END_POINT_SECRET;
    const signature = request.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        request.body, // This should be raw buffer
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
