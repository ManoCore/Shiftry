import axios from "axios";
 
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true
}); 
 
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
// Authentication
export const loginUser = (data) => API.post("/auth/login", data);
export const signupUser = (data) => API.post("/auth/signup", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = ({ token, newPassword }) => API.put(`/auth/reset-password/${token}`, { newPassword });
 
// User
export const fetchAllUsers = () => API.get("/users/all");
 
export const addUser = (data) => API.post("/users/add", data);
export const updateUserStatus = (data) => API.put("/users/status", data);
export const inviteUser = (userData) => API.post("/users/generate-invite", userData);
export const acceptInvite = (data) => API.post("/users/accept-invite", data);
export const getUserByInviteToken = (token) => API.get(`/users/invite/${token}`);
export const deleteUser = (userId) => API.delete(`/users/${userId}`);

 
// NEW: Send password reset email for a specific user (by admin)
export const sendPasswordResetEmailForUser = (userId) => API.post(`/auth/send-reset-email/${userId}`);
// NEW: Reset login credentials for a specific user (by admin)
export const resetUserLoginCredentials = (userId, newEmail, newPassword) =>
  API.put(`/auth/reset-credentials/${userId}`, { newEmail, newPassword });
 
// Schedule
export const createOrUpdateSchedule = (data) => API.post("/api/schedules/", data);
export const fetchSchedules = (startDate) => API.get(`/api/schedules/week/${startDate}`);
export const fetchSchedulesByWeek = (startDate) => API.get(`/api/schedules/week/${startDate}`);
export const updateSchedule = (id, data) => API.put(`/api/schedules/${id}`, data);
export const deleteSchedule = (id) => API.delete(`/api/schedules/${id}`);
export const fetchSchedulesInRange = (startDate, endDate) => {
  const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
  const formattedEndDate = new Date(endDate).toISOString().split("T")[0];
  return API.get(`/api/schedules/range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
};
export const createSchedulesBatch = (schedulesData) =>
  API.post("/api/schedules/create-schedule", { scheduleIds: schedulesData });
export const publishSchedules = (scheduleIds) =>
  API.post("/api/schedules/publish", { scheduleIds });
 
// Location
export const fetchLocations = () => API.get("/api/locations");
export const addLocation = (locationData) => API.post("/api/locations", locationData);
export const updateLocation = (locationId, locationData) =>
  API.put(`/api/locations/${locationId}`, locationData);
export const deleteLocation = (locationId) => API.delete(`/api/locations/${locationId}`);

 
// Newsfeed Posts
export const createPost = (data) => API.post("/newsfeed/posts", data);
export const fetchAllPosts = () => API.get("/newsfeed/posts/all");
export const fetchImportantPosts = () => API.get("/newsfeed/posts/important");
export const fetchYourPosts = (userId) => API.get(`/newsfeed/posts/your/${userId}`);
export const toggleLikePost = (postId, userId) =>
  API.put(`/newsfeed/posts/like/${postId}`, { userId });
export const addCommentToPost = (postId, commentData) =>
  API.post(`/newsfeed/posts/comment/${postId}`, commentData);
export const deletePost = (postId) => API.delete(`/newsfeed/posts/${postId}`);
 
export const updateUserById = (userId, formData) =>
  API.put(`/users/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Important for sending files and text
    },
  });
// Profile Routes
export const fetchUserProfile = () => API.get("/profile/me");
export const updateUserProfile = (formData) =>
  API.put("/profile/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const fetchUserById = (userId) => API.get(`/users/${userId}`);
  //notificationRoutes
  // Notification Routes
  export const fetchNotifications = async () => {
  try {
    const response = await API.get("/api/notifications");
    // console.log("API.js: Received notifications data from backend:", response.data); // <--- ADD THIS LOG
    // console.log("API.js: Type of received data:", typeof response.data, Array.isArray(response.data) ? " (Is Array)" : " (Is NOT Array)"); // <--- ADD THIS LOG
    return response.data;
  } catch (error) {
    console.error("API.js: Error in fetchNotifications:", error.response?.data || error.message);
    throw error; // Re-throw to propagate to component's catch block
  }
};
export const fetchUnreadNotificationCount = async () => {
    // console.log("api.js: Inside fetchUnreadNotificationCount - Attempting API call...");
    try {
        const { data } = await API.get('/api/notifications/unread');
        // console.log("api.js: fetchUnreadNotificationCount - Received data:", data);
        return data;
    } catch (error) {
        console.error("api.js: fetchUnreadNotificationCount - Error:", error.response?.data || error.message);
        throw error; // Re-throw to propagate to the calling component
    }
};
// Note: This POST endpoint is typically used internally by the backend (e.g., when a schedule is published).
// You might not need to call this directly from the frontend unless there's a specific use case.
export const createNotification = (data) => API.post("/api/notifications", data);
export const markNotificationAsRead = (id) => API.put(`/api/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.put("/api/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/api/notifications/${id}`);
export const clearAllNotifications = () => API.delete("/api/notifications"); // Deletes all for the user
 
//subscribe
export const subscribeToNewsletter = (email) => API.post("/api/subscribe", { email });
// Contact Form
export const submitContactForm = (formData) => API.post("/api/contact", formData);
// Leave Application
export const submitLeaveApplication = (leaveData) => API.post("/api/leave", leaveData);
export const fetchMyLeaveApplications = () => API.get("/api/leave/my-applications"); // Added
export const fetchAllLeaveApplications = () => API.get("/api/leave/all"); // Added
export const updateLeaveApplicationStatus = (id, status) => API.put(`/api/leave/${id}/status`, { status });
export const fetchUserLeaves = (userId) => API.get(`/api/leave/user/${userId}`); // NEWLY ADDED

export const fetchMyAssignedShifts = () => API.get("/api/schedules/my-assigned-shifts");