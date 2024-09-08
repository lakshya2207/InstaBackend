const express = require('express');
const router = express.Router();
const Post = require('../models/PostModel');  // Adjust path as needed
const UserModel = require('../models/UserModel');  // Adjust path as needed
const isLoggedIn = require('../middlewares/isLoggedIn'); // Import the middleware
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dgbmuw01l',
    api_key: '318273689416264',
    api_secret: '641HIJ8ozq4224wuLjfWZw_Sh-0'
});

// Route to save a post
router.post('/save', async (req, res) => {
    const { post_id, username } = req.body; // Post ID and username from the request body

    if (!post_id || !username) {
        return res.status(400).json({ error: 'Post ID and username are required' });
    }

    try {
        // Find the user by username
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the post is already saved by the user
        if (user.saved.includes(post_id)) {
            return res.status(400).json({ message: 'Post already saved' });
        }

        // Add post_id to the user's saved posts
        user.saved.push(post_id);
        await user.save();

        // Find the post by ID and add the username to the post's saved array
        const post = await Post.findById(post_id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Ensure the username is not already in the post's saved list
        if (post.saved.includes(username)) {
            return res.status(400).json({ message: 'User already saved this post' });
        }

        post.saved.push(username);
        await post.save();

        res.status(200).json({ message: 'Post saved successfully' });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Route to unsave a post
router.post('/unsave', async (req, res) => {
    const { post_id, username } = req.body; // Post ID and username from the request body

    if (!post_id || !username) {
        return res.status(400).json({ error: 'Post ID and username are required' });
    }

    try {
        // Find the user by username
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.saved.includes(post_id)) {
            return res.status(400).json({ message: 'Post not saved' });
        }

        // Remove post_id from user's saved posts
        user.saved = user.saved.filter(id => id.toString() !== post_id.toString());
        await user.save();

        // Find the post by ID
        const post = await Post.findById(post_id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Remove username from post's saved list
        if (!post.saved.includes(username)) {
            return res.status(400).json({ message: 'User has not saved this post' });
        }

        post.saved = post.saved.filter(user => user !== username);
        await post.save();

        res.status(200).json({ message: 'Post unsaved successfully' });
    } catch (error) {
        console.error('Error unsaving post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Route to create a new post
router.post('/createpost', isLoggedIn, async (req, res) => {
    const userId = req.userId;
    const { imageUrl, caption } = req.body; // Destructure caption from the request body

    try {
        const newPost = await Post.create({
            userId: userId,
            image: imageUrl,
            caption: caption // Save the caption to the database
        });

        await UserModel.findByIdAndUpdate(userId, {
            $push: { posts: newPost._id }
        });

        console.log(imageUrl, caption); // Log imageUrl and caption
        res.status(200).json({ status: true, message: 'Image and caption received' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
});

router.get('/posts/:username', isLoggedIn, async (req, res) => {
    const { username } = req.params; // Extract username from request parameters
    // console.log(username);

    try {
        // Fetch the user by username to get the userId
        const user = await UserModel.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user._id; // Get the userId from the user document

        // Fetch all posts for the userId
        const posts = await Post.find({ userId: userId })
        .populate('userId', 'username')
            .sort({ createdAt: -1 }); // Optional: sort posts by creation date

        // Return the posts data
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Route to get all posts
router.get('/allposts', isLoggedIn, async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/savedpostsidlist/:username', async (req, res) => {
    const { username } = req.params;
    // console.log(username);

    try {
        // Find the user by username
        const user = await UserModel.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve the list of saved post IDs from the user document
        const savedPostIds = user.saved;

        // Return the list of saved post IDs
        res.status(200).json(savedPostIds);
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/savedposts/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user by username
        const user = await UserModel.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve the list of saved post IDs from the user document
        const savedPostIds = user.saved;

        // Fetch all posts that match the saved post IDs
        const savedPosts = await Post.find({ _id: { $in: savedPostIds } })
            .populate('userId', 'username') // Optional: populate userId field to get the username
            .sort({ createdAt: -1 }); // Optional: sort posts by creation date

        // Return the list of saved posts
        res.status(200).json(savedPosts);
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.delete('/post/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
    }

    try {
        // Find the post by ID
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Extract image ID for Cloudinary deletion
        const imagearr = post.image.split('/');
        const img = imagearr[imagearr.length - 1];
        const imgid = img.split('.')[0];

        // Remove the image from Cloudinary
        await cloudinary.uploader.destroy(imgid);

        // Find the user who created the post and remove the post ID from their posts array
        await UserModel.findByIdAndUpdate(post.userId, {
            $pull: { posts: id }
        });

        // Find and update all users who have saved this post
        const savedUsers = await UserModel.find({ saved: id });
        for (const user of savedUsers) {
            user.saved = user.saved.filter(savedPostId => savedPostId.toString() !== id.toString());
            await user.save();
        }

        // Find and update all users who have the post in their posts array
        const postsUsers = await UserModel.find({ posts: id });
        for (const user of postsUsers) {
            user.posts = user.posts.filter(postId => postId.toString() !== id.toString());
            await user.save();
        }

        // Delete the post
        await Post.findByIdAndDelete(id);

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
