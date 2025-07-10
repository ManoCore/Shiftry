// // routes/postRoutes.js
// const express = require('express');
// const router = express.Router();
// const Post = require('../models/Post');
// const User=require('../models/user'); // Make sure User model is imported
// const mongoose = require('mongoose');

// const sendErrorResponse = (res, statusCode, message) => {
//   res.status(statusCode).json({ message });
// };

// // Helper function to format a single post object after population
// const formatPostResponse = (post) => {
//   const postObject = post.toObject(); // Convert Mongoose document to plain JS object

//   // Handle post author details
//   if (postObject.authorId) {
//     postObject.author = `${postObject.authorId.firstName} ${postObject.authorId.lastName}`;
//     postObject.authorProfilePicture = postObject.authorId.profilePicture;
//     postObject.authorId = postObject.authorId._id; // Keep just the ID
//   } else {
//     postObject.author = postObject.author || 'Unknown User';
//     postObject.authorProfilePicture = null;
//   }

//   // Handle comments list details
//   if (postObject.commentsList && postObject.commentsList.length > 0) {
//     postObject.commentsList = postObject.commentsList.map(comment => {
//       // Check if comment.user was populated
//       if (comment.user && typeof comment.user === 'object' && comment.user._id) {
//         return {
//           _id: comment._id,
//           text: comment.text,
//           createdAt: comment.createdAt,
//           user: `${comment.user.firstName} ${comment.user.lastName}`, // Formatted commenter name
//           userId: comment.user._id, // Commenter's ID
//           userProfilePicture: comment.user.profilePicture, // Commenter's profile picture
//         };
//       } else {
//         // Fallback for comments where user might not be populated or is just a string ID
//         return {
//           _id: comment._id,
//           text: comment.text,
//           createdAt: comment.createdAt,
//           user: comment.user || 'Unknown Commenter', // Use original 'user' string or default
//           userId: comment.user, // Keep original user field if it's an ID string
//           userProfilePicture: null, // No profile picture if user not found/populated
//         };
//       }
//     });
//   } else {
//     postObject.commentsList = []; // Ensure it's an empty array if no comments
//   }

//   return postObject;
// };


// // @route   POST / (becomes /newsfeed/posts in app.js)
// router.post('/', async (req, res) => {
//   try {
//     const { author, authorId, location, content, isImportant, allowComments, requireConfirmation, files } = req.body;

//     if (!author || !authorId || !location || !content) {
//       return sendErrorResponse(res, 400, 'Please include all required fields: author, authorId, location, content.');
//     }

//     const newPost = new Post({
//       author,
//       authorId,
//       location,
//       content,
//       isImportant: isImportant || false,
//       allowComments: allowComments !== undefined ? allowComments : true,
//       requireConfirmation: requireConfirmation || false,
//       files: files || [],
//       date: new Date(),
//     });

//     const post = await newPost.save();

//     // After saving, find the newly created post and populate its author details
//     const createdPostWithDetails = await Post.findById(post._id)
//       .populate('authorId', 'firstName lastName profilePicture');

//     // Format the post using the helper function for consistency
//     const formattedCreatedPost = formatPostResponse(createdPostWithDetails);

//     res.status(201).json(formattedCreatedPost);
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not create post.');
//   }
// });

// // @route   GET /all (becomes /newsfeed/posts/all in app.js)
// router.get('/all', async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .populate('authorId', 'firstName lastName profilePicture')
//       .populate({ // NEW POPULATE FOR COMMENTS
//         path: 'commentsList.user',
//         select: 'firstName lastName profilePicture'
//       })
//       .sort({ date: -1 });

//     // Map and format each post
//     const formattedPosts = posts.map(post => formatPostResponse(post));

//     res.json(formattedPosts);
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not retrieve posts.');
//   }
// });

// // @route   GET /important (becomes /newsfeed/posts/important in app.js)
// router.get('/important', async (req, res) => {
//   try {
//     const importantPosts = await Post.find({ isImportant: true })
//       .populate('authorId', 'firstName lastName profilePicture')
//       .populate({ // NEW POPULATE FOR COMMENTS
//         path: 'commentsList.user',
//         select: 'firstName lastName profilePicture'
//       })
//       .sort({ date: -1 });

//     const formattedImportantPosts = importantPosts.map(post => formatPostResponse(post));

//     res.json(formattedImportantPosts);
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not retrieve important posts.');
//   }
// });

