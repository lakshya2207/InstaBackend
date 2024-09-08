const express = require('express');
const router = express.Router();
const Post = require('../models/PostModel'); // Update the path according to your directory structure

// Route to like a post
router.post('/like', async (req, res) => {
    const { username, post_id } = req.body;

    if (!username || !post_id) {
        return res.status(400).json({ error: 'Missing username or post_id' });
    }

    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Add username to the likes array if not already present
        if (!post.likes.includes(username)) {
            post.likes.push(username);
            await post.save();
            res.status(200).json({ message: 'Post liked successfully' });
        } else {
            res.status(200).json({ message: 'Post already liked' });
        }
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while liking the post' });
    }
});

// Route to dislike a post
router.post('/dislike', async (req, res) => {
    const { username, post_id } = req.body;

    if (!username || !post_id) {
        return res.status(400).json({ error: 'Missing username or post_id' });
    }

    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Remove username from the likes array if present
        if (post.likes.includes(username)) {
            post.likes = post.likes.filter(user => user !== username);
            await post.save();
            res.status(200).json({ message: 'Post disliked successfully' });
        } else {
            res.status(200).json({ message: 'Post was not liked by this user' });
        }
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while disliking the post' });
    }
});

module.exports = router;
