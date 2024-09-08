const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const bcrypt =require('bcrypt')

// GET signup page
router.get('/signup', (req, res) => {
    res.render('signup');
    // res.send('index');
});

// POST signup data
router.post('/signup', async (req, res) => {
    const {fullname, username, email,password} = req.body;
    const prevuser = await User.findOne({email})
    if (!prevuser){
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                const user = await User.create({
                    fullname: fullname,
                    username: username,
                    email: email,
                    password:hash,
                });
                user.save();
            });
        });
        return res.status(200).json({ message: "User Registered" });
    }
    res.status(500).json({ message: "Can't create new user." });
});

module.exports = router;
