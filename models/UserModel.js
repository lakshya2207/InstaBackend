const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: String,
    bio: { type: String, default: "Hey this is Instagram" }, // Set default value for bio
    followers: [],
    following: [],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // Corrected reference to the model name
        }
    ],
    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // Corrected reference to the model name
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
