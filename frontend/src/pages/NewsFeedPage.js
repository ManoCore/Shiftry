// import React, { useState, useEffect ,useCallback } from 'react';
// import {
//   createPost,
//   fetchAllPosts,
//   fetchImportantPosts,
//   fetchYourPosts,
//   toggleLikePost,
//   addCommentToPost,
//   deletePost,
//   fetchLocations,
// } from '../api';
// import { useAuth } from '../context/AuthContext';

// // Helper function to get first name
// const getFirstName = (fullName) => {
//   if (!fullName) return '';
//   const parts = fullName.trim().split(' ');
//   return parts.length > 0 ? parts[0] : '';
// };

// const NewsfeedPage = () => {
//   const { user, isLoading: authLoading } = useAuth();
//   const [posts, setPosts] = useState([]);
//   const [importantPosts, setImportantPosts] = useState([]);
//   const [yourPosts, setYourPosts] = useState([]);
//   const [newPostContent, setNewPostContent] = useState('');
//   const [newPostLocation, setNewPostLocation] = useState('');
//   const [isImportant, setIsImportant] = useState(false);
//   const [activeTab, setActiveTab] = useState('all');
//   const [commentText, setCommentText] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isCreatePostPopupOpen, setIsCreatePostPopupOpen] = useState(false);
//   const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState(null);
//   const [allowComments, setAllowComments] = useState(true);
//   const [requireConfirmation, setRequireConfirmation] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [locationSearchQuery, setLocationSearchQuery] = useState('');
//   const [locations, setLocations] = useState([]);

//   const currentUserId = user?.id;
//   const currentUserName = user?.firstName && user?.lastName
//                           ? `${user.firstName} ${user.lastName}`
//                           : user?.firstName || user?.lastName || '';

//   const currentUserFirstName = getFirstName(currentUserName);

//   const fetchPosts = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const allPostsRes = await fetchAllPosts();
//       setPosts(allPostsRes.data);

//       const importantPostsRes = await fetchImportantPosts();
//       setImportantPosts(importantPostsRes.data);

//       if (currentUserId) {
//         const yourPostsRes = await fetchYourPosts(currentUserId);
//         setYourPosts(yourPostsRes.data);
//       }
//     } catch (err) {
//       console.error('Error fetching posts:', err);
//       setError('Failed to fetch posts. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [currentUserId]);

//   useEffect(() => {
//     if (!authLoading && user) {
//       console.log("AuthContext User (after load/change):", user);
//       fetchPosts();
//     } else if (!authLoading && !user) {
//       console.log("AuthContext: No user logged in.");
//       fetchPosts();
//     }
//   }, [authLoading, user, fetchPosts])

//   useEffect(() => {
//     const getLocations = async () => {
//       try {
//         const response = await fetchLocations();
//         setLocations(response.data);
//       } catch (err) {
//         console.error('Error fetching locations:', err);
//       }
//     };
//     if (!authLoading && user) {
//       fetchPosts();
//     }
//     getLocations();
//   }, [authLoading, user]);

//   const handleCreatePost = async (e) => {
//     e.preventDefault();
//     if (!newPostContent.trim() || !newPostLocation.trim()) {
//       alert('Please enter post content and location.');
//       return;
//     }
//     const authorName = user?.firstName && user?.lastName
//                        ? `${user.firstName} ${user.lastName}`
//                        : user?.firstName || user?.lastName || 'Unknown User';

//     if (!user || !user.id || !authorName.trim()) {
//       setError("User information not available. Please log in to create a post.");
//       setIsCreatePostPopupOpen(false);
//       return;
//     }

//     try {
//       await createPost({
//         author: authorName,
//         authorId: user.id,
//         authorProfilePicture: user?.profilePicture,
//         location: newPostLocation,
//         content: newPostContent,
//         isImportant,
//         allowComments,
//         requireConfirmation,
//         files: selectedFiles.map(file => file.name),
//       });
//       setNewPostContent('');
//       setNewPostLocation('');
//       setIsImportant(false);
//       setAllowComments(true);
//       setRequireConfirmation(false);
//       setSelectedFiles([]);
//       setIsCreatePostPopupOpen(false);
//       fetchPosts();
//     } catch (err) {
//       console.error('Error creating post:', err);
//       setError('Failed to create post. Please try again.');
//     }
//   };

