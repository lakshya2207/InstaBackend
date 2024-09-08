const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel'); // Adjust path as needed
const isLoggedIn = require('../middlewares/isLoggedIn'); // Import the authentication middleware

// Route to get all users
router.get('/allusers', isLoggedIn, async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await UserModel.find({}, 'username fullname _id profilePicture');
        
        // Map the results to include the necessary fields
        const userData = users.map(user => ({
            userId: user._id,
            username: user.username,
            fullname: user.fullname,
            profilePicture:user.profilePicture
        }));

        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get a specific user by username
router.get('/user/:username', isLoggedIn, async (req, res) => {
    const { username } = req.params;
    try {
        // Fetch the user by username from the database
        const user = await UserModel.findOne({ username: username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return the entire user data
        res.json({
            userId: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to update profile picture and bio
router.patch('/edit', isLoggedIn, async (req, res) => {
    const { profilePicture, bio } = req.body;
    const userId = req.userId; // Assume `isLoggedIn` middleware sets `req.userId`
    try {
        // Create an update object with only the fields that are provided
        const updateFields = {};
        if (profilePicture) updateFields.profilePicture = profilePicture;
        if (bio) updateFields.bio = bio;

        // Validate if there's anything to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        // Update the user profile
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the updated user data
        res.json({
            userId: updatedUser._id,
            username: updatedUser.username,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
            followers: updatedUser.followers,
            following: updatedUser.following,
            posts: updatedUser.posts,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