// // @route   GET /your/:userId (becomes /newsfeed/posts/your/:userId in app.js)
// router.get('/your/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return sendErrorResponse(res, 400, 'Invalid user ID format.');
//     }
//     const yourPosts = await Post.find({ authorId: userId })
//       .populate('authorId', 'firstName lastName profilePicture')
//       .populate({ // NEW POPULATE FOR COMMENTS
//         path: 'commentsList.user',
//         select: 'firstName lastName profilePicture'
//       })
//       .sort({ date: -1 });

//     const formattedYourPosts = yourPosts.map(post => formatPostResponse(post));

//     res.json(formattedYourPosts);
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not retrieve your posts.');
//   }
// });

// // @route   PUT /like/:id (becomes /newsfeed/posts/like/:id in app.js)
// router.put('/like/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.body;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendErrorResponse(res, 400, 'Invalid post ID format.');
//     }
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return sendErrorResponse(res, 400, 'Invalid user ID for liking.');
//     }
//     const post = await Post.findById(id);
//     if (!post) {
//       return sendErrorResponse(res, 404, 'Post not found.');
//     }
//     const hasLiked = post.likedBy.includes(userId);
//     if (hasLiked) {
//       post.likes = Math.max(0, post.likes - 1);
//       post.likedBy = post.likedBy.filter((user) => user.toString() !== userId);
//     } else {
//       post.likes += 1;
//       post.likedBy.push(userId);
//     }
//     await post.save();

//     // After updating like, fetch the post again with populated author and comments details
//     const updatedPostWithDetails = await Post.findById(post._id)
//       .populate('authorId', 'firstName lastName profilePicture')
//       .populate({
//         path: 'commentsList.user',
//         select: 'firstName lastName profilePicture'
//       });

//     const formattedUpdatedPost = formatPostResponse(updatedPostWithDetails);

//     res.json(formattedUpdatedPost);
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not toggle like.');
//   }
// });

// // @route   POST /comment/:id (becomes /newsfeed/posts/comment/:id in app.js)
// router.post('/comment/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId, commentText } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendErrorResponse(res, 400, 'Invalid post ID format.');
//     }
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return sendErrorResponse(res, 400, 'Invalid user ID for commenting.');
//     }
//     if (!commentText) {
//       return sendErrorResponse(res, 400, 'Comment text is required.');
//     }

//     const post = await Post.findById(id);
//     if (!post) {
//       return sendErrorResponse(res, 404, 'Post not found.');
//     }

//     const newComment = { user: userId, text: commentText, createdAt: new Date() };
//     post.commentsList.push(newComment);
//     post.comments = post.commentsList.length;
//     await post.save();

//     // After saving, fetch the updated post and populate the commentsList.user
//     const updatedPost = await Post.findById(id)
//       .populate({
//         path: 'commentsList.user',
//         select: 'firstName lastName profilePicture'
//       });

//     // Manually format commentsList to include profile pictures and formatted names
//     const formattedCommentsList = updatedPost.commentsList.map(comment => {
//       // Check if comment.user was populated
//       if (comment.user && typeof comment.user === 'object' && comment.user._id) {
//         return {
//           _id: comment._id,
//           text: comment.text,
//           createdAt: comment.createdAt,
//           user: `${comment.user.firstName} ${comment.user.lastName}`,
//           userId: comment.user._id,
//           userProfilePicture: comment.user.profilePicture,
//         };
//       } else {
//         // Fallback for comments where user might not be populated or is just a string ID
//         return {
//           _id: comment._id,
//           text: comment.text,
//           createdAt: comment.createdAt,
//           user: comment.user, // Assuming original 'user' if not populated, might be just an ID
//           userId: comment.user,
//           userProfilePicture: null,
//         };
//       }
//     });

//     res.status(201).json(formattedCommentsList); // Send the formatted comments list
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not add comment.');
//   }
// });

// // @route   DELETE /:id (becomes /newsfeed/posts/:id in app.js)
// router.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendErrorResponse(res, 400, 'Invalid post ID format.');
//     }
//     const post = await Post.findById(id);
//     if (!post) {
//       return sendErrorResponse(res, 404, 'Post not found.');
//     }
//     await Post.deleteOne({ _id: id });
//     res.json({ message: 'Post removed' });
//   } catch (err) {
//     console.error(err.message);
//     sendErrorResponse(res, 500, 'Server Error: Could not delete post.');
//   }
// });

// module.exports = router;


// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/user'); // Make sure User model is imported with correct casing
const mongoose = require('mongoose');

// Import authentication and error handling middleware
// const { protect, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const auth = require('../middleware/auth');