//   const handleToggleLike = async (postId) => {
//     if (!user || !user.id) {
//       setError("User not logged in to like posts.");
//       console.log("Attempted to like without currentUserId:", user);
//       return;
//     }
//     const updatePostInArray = (postArray) =>
//       postArray.map((post) => {
//         if (post._id === postId) {
//           const isLiked = post.likedBy.includes(user.id);
//           return {
//             ...post,
//             likes: isLiked ? post.likes - 1 : post.likes + 1,
//             likedBy: isLiked
//               ? post.likedBy.filter((id) => id !== user.id)
//               : [...post.likedBy, user.id],
//           };
//         }
//         return post;
//       });

//     const prevPosts = [...posts];
//     const prevImportantPosts = [...importantPosts];
//     const prevYourPosts = [...yourPosts];

//     setPosts(updatePostInArray(posts));
//     setImportantPosts(updatePostInArray(importantPosts));
//     setYourPosts(updatePostInArray(yourPosts));

//     try {
//       await toggleLikePost(postId, user.id);
//     } catch (err) {
//       console.error('Error toggling like:', err);
//       setPosts(prevPosts);
//       setImportantPosts(prevImportantPosts);
//       setYourPosts(prevYourPosts);
//       setError('Failed to toggle like. Please try again.');
//     }
//   };

//   const handleAddComment = async (postId) => {
//     const text = commentText[postId];
//     if (!text || !text.trim()) {
//       alert('Please enter a comment.');
//       return;
//     }
//     const userName = user?.firstName && user?.lastName
//                      ? `${user.firstName} ${user.lastName}`
//                      : user?.firstName || user?.lastName || 'Unknown User';

//     if (!user || !userName.trim()) {
//       setError("User information not available. Cannot add comment.");
//       console.log("Attempted to add comment without user name:", user);
//       return;
//     }

//     const newComment = { user: userName, text, userId: user.id }; // Include userId for identification if needed
    
//     // Function to update a single post's comments in an array
//     const updateCommentsInPostArray = (postArray, idToUpdate, commentToAdd) =>
//       postArray.map((post) => {
//         if (post._id === idToUpdate) {
//           // Assuming commentsList is an array on the post object
//           const updatedCommentsList = post.commentsList ? [...post.commentsList, commentToAdd] : [commentToAdd];
//           return {
//             ...post,
//             commentsList: updatedCommentsList,
//             comments: (post.comments || 0) + 1 // Increment comments count
//           };
//         }
//         return post;
//       });

//     // Store previous states for rollback in case of error
//     const prevPosts = [...posts];
//     const prevImportantPosts = [...importantPosts];
//     const prevYourPosts = [...yourPosts];

//     // Optimistically update all relevant post arrays
//     setPosts(updateCommentsInPostArray(posts, postId, newComment));
//     setImportantPosts(updateCommentsInPostArray(importantPosts, postId, newComment));
//     setYourPosts(updateCommentsInPostArray(yourPosts, postId, newComment));
//     setCommentText((prev) => ({ ...prev, [postId]: '' })); // Clear comment input

//     try {
//       // Send comment to the API
//       await addCommentToPost(postId, { userId: user.id, commentText: text });
//       // If successful, no need to call fetchPosts(), UI is already updated
//       setIsCommentsPopupOpen(false);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//       setError('Failed to add comment. Please try again.');
//       // Revert to previous states on error
//       setPosts(prevPosts);
//       setImportantPosts(prevImportantPosts);
//       setYourPosts(prevYourPosts);
//     }
//   };

//   const handleDeletePost = async (postId) => {
//     if (!user || !currentUserId) {
//       setError("User information not available. Cannot delete post.");
//       return;
//     }
//     if (window.confirm('Are you sure you want to delete this post?')) {
//       try {
//         await deletePost(postId);
//         fetchPosts();
//       } catch (err) {
//         console.error('Error deleting post:', err);
//         setError('Failed to delete post. Please try again.');
//       }
//     }
//   };

//   const handleViewChange = (view) => {
//     setActiveTab(view);
//     setIsCommentsPopupOpen(false);
//     setSelectedPostId(null);
//     setSearchQuery('');
//     setLocationSearchQuery('');
//   };

