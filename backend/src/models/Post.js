// models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
   user: {
    type: mongoose.Schema.Types.ObjectId, // <--- CHANGE THIS: Store the commenter's User ID
    ref: 'User', // <--- Add this: Reference to your User model
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  author: {
    type: String, // Or mongoose.Schema.Types.ObjectId if you have a User model
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming you have user IDs
    ref: 'User', // Reference to your User model (if you have one)
  },
  date: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId, // Store IDs of users who liked the post
      ref: 'User',
    },
  ],
  comments: {
    type: Number,
    default: 0,
  },
  commentsList: [commentSchema],
  isImportant: {
    type: Boolean,
    default: false,
  },
  // You might want to add fields for attachments (images, videos, PDFs)
  // attachments: [{
  //   type: String, // Store URLs or file paths
  //   originalName: String,
  //   mimeType: String,
  // }],
  // requireConfirmation: {
  //   type: Boolean,
  //   default: false,
  // },
  // allowComments: {
  //   type: Boolean,
  //   default: true,
  // },
}, { timestamps: true }); // `timestamps: true` adds `createdAt` and `updatedAt` fields automatically

module.exports = mongoose.model('Post', postSchema);