// Helper function to format a single post object after population
const formatPostResponse = (post) => {
    // Convert Mongoose document to plain JS object to allow modification
    const postObject = post.toObject({ getters: true, virtuals: false });

    // Handle post author details (assuming authorId is populated)
    if (postObject.authorId && typeof postObject.authorId === 'object' && postObject.authorId._id) {
        postObject.author = `${postObject.authorId.firstName} ${postObject.authorId.lastName}`;
        postObject.authorProfilePicture = postObject.authorId.profilePicture;
        postObject.authorId = postObject.authorId._id; // Keep just the ID
    } else {
        // Fallback if authorId was not populated or is just an ID string
        postObject.author = postObject.author || 'Unknown User';
        postObject.authorProfilePicture = null;
    }

    // Handle comments list details (assuming commentsList.user is populated)
    if (postObject.commentsList && postObject.commentsList.length > 0) {
        postObject.commentsList = postObject.commentsList.map(comment => {
            if (comment.user && typeof comment.user === 'object' && comment.user._id) {
                return {
                    _id: comment._id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    user: `${comment.user.firstName} ${comment.user.lastName}`, // Formatted commenter name
                    userId: comment.user._id, // Commenter's ID
                    userProfilePicture: comment.user.profilePicture, // Commenter's profile picture
                };
            } else {
                // Fallback for comments where user might not be populated or is just a string ID
                return {
                    _id: comment._id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    user: comment.user || 'Unknown Commenter', // Use original 'user' string or default
                    userId: comment.user, // Keep original user field if it's an ID string
                    userProfilePicture: null, // No profile picture if user not found/populated
                };
            }
        });
    } else {
        postObject.commentsList = []; // Ensure it's an empty array if no comments
    }

    return postObject;
};


// @route   POST / (becomes /newsfeed/posts in app.js)
// Create a new post for the authenticated user's organization
router.post('/', auth.protect, auth.authorizeRoles('admin', 'manager', 'employee', 'careWorker'), asyncHandler(async (req, res, next) => {
    const { location, content, isImportant, allowComments, requireConfirmation, files } = req.body;
    const authorId = req.user.id; // Get authorId from authenticated user
    const organizationId = req.organizationId; // Get organizationId from authenticated user

    if (!location || !content) {
        return next(new ErrorResponse('Please include all required fields: location, content.', 400));
    }

    // Construct author name from authenticated user's details
    const author = `${req.user.firstName} ${req.user.lastName}`;

    const newPost = new Post({
        author,
        authorId,
        location,
        content,
        isImportant: isImportant || false,
        allowComments: allowComments !== undefined ? allowComments : true,
        requireConfirmation: requireConfirmation || false,
        files: files || [],
        date: new Date(),
        organization: organizationId, // CRITICAL: Assign post to the user's organization
    });

    const post = await newPost.save();

    // After saving, find the newly created post and populate its author details
    const createdPostWithDetails = await Post.findById(post._id)
        .populate('authorId', 'firstName lastName profilePicture');

    // Format the post using the helper function for consistency
    const formattedCreatedPost = formatPostResponse(createdPostWithDetails);

    res.status(201).json(formattedCreatedPost);
}));

// @route   GET /all (becomes /newsfeed/posts/all in app.js)
// Get all posts for the authenticated user's organization
router.get('/all', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const posts = await Post.find({ organization: organizationId }) // CRITICAL: Filter by organization
        .populate('authorId', 'firstName lastName profilePicture')
        .populate({ // NEW POPULATE FOR COMMENTS
            path: 'commentsList.user',
            select: 'firstName lastName profilePicture'
        })
        .sort({ date: -1 });

    // Map and format each post
    const formattedPosts = posts.map(post => formatPostResponse(post));

    res.json(formattedPosts);
}));

// @route   GET /important (becomes /newsfeed/posts/important in app.js)
// Get all important posts for the authenticated user's organization
router.get('/important', auth.protect, asyncHandler(async (req, res, next) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    const importantPosts = await Post.find({ isImportant: true, organization: organizationId }) // CRITICAL: Filter by organization
        .populate('authorId', 'firstName lastName profilePicture')
        .populate({ // NEW POPULATE FOR COMMENTS
            path: 'commentsList.user',
            select: 'firstName lastName profilePicture'
        })
        .sort({ date: -1 });

    const formattedImportantPosts = importantPosts.map(post => formatPostResponse(post));

    res.json(formattedImportantPosts);
}));

