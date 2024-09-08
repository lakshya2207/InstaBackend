const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI);
// Middleware setup
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const corsOptions = {
    origin: ['http://localhost:5173','http://192.168.1.24:5173',
        'http://192.168.137.1:5173','https://localhost:5173',
        'https://192.168.1.24:5173','https://192.168.137.1:5173'], 
    // origin: '*', // Replace with your client’s origin
    credentials: true // Allow cookies to be sent and received
};
app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

const signupRouter = require('./routes/signin');
const loginRoute = require('./routes/loginroute');
const verifyRoute = require('./routes/verify');
const postRoute = require('./routes/postRoute'); // Import the new router
const userRoute = require('./routes/userRoute'); // Import the new router
const likePost = require('./routes/likePost'); // Import the new router
const followRoute = require('./routes/followRoute'); // Import the new router
app.use('/', signupRouter);
app.use('/', loginRoute);
app.use('/verify', verifyRoute);
app.use('/', postRoute); // Use the new router for /posts routes
app.use('/', userRoute); // Use the new router for /posts routes
app.use('/posts', likePost); // Use the new router for /posts routes
app.use('/user', followRoute); // Use the new router for /posts routes

app.post('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ message: 'Logged out successfully' });
});

app.listen(4000, () => {
    console.log(`Server running on http://localhost:4000`);
});
