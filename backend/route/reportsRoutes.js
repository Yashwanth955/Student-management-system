const express = require('express');
const router = express.Router();
const reportsController = require('../controller/reportsController');
const authMiddleware = require('../middleware/authmiddle');

// Get all semesters for a student
router.get('/semesters', authMiddleware, reportsController.getSemesters);

// Get report for a specific semester
router.get('/semesters/:id', authMiddleware, reportsController.getReport);

// Get all reports for a student
router.get('/', authMiddleware, reportsController.getAllReports);

// Get overall academic performance
router.get('/performance/overall', authMiddleware, reportsController.getOverallPerformance);

module.exports = router; 