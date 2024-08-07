const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const { swaggerUi, specs } = require("./config/swagger");

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
