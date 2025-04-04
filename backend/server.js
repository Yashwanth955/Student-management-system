const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require("./route/auth");
const profileRoutes = require("./route/profileRoutes");
const assignmentsRoutes = require("./route/assignmentsRoutes");
const documentsRoutes = require("./route/documentsRoutes");
const reportsRoutes = require("./route/reportsRoutes");
const studentRoutes = require('./route/student');
const teacherRoutes = require('./route/teacher');
const courseRoutes = require('./route/course');
const feeRoutes = require('./route/fee');
const attendanceRoutes = require('./route/attendance');

const app = express();

// Connect to MongoDB if USE_DB is true
if (process.env.USE_DB === 'true') {
  connectDB();
  console.log("✅ MongoDB connection enabled");
} else {
  console.log("ℹ️ Using JSON files for data (MongoDB connection disabled)");
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, 'uploads');
  const assignmentsDir = path.join(uploadsDir, 'assignments');
  const documentsDir = path.join(uploadsDir, 'documents');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log("✅ Created uploads directory");
  }
  
  if (!fs.existsSync(assignmentsDir)) {
    fs.mkdirSync(assignmentsDir);
    console.log("✅ Created assignments upload directory");
  }
  
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir);
    console.log("✅ Created documents upload directory");
  }
}

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the frontend directory
const publicPath = path.join(__dirname, "../frontend/public");
console.log(`ℹ️ Serving static files from: ${publicPath}`);
app.use(express.static(publicPath)); 

// Route handlers for API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/reports", reportsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Route handlers for HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'index.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/admin_dashboard", (req, res) => {
  res.sendFile(path.join(publicPath, "admin_dashboard.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'admin_dashboard.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/student_dashboard", (req, res) => {
  res.sendFile(path.join(publicPath, "student_dashboard.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'student_dashboard.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/teacher_dashboard", (req, res) => {
  res.sendFile(path.join(publicPath, "teacher_dashboard.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'teacher_dashboard.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/student_profile", (req, res) => {
  res.sendFile(path.join(publicPath, "student_profile.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'student_profile.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/student_reports", (req, res) => {
  res.sendFile(path.join(publicPath, "student_reports.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'student_reports.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/student_documents", (req, res) => {
  res.sendFile(path.join(publicPath, "student_documents.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'student_documents.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/student_assignments", (req, res) => {
  res.sendFile(path.join(publicPath, "student_assignments.html"), (err) => {
    if (err) {
      console.error("❌ Error serving 'student_assignments.html':", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Handle 404 errors - must be last route handler
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.originalUrl}`);
  res.status(404).send("404 Not Found");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Available API endpoints:');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/students/register');
  console.log('  GET    /api/students/profile');
  console.log('  PUT    /api/students/profile');
  console.log('  GET    /api/students/notifications');
  console.log('  PUT    /api/students/notifications/:id');
  console.log('  GET    /api/students/fees');
  console.log('  GET    /api/students/attendance');
});
