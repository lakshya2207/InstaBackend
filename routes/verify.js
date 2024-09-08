const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cookieParser = require('cookie-parser');

// Secret key for JWT (store this in an environment variable in a real application)
router.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET;

// Use cookie parser middleware

// /verify route
router.post('/', (req, res) => {
  const token = req.cookies.token; // Extract token from cookies
  // console.log(`Token passed: ${token}`);

  if (!token) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded)
    // Send back status and username
    res.json({ status: true, username: decoded.username,id:decoded.id,fullname:decoded.fullname });
  } catch (err) {
    // Token is invalid or expired
    res.status(401).json({ status: false, message: 'Invalid token' });
  }
});

module.exports = router;