//   const handleFileChange = (e) => {
//     setSelectedFiles(Array.from(e.target.files));
//   };

//   // Filter posts based on search queries
//   const filterPosts = (postList) => {
//     const mainQuery = searchQuery.toLowerCase();
//     const locationQuery = locationSearchQuery.toLowerCase();

//     return postList.filter((post) => {
//       const matchesMainQuery =
//         !mainQuery ||
//         post.content.toLowerCase().includes(mainQuery) ||
//         post.author.toLowerCase().includes(mainQuery) ||
//         post.location.toLowerCase().includes(mainQuery);

//       const matchesLocationQuery =
//         !locationQuery || post.location.toLowerCase().includes(locationQuery);

//       return matchesMainQuery && matchesLocationQuery;
//     });
//   };

//   const renderPosts = (postList) => (
//     <div className="space-y-4">
//       {postList.length === 0 && !loading && (
//         <p className="text-center text-gray-600 mt-4">No posts to display in this section.</p>
//       )}
//       {postList.map((post) => (
//         <div key={post._id} className="bg-white p-4 rounded-lg shadow">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
//                <img
//                                 src={post.authorProfilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
//                                 alt={`${getFirstName(post.author) || 'User'}'s Profile Icon`}
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                     e.target.onerror = null;
//                                     e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
//                                 }}
//                             />
//             </div>
//             <div>
//               <p className="font-semibold">
//                 {post.authorId === user.id ? (
//     <><strong>{currentUserFirstName}</strong> <span className="text-gray-500">from {post.location} - {new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span></>
// ) : (
//     <><strong>{getFirstName(post.author)}</strong> <span className="text-gray-500">from {post.location} - {new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span></>
// )}
//                 {post.isImportant && (
//                   <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2 inline-block">
//                     Important
//                   </span>
//                 )}
//               </p>
//               <p className="text-gray-700">{post.content}</p>
//             </div>
//           </div>
//           <div className="mt-4 flex space-x-4">
//             <button
//               onClick={() => handleToggleLike(post._id)}
//               className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100"
//             >
//               <span className={`text-lg ${post.likedBy.includes(user.id) ? 'text-red-500' : 'text-gray-500'}`}>
//                 {post.likedBy.includes(user.id) ? '❤️' : '🩶'}
//               </span>
//               <span>{post.likedBy.includes(user.id) ? '' : ''}</span>
//               <span className="text-gray-500">{post.likes}</span>
//             </button>
//             <button
//               onClick={() => {
//                 setIsCommentsPopupOpen(true);
//                 setSelectedPostId(post._id);
//               }}
//               className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100"
//             >
//               <span className="text-blue-500">
//                 <img src='/comment.svg' alt="" />
//               </span>
//               <span>Comments</span>
//               <span className="text-gray-500">{post.comments}</span>
//             </button>
//             {post.authorId === user.id && (
//               <button
//                 onClick={() => handleDeletePost(post._id)}
//                 className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-red-500"
//               >
//                 <span>
//                   <img src='/delete.svg' alt="" />
//                 </span>
//                 <span>Delete</span>
//               </button>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-200 p-4 flex flex-col">
//         <h2 className="text-lg font-semibold mb-4">ONBOARDING</h2>
//         <nav className="space-y-2">
//           <button
//             onClick={() => handleViewChange('all')}
//             className={`w-full text-left py-2 px-3 rounded ${activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-300'}`}
//           >
//             ALL POSTS
//           </button>
//           <button
//             onClick={() => handleViewChange('important')}
//             className={`w-full text-left py-2 px-3 rounded ${activeTab === 'important' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-300'}`}
//           >
//             IMPORTANT POSTS
//           </button>
//           <button
//             onClick={() => handleViewChange('your')}
//             className={`w-full text-left py-2 px-3 rounded ${activeTab === 'your' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-300'}`}
//           >
//             YOUR POSTS
//           </button>
//         </nav>
        
//         <div className="mt-6 border-t border-[#B1B1B1] ">
//           <h3 className="text-lg font-semibold mb-2 pt-[25px]">LOCATIONS</h3>
//           <input
//             type="text"
//             placeholder="Search locations..."
//             value={locationSearchQuery}
//             onChange={(e) => setLocationSearchQuery(e.target.value)}
//             className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="mt-2 space-y-2">
//             {/* Dynamically render locations here */}
//             {locations
//               .filter((location) =>
//                 location.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
//               )
//               .map((location) => (
//                 <p key={location._id} className="text-gray-600">
//                   {location.name}
//                 </p>
//               ))}
//             {locations.length === 0 && !loading && (
//                 <p className="text-gray-600">No locations found.</p>
//             )}
//           </div>

