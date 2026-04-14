const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Use a setup for Socket.io
const setupSockets = require('./sockets');
const io = setupSockets(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Route
app.get('/', (req, res) => {
  res.send({ message: 'CureIQ API is running...' });
});

// Api Routes
app.use('/api', require('./routes/api'));

// Connect to MongoDB
/*
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));
*/
// For now, we will mock DB if MONGO_URI is missing.
const initializeDB = async () => {
    try {
        if(process.env.MONGO_URI && !process.env.MONGO_URI.includes('your_mongo')) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('MongoDB connected');
        } else {
            console.log('MongoDB connection skipped. (Missing valid MONGO_URI)');
        }
    } catch (e) {
        console.error('MongoDB connection error:', e);
    }
}
initializeDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
