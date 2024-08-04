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

// const corsOptions = {
//   origin: ['https://www.poweredbyorange.ai', 'http://localhost'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', ""],
//   credentials: true
// };

app.use(cors());
// app.use(cors)
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

app.post(
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
