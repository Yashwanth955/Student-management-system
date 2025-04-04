const express = require('express');
const router = express.Router();
const assignmentsController = require('../controller/assignmentsController');
const authMiddleware = require('../middleware/authmiddle');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Get all assignments for a student
router.get('/', authMiddleware, assignmentsController.getAssignments);

// Get a single assignment by ID
router.get('/:id', authMiddleware, assignmentsController.getAssignment);

// Submit an assignment (with file upload)
router.post('/:id/submit', authMiddleware, upload.array('files', 5), assignmentsController.submitAssignment);

module.exports = router; 