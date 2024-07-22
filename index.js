const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const { swaggerUi, specs } = require('./config/swagger');
require('dotenv').config();


const app = express();
connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
