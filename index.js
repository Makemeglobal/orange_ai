const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const { swaggerUi, specs } = require("./config/swagger");

const cors = require("cors");
const { stripePaymentStatus } = require("./controller/authController");
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
// app.use("/api/auth/webhook", bodyParser.raw({ type: "*/*" }));
// app.use("/api/auth/webhook", stripePaymentStatus);

app.post(
  "/api/auth/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;

    const endpointSecret = "we_1Pk2JiK4wssUAgalCRtBnnAO";

    if (endpointSecret) {
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }
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
    response.send();
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