//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-6 overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-xl font-semibold">
//             {activeTab === 'all' ? 'NEWS FEED' : activeTab === 'important' ? 'IMPORTANT POSTS' : 'YOUR POSTS'}
//           </h1>
//           <div className="flex items-center space-x-2">
//             <input
//               type="text"
//               placeholder="Search posts..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={() => setIsCreatePostPopupOpen(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               CREATE POST
//             </button>
//           </div>
//         </div>

//         {loading && <p className="text-center text-blue-600 text-xl my-8">Loading posts...</p>}
//         {error && <p className="text-center text-red-600 text-lg my-8 font-semibold">{error}</p>}

//         {/* Post Display Area */}
//         <div className="posts-display-area">
//           {activeTab === 'all' && renderPosts(filterPosts(posts))}
//           {activeTab === 'important' && renderPosts(filterPosts(importantPosts))}
//           {activeTab === 'your' && renderPosts(filterPosts(yourPosts))}
//         </div>
//       </div>

//       {/* Create Post Popup */}
//       {isCreatePostPopupOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Create Post</h2>
//               <button
//                 onClick={() => setIsCreatePostPopupOpen(false)}
//                 className="text-blue-500 text-xl"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Share With</label>
//               <select
//                 value={newPostLocation}
//                 onChange={(e) => setNewPostLocation(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="" disabled>Select Location</option>
//                 {locations.map((location) => (
//                   <option key={location._id} value={location.name}>
//                     {location.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="mb-4">
//               <textarea
//                 placeholder="What's Happening?"
//                 value={newPostContent}
//                 onChange={(e) => setNewPostContent(e.target.value)}
//                 className="w-full h-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="flex items-center space-x-1 cursor-pointer text-blue-500">
//                 <span>&#128279;</span>
//                 <span>Attach Images, Videos, PDFs</span>
//                 <input
//                   type="file"
//                   accept="image/*,video/*,application/pdf"
//                   className="hidden"
//                   multiple
//                   onChange={handleFileChange}
//                 />
//               </label>
//               {selectedFiles.length > 0 && (
//                 <ul className="mt-2 text-sm text-gray-600">
//                   {selectedFiles.map((file, index) => (
//                     <li key={index}>{file.name}</li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             <div className="flex items-center space-x-4 mb-4">
//               <label className="flex justify-start items-start space-x-1">
//                 <input
//                   type="checkbox"
//                   checked={requireConfirmation}
//                   onChange={(e) => setRequireConfirmation(e.target.checked)}
//                   className="form-checkbox mt-[6px]"
//                 />
//                 <span>Require Confirmation</span>
//               </label>
//               {/* <label className="flex justify-start items-start space-x-1">
//                 <input
//                   type="checkbox"
//                   checked={allowComments}
//                   onChange={(e) => setAllowComments(e.target.checked)}
//                   className="form-checkbox mt-[6px]"
//                 />
//                 <span>Allow Comments</span>
//               </label> */}
//               <label className="flex justify-start items-start space-x-1">
//                 <input
//                   type="checkbox"
//                   checked={isImportant}
//                   onChange={(e) => setIsImportant(e.target.checked)}
//                   className="form-checkbox mt-[6px]"
//                 />
//                 <span>Mark as Important</span>
//               </label>
//             </div>
//             <button
//               onClick={handleCreatePost}
//               className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//             >
//               Post
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Comments Popup */}
//       {isCommentsPopupOpen && selectedPostId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Comments</h2>
//               <button
//                 onClick={() => setIsCommentsPopupOpen(false)}
//                 className="text-blue-500 text-xl"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="space-y-4 max-h-60 overflow-y-auto">
//               {posts
//                 .concat(importantPosts, yourPosts)
//                 .find((post) => post._id === selectedPostId)?.commentsList.map((comment, index) => (
//                   <div key={index} className="border-b border-gray-200 pb-2">
//                     <p className="font-semibold">{getFirstName(comment.user)}</p>
//                     <p className="text-gray-700">{comment.text}</p>
//                   </div>
//                 )) || <p className="text-gray-500">No comments yet.</p>}
//             </div>
//             <div className="mt-4 flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Enter Your Comment Here"
//                 value={commentText[selectedPostId] || ''}
//                 onChange={(e) =>
//                   setCommentText((prev) => ({ ...prev, [selectedPostId]: e.target.value }))
//                 }
//                 className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={() => handleAddComment(selectedPostId)}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//               >
//                 SEND
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewsfeedPage;

