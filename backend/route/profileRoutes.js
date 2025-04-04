const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const authMiddleware = require('../middleware/authmiddle');

// Get student profile
router.get('/', authMiddleware, profileController.getProfile);

// Update student profile
router.post('/update', authMiddleware, profileController.updateProfile);

// Get academic progress
router.get('/academic/progress', authMiddleware, profileController.getAcademicProgress);

// Get attendance data
router.get('/attendance', authMiddleware, profileController.getAttendance);

module.exports = router; 