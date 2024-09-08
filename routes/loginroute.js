const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Secret key for JWT (store this in an environment variable in a real application)
const JWT_SECRET = process.env.JWT_SECRET;

// Use cookie parser middleware
router.use(cookieParser());

// POST login data
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("User not found");
        }

        // Compare submitted password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        // Create and sign a JWT token with username instead of email
        const token = jwt.sign(
            { username: user.username, fullname: user.fullname, id: user._id },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Set token in a cookie
        res.cookie('token', token, {
            httpOnly: true,  // Best practice for security
            secure: true,  // Ensure this is true in production
            sameSite: 'none',
            path: '/',
            maxAge: 3600 * 1000,
        });
        
        res.status(200).json({ message: "Login successful" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