// @route   GET /your/:userId (becomes /newsfeed/posts/your/:userId in app.js)
// Get posts by a specific user within the authenticated user's organization
router.get('/your/:userId', auth.protect, asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorResponse('Invalid user ID format.', 400));
    }

    const yourPosts = await Post.find({ authorId: userId, organization: organizationId }) // CRITICAL: Filter by organization
        .populate('authorId', 'firstName lastName profilePicture')
        .populate({ // NEW POPULATE FOR COMMENTS
            path: 'commentsList.user',
            select: 'firstName lastName profilePicture'
        })
        .sort({ date: -1 });

    const formattedYourPosts = yourPosts.map(post => formatPostResponse(post));

    res.json(formattedYourPosts);
}));

// @route   PUT /like/:id (becomes /newsfeed/posts/like/:id in app.js)
// Toggle like on a post within the authenticated user's organization
router.put('/like/:id', auth.protect, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; // Get userId from authenticated user
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid post ID format.', 400));
    }
    // userId is already validated by `protect` middleware

    const post = await Post.findOne({ _id: id, organization: organizationId }); // CRITICAL: Filter by organization
    if (!post) {
        return next(new ErrorResponse('Post not found in your organization.', 404));
    }

    const hasLiked = post.likedBy.includes(userId);
    if (hasLiked) {
        post.likes = Math.max(0, post.likes - 1);
        post.likedBy = post.likedBy.filter((user) => user.toString() !== userId.toString()); // Ensure string comparison
    } else {
        post.likes += 1;
        post.likedBy.push(userId);
    }
    await post.save();

    // After updating like, fetch the post again with populated author and comments details
    const updatedPostWithDetails = await Post.findById(post._id)
        .populate('authorId', 'firstName lastName profilePicture')
        .populate({
            path: 'commentsList.user',
            select: 'firstName lastName profilePicture'
        });

    const formattedUpdatedPost = formatPostResponse(updatedPostWithDetails);

    res.json(formattedUpdatedPost);
}));

// @route   POST /comment/:id (becomes /newsfeed/posts/comment/:id in app.js)
// Add a comment to a post within the authenticated user's organization
router.post('/comment/:id', auth.protect, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; // Get userId from authenticated user
    const { commentText } = req.body;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid post ID format.', 400));
    }
    // userId is already validated by `protect` middleware
    if (!commentText) {
        return next(new ErrorResponse('Comment text is required.', 400));
    }

    const post = await Post.findOne({ _id: id, organization: organizationId }); // CRITICAL: Filter by organization
    if (!post) {
        return next(new ErrorResponse('Post not found in your organization.', 404));
    }

    const newComment = { user: userId, text: commentText, createdAt: new Date() };
    post.commentsList.push(newComment);
    post.comments = post.commentsList.length;
    await post.save();

    // After saving, fetch the updated post and populate the commentsList.user
    const updatedPost = await Post.findById(id)
        .populate('authorId', 'firstName lastName profilePicture') // Populate author for consistency
        .populate({
            path: 'commentsList.user',
            select: 'firstName lastName profilePicture'
        });

    // Manually format commentsList to include profile pictures and formatted names
    const formattedCommentsList = updatedPost.commentsList.map(comment => {
        if (comment.user && typeof comment.user === 'object' && comment.user._id) {
            return {
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                user: `${comment.user.firstName} ${comment.user.lastName}`,
                userId: comment.user._id,
                userProfilePicture: comment.user.profilePicture,
            };
        } else {
            return {
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                user: comment.user, // Assuming original 'user' if not populated, might be just an ID
                userId: comment.user,
                userProfilePicture: null,
            };
        }
    });

    // Return the full updated post, not just comments, for better frontend state management
    const formattedUpdatedPost = formatPostResponse(updatedPost);
    res.status(201).json(formattedUpdatedPost);
}));

// @route   DELETE /:id (becomes /newsfeed/posts/:id in app.js)
// Delete a post within the authenticated user's organization
router.delete('/:id', auth.protect, auth.authorizeRoles('admin', 'manager'), asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const organizationId = req.organizationId;

    if (!organizationId) {
        return next(new ErrorResponse('Authentication error: Organization ID not found.', 401));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid post ID format.', 400));
    }

    // Find the post by ID AND ensure it belongs to the current organization
    // Also check if the current user is the author OR an admin/manager to allow deletion
    const post = await Post.findOne({ _id: id, organization: organizationId });

    if (!post) {
        return next(new ErrorResponse('Post not found in your organization.', 404));
    }

    // Authorization check: Only admin/manager OR the author can delete
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && post.authorId.toString() !== req.user.id.toString()) {
        return next(new ErrorResponse('Not authorized to delete this post.', 403));
    }

    await Post.deleteOne({ _id: id, organization: organizationId }); // Ensure deletion is scoped

    res.json({ message: 'Post removed' });
}));

module.exports = router;
