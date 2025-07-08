require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require('path'); // REQUIRED FOR 'path.join'
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
 
// Import your routes
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const userRoutes = require("./routes/userRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes")
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("../src/routes/profileRoutes"); // Your profile routes
const reportRoutes=require("../src/routes/reportRoutes");
const notificationRoutes=require("../src/routes/notificationRoutes");
const subscribeRoutes=require("../src/routes/subscribeRoutes");
const contactRoutes = require("../src/routes/contactRoutes");
const leaveRoutes=require("../src/routes/leaveRoutes");
const app = express();
 
// ✅ These must come BEFORE any routes
app.use(cors);
app.use(express.json()); // ✅ Moved to the top!
app.use(cookieParser());
app.use(errorHandler);
 
const projectRoot = path.join(__dirname, '..'); // Go up one level from 'backend' to the project root
const uploadsPath = path.join(projectRoot, 'uploads'); // Then append 'uploads'
 
console.log('Static files will be served from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));
app.use("/profile", profileRoutes);
// 3. Middleware for parsing JSON bodies for *other* routes.
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/newsfeed/posts", postRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api",subscribeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/leave", leaveRoutes);

app.use(errorHandler);
 
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => {
      console.error("DB connection failed", err.message);
    });
} else {
  // In test environment, we don't connect to the real DB here
  // We'll handle DB mocking/test DB connection in the test files themselves.
  console.log('Running in test environment. Server not started, DB connection skipped.');
}

module.exports = app;