import React, { useState, useEffect, useCallback } from 'react';
import {
    createPost,
    fetchAllPosts,
    fetchImportantPosts,
    fetchYourPosts,
    toggleLikePost,
    addCommentToPost,
    deletePost,
    fetchLocations,
} from '../api';
import { useAuth } from '../context/AuthContext';

// Helper function to get first name
const getFirstName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.length > 0 ? parts[0] : '';
};

const NewsfeedPage = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [posts, setPosts] = useState([]);
    const [importantPosts, setImportantPosts] = useState([]);
    const [yourPosts, setYourPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [commentText, setCommentText] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreatePostPopupOpen, setIsCreatePostPopupOpen] = useState(false);
    const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [allowComments, setAllowComments] = useState(true); // Retaining this, though commented out in JSX
    const [requireConfirmation, setRequireConfirmation] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [locations, setLocations] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for mobile sidebar

    const currentUserId = user?.id;
    const currentUserName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.lastName || '';

    const currentUserFirstName = getFirstName(currentUserName);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const allPostsRes = await fetchAllPosts();
            setPosts(allPostsRes.data);

            const importantPostsRes = await fetchImportantPosts();
            setImportantPosts(importantPostsRes.data);

            if (currentUserId) {
                const yourPostsRes = await fetchYourPosts(currentUserId);
                setYourPosts(yourPostsRes.data);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to fetch posts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        if (!authLoading && user) {
            console.log("AuthContext User (after load/change):", user);
            fetchPosts();
        } else if (!authLoading && !user) {
            console.log("AuthContext: No user logged in.");
            fetchPosts(); // Still fetch posts even if user is not logged in, but with limited functionality
        }
    }, [authLoading, user, fetchPosts]);

    useEffect(() => {
        const getLocations = async () => {
            try {
                const response = await fetchLocations();
                setLocations(response.data);
            } catch (err) {
                console.error('Error fetching locations:', err);
            }
        };
        // Fetch locations on component mount
        getLocations();
    }, []); // Empty dependency array means this runs once on mount

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() || !newPostLocation.trim()) {
            alert('Please enter post content and location.');
            return;
        }
        const authorName = user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || user?.lastName || 'Unknown User';

        if (!user || !user.id || !authorName.trim()) {
            setError("User information not available. Please log in to create a post.");
            setIsCreatePostPopupOpen(false);
            return;
        }

        try {
            await createPost({
                author: authorName,
                authorId: user.id,
                authorProfilePicture: user?.profilePicture,
                location: newPostLocation,
                content: newPostContent,
                isImportant,
                allowComments,
                requireConfirmation,
                files: selectedFiles.map(file => file.name),
            });
            setNewPostContent('');
            setNewPostLocation('');
            setIsImportant(false);
            setAllowComments(true);
            setRequireConfirmation(false);
            setSelectedFiles([]);
            setIsCreatePostPopupOpen(false);
            fetchPosts();
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post. Please try again.');
        }
    };

    const handleToggleLike = async (postId) => {
        if (!user || !user.id) {
            setError("User not logged in to like posts.");
            console.log("Attempted to like without currentUserId:", user);
            return;
        }
        const updatePostInArray = (postArray) =>
            postArray.map((post) => {
                if (post._id === postId) {
                    const isLiked = post.likedBy.includes(user.id);
                    return {
                        ...post,
                        likes: isLiked ? post.likes - 1 : post.likes + 1,
                        likedBy: isLiked
                            ? post.likedBy.filter((id) => id !== user.id)
                            : [...post.likedBy, user.id],
                    };
                }
                return post;
            });

        // Optimistically update the UI
        setPosts(prevPosts => updatePostInArray(prevPosts));
        setImportantPosts(prevImportantPosts => updatePostInArray(prevImportantPosts));
        setYourPosts(prevYourPosts => updatePostInArray(prevYourPosts));

        try {
            await toggleLikePost(postId, user.id);
        } catch (err) {
            console.error('Error toggling like:', err);
            // Revert changes on error
            fetchPosts(); // Re-fetch to ensure data consistency
            setError('Failed to toggle like. Please try again.');
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentText[postId];
        if (!text || !text.trim()) {
            alert('Please enter a comment.');
            return;
        }
        const userName = user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || user?.lastName || 'Unknown User';

        if (!user || !userName.trim()) {
            setError("User information not available. Cannot add comment.");
            console.log("Attempted to add comment without user name:", user);
            return;
        }

        const newComment = { user: userName, text, userId: user.id };

        const updateCommentsInPostArray = (postArray, idToUpdate, commentToAdd) =>
            postArray.map((post) => {
                if (post._id === idToUpdate) {
                    const updatedCommentsList = post.commentsList ? [...post.commentsList, commentToAdd] : [commentToAdd];
                    return {
                        ...post,
                        commentsList: updatedCommentsList,
                        comments: (post.comments || 0) + 1
                    };
                }
                return post;
            });

        // Optimistically update all relevant post arrays
        setPosts(prevPosts => updateCommentsInPostArray(prevPosts, postId, newComment));
        setImportantPosts(prevImportantPosts => updateCommentsInPostArray(prevImportantPosts, postId, newComment));
        setYourPosts(prevYourPosts => updateCommentsInPostArray(prevYourPosts, postId, newComment));
        setCommentText((prev) => ({ ...prev, [postId]: '' })); // Clear comment input

        try {
            await addCommentToPost(postId, { userId: user.id, commentText: text });
            // No need to fetchPosts() if optimistic update is reliable and successful
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment. Please try again.');
            fetchPosts(); // Revert to actual state on error
        }
    };

    const handleDeletePost = async (postId) => {
        if (!user || !currentUserId) {
            setError("User information not available. Cannot delete post.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(postId);
                fetchPosts();
            } catch (err) {
                console.error('Error deleting post:', err);
                setError('Failed to delete post. Please try again.');
            }
        }
    };

    const handleViewChange = (view) => {
        setActiveTab(view);
        setIsCommentsPopupOpen(false);
        setSelectedPostId(null);
        setSearchQuery('');
        setLocationSearchQuery('');
        setIsSidebarOpen(false); // Close sidebar after selection on mobile
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    // Filter posts based on search queries
    const filterPosts = (postList) => {
        const mainQuery = searchQuery.toLowerCase();
        const locationQuery = locationSearchQuery.toLowerCase();

        return postList.filter((post) => {
            const matchesMainQuery =
                !mainQuery ||
                post.content.toLowerCase().includes(mainQuery) ||
                post.author.toLowerCase().includes(mainQuery) ||
                post.location.toLowerCase().includes(mainQuery);

            const matchesLocationQuery =
                !locationQuery || post.location.toLowerCase().includes(locationQuery);

            return matchesMainQuery && matchesLocationQuery;
        });
    };

    const renderPosts = (postList) => (
        <div className="space-y-4">
            {postList.length === 0 && !loading && (
                <p className="text-center text-gray-600 mt-4">No posts to display in this section.</p>
            )}
            {postList.map((post) => (
                <div key={post._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                            <img
                                src={post.authorProfilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                                alt={`${getFirstName(post.author) || 'User'}'s Profile Icon`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-semibold text-sm">
                                {post.authorId === user.id ? (
                                    <><strong>{currentUserFirstName}</strong></>
                                ) : (
                                    <><strong>{getFirstName(post.author)}</strong></>
                                )}
                                <span className="text-gray-500 text-xs ml-1">
                                    from {post.location} - {new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                </span>
                            </p>
                            {post.isImportant && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block w-fit">
                                    Important
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">{post.content}</p>

                    {/* Display attached files if any */}
                    {post.files && post.files.length > 0 && (
                        <div className="mt-2 mb-4">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                                {post.files.map((file, index) => {
                                    const fileExtension = file.split('.').pop().toLowerCase();
                                    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
                                    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
                                    const isPdf = fileExtension === 'pdf';

                                    // Placeholder for file paths (adjust as per your backend storage)
                                    const filePath = `/uploads/${file}`; // Example path, replace with actual

                                    return (
                                        <div key={index} className="flex items-center text-blue-600 text-sm">
                                            {isImage && <img src={filePath} alt={file} className="max-w-24 max-h-24 rounded-md object-cover mr-1" />}
                                            {isVideo && (
                                                <video controls className="max-w-24 max-h-24 rounded-md object-cover mr-1">
                                                    <source src={filePath} type={`video/${fileExtension}`} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                            {isPdf && <img src="/pdf-icon.png" alt="PDF" className="w-6 h-6 mr-1" />} {/* Use a generic PDF icon */}
                                            <a href={filePath} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {file}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2 text-xs"> {/* Adjusted gap and text size */}
                        <button
                            onClick={() => handleToggleLike(post._id)}
                            className="flex items-center space-x-1 px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            <span className={`text-lg ${post.likedBy.includes(user.id) ? 'text-red-500' : 'text-gray-500'}`}>
                                {post.likedBy.includes(user.id) ? '❤️' : '🩶'}
                            </span>
                            <span className="text-gray-500">{post.likes}</span>
                        </button>
                        {post.allowComments && ( // Only show comment button if comments are allowed
                            <button
                                onClick={() => {
                                    setIsCommentsPopupOpen(true);
                                    setSelectedPostId(post._id);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                <span className="text-blue-500">
                                    <img src='/comment.svg' alt="Comment" className="w-4 h-4" />
                                </span>
                                <span>Comments</span>
                                <span className="text-gray-500">{post.comments}</span>
                            </button>
                        )}
                        {(post.authorId === user.id || user.role === 'admin' || user.role === 'manager') && ( // Admins/Managers can also delete
                            <button
                                onClick={() => handleDeletePost(post._id)}
                                className="flex items-center space-x-1 px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-red-500"
                            >
                                <span>
                                    <img src='/delete.svg' alt="Delete" className="w-4 h-4" />
                                </span>
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            {/* Mobile Header for Sidebar Toggle */}
            <div className="md:hidden bg-gray-200 p-4 flex justify-between items-center border-b border-gray-300">
                <h2 className="text-lg font-semibold">Newsfeed</h2>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-md bg-gray-300 hover:bg-gray-400"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            {/* Sidebar - Conditional rendering for mobile */}
            <div className={`
                ${isSidebarOpen ? 'block' : 'hidden'} 
                md:block 
                w-full md:w-64 bg-gray-200 p-4 flex-shrink-0 
                overflow-y-auto border-b md:border-r border-gray-300
            `}>
                <h2 className="text-lg font-semibold mb-4">ONBOARDING</h2>
                <nav className="space-y-2">
                    <button
                        onClick={() => handleViewChange('all')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-300'}`}
                    >
                        ALL POSTS
                    </button>
                    <button
                        onClick={() => handleViewChange('important')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'important' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-300'}`}
                    >
                        IMPORTANT POSTS
                    </button>
                    <button
                        onClick={() => handleViewChange('your')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'your' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-300'}`}
                    >
                        YOUR POSTS
                    </button>
                </nav>

                <div className="mt-6 border-t border-[#B1B1B1] pt-[25px]">
                    <h3 className="text-lg font-semibold mb-2">LOCATIONS</h3>
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={locationSearchQuery}
                        onChange={(e) => setLocationSearchQuery(e.target.value)}
                        className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto custom-scrollbar"> {/* Added scrollbar */}
                        {locations
                            .filter((location) =>
                                location.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
                            )
                            .map((location) => (
                                <p key={location._id} className="text-gray-600 text-sm">
                                    {location.name}
                                </p>
                            ))}
                        {locations.length === 0 && !loading && (
                            <p className="text-gray-600 text-sm">No locations found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto"> {/* Adjusted padding */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"> {/* Adjusted for stacking on mobile */}
                    <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-0"> {/* Larger title on mobile */}
                        {activeTab === 'all' ? 'NEWS FEED' : activeTab === 'important' ? 'IMPORTANT POSTS' : 'YOUR POSTS'}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full md:w-auto space-y-2 sm:space-y-0 sm:space-x-2"> {/* Stack on small screens */}
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-auto p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                            onClick={() => setIsCreatePostPopupOpen(true)}
                            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                            CREATE POST
                        </button>
                    </div>
                </div>

                {loading && <p className="text-center text-blue-600 text-xl my-8">Loading posts...</p>}
                {error && <p className="text-center text-red-600 text-lg my-8 font-semibold">{error}</p>}

                {/* Post Display Area */}
                <div className="posts-display-area">
                    {activeTab === 'all' && renderPosts(filterPosts(posts))}
                    {activeTab === 'important' && renderPosts(filterPosts(importantPosts))}
                    {activeTab === 'your' && renderPosts(filterPosts(yourPosts))}
                </div>
            </div>

            {/* Create Post Popup */}
            {isCreatePostPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> {/* Added z-50 */}
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Create Post</h2>
                            <button
                                onClick={() => setIsCreatePostPopupOpen(false)}
                                className="text-blue-500 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Share With</label>
                            <select
                                value={newPostLocation}
                                onChange={(e) => setNewPostLocation(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="" disabled>Select Location</option>
                                {locations.map((location) => (
                                    <option key={location._id} value={location.name}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <textarea
                                placeholder="What's Happening?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full h-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center space-x-1 cursor-pointer text-blue-500 text-sm">
                                <span>&#128279;</span>
                                <span>Attach Images, Videos, PDFs</span>
                                <input
                                    type="file"
                                    accept="image/*,video/*,application/pdf"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </label>
                            {selectedFiles.length > 0 && (
                                <ul className="mt-2 text-sm text-gray-600">
                                    {selectedFiles.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2 mb-4 text-sm"> {/* Stack checkboxes on mobile */}
                            <label className="flex items-start space-x-1">
                                <input
                                    type="checkbox"
                                    checked={requireConfirmation}
                                    onChange={(e) => setRequireConfirmation(e.target.checked)}
                                    className="form-checkbox mt-[2px]"
                                />
                                <span>Require Confirmation</span>
                            </label>
                            {/* <label className="flex items-start space-x-1">
                                <input
                                    type="checkbox"
                                    checked={allowComments}
                                    onChange={(e) => setAllowComments(e.target.checked)}
                                    className="form-checkbox mt-[2px]"
                                />
                                <span>Allow Comments</span>
                            </label> */}
                            <label className="flex items-start space-x-1">
                                <input
                                    type="checkbox"
                                    checked={isImportant}
                                    onChange={(e) => setIsImportant(e.target.checked)}
                                    className="form-checkbox mt-[2px]"
                                />
                                <span>Mark as Important</span>
                            </label>
                        </div>
                        <button
                            onClick={handleCreatePost}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}

            {/* Comments Popup */}
            {isCommentsPopupOpen && selectedPostId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> {/* Added z-50 */}
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Comments</h2>
                            <button
                                onClick={() => setIsCommentsPopupOpen(false)}
                                className="text-blue-500 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2"> {/* Added pr-2 for scrollbar */}
                            {(() => {
                                const post = posts.concat(importantPosts, yourPosts).find((p) => p._id === selectedPostId);
                                const comments = post?.commentsList;

                                if (!comments || comments.length === 0) {
                                    return <p className="text-gray-500 text-sm">No comments yet.</p>;
                                }

                                return comments.map((comment, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-2 text-sm">
                                        <p className="font-semibold">{getFirstName(comment.user)}</p>
                                        <p className="text-gray-700">{comment.text}</p>
                                    </div>
                                ));
                            })()}
                        </div>
                        {/* Only allow adding comments if the post explicitly allows it */}
                        {posts.concat(importantPosts, yourPosts).find((p) => p._id === selectedPostId)?.allowComments && (
                            <div className="mt-4 flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Enter Your Comment Here"
                                    value={commentText[selectedPostId] || ''}
                                    onChange={(e) =>
                                        setCommentText((prev) => ({ ...prev, [selectedPostId]: e.target.value }))
                                    }
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                    onClick={() => handleAddComment(selectedPostId)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex-shrink-0"
                                >
                                    SEND
                                </button>
                            </div>
                        )}
                        {!posts.concat(importantPosts, yourPosts).find((p) => p._id === selectedPostId)?.allowComments && (
                            <p className="mt-4 text-center text-gray-500 text-sm">Comments are disabled for this post.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsfeedPage;