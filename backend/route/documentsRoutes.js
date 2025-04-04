const express = require('express');
const router = express.Router();
const documentsController = require('../controller/documentsController');
const authMiddleware = require('../middleware/authmiddle');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Get all documents for a student
router.get('/', authMiddleware, documentsController.getDocuments);

// Get recent documents
router.get('/recent', authMiddleware, documentsController.getRecentDocuments);

// Get important documents
router.get('/important', authMiddleware, documentsController.getImportantDocuments);

// Upload a new document (with file upload)
router.post('/upload', authMiddleware, upload.single('file'), documentsController.uploadDocument);

// Delete a document
router.delete('/:id', authMiddleware, documentsController.deleteDocument);

module.exports = router; 