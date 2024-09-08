const express = require('express');
const router = express.Router();
const User = require('../models/UserModel'); // Adjust the path as needed

// Route to follow a user
router.post('/follow', async (req, res) => {
    const { follower, followed } = req.body;

    if (!follower || !followed) {
        return res.status(400).json({ error: 'Missing follower or followed username' });
    }

    try {
        const followerUser = await User.findOne({ username: follower });
        const followedUser = await User.findOne({ username: followed });

        if (!followerUser || !followedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!followerUser.following.includes(followed)) {
            followerUser.following.push(followed);
            await followerUser.save();
        }

        if (!followedUser.followers.includes(follower)) {
            followedUser.followers.push(follower);
            await followedUser.save();
        }

        res.status(200).json({ message: 'User followed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while following the user' });
    }
});

// Route to unfollow a user
router.post('/unfollow', async (req, res) => {
    const { follower, followed } = req.body;

    if (!follower || !followed) {
        return res.status(400).json({ error: 'Missing follower or followed username' });
    }

    try {
        const followerUser = await User.findOne({ username: follower });
        const followedUser = await User.findOne({ username: followed });

        if (!followerUser || !followedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        followerUser.following = followerUser.following.filter(user => user !== followed);
        await followerUser.save();

        followedUser.followers = followedUser.followers.filter(user => user !== follower);
        await followedUser.save();

        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while unfollowing the user' });
    }
});

module.exports = router;
