const Document = require('../model/document');
const Student = require('../model/student');
const fs = require('fs');
const path = require('path');

// Get all documents for a student
exports.getDocuments = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const type = req.query.type || 'all'; // Filter by document type
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check for MongoDB connection
    if (process.env.USE_DB === 'true') {
      // First, find the student
      const student = await Student.findOne({ email });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Then, find the documents
      let query = { student: student._id };
      
      if (type !== 'all') {
        query.type = type;
      }
      
      const documents = await Document.find(query).sort({ uploadDate: -1 });
      
      return res.json({
        success: true,
        data: documents
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/documents.json');
      const documents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Filter by type if needed
      let filteredDocuments = documents;
      
      if (type !== 'all') {
        filteredDocuments = documents.filter(d => d.type === type);
      }
      
      return res.json(filteredDocuments);
    }
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching documents'
    });
  }
};

// Get recent documents
exports.getRecentDocuments = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const limit = req.query.limit || 5; // Number of recent documents to fetch
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check for MongoDB connection
    if (process.env.USE_DB === 'true') {
      // First, find the student
      const student = await Student.findOne({ email });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Then, find the recent documents
      const documents = await Document.find({ student: student._id })
        .sort({ uploadDate: -1 })
        .limit(parseInt(limit));
      
      return res.json({
        success: true,
        data: documents
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/documents.json');
      const documents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Sort by upload date and limit the number of documents
      const recentDocuments = [...documents]
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, limit);
      
      return res.json(recentDocuments);
    }
  } catch (error) {
    console.error('❌ Error fetching recent documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent documents'
    });
  }
};

// Get important documents
exports.getImportantDocuments = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check for MongoDB connection
    if (process.env.USE_DB === 'true') {
      // First, find the student
      const student = await Student.findOne({ email });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Then, find the important documents
      const documents = await Document.find({
        student: student._id,
        isImportant: true
      }).sort({ uploadDate: -1 });
      
      return res.json({
        success: true,
        data: documents
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/documents.json');
      const documents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Filter important documents
      const importantDocuments = documents.filter(d => d.isImportant);
      
      return res.json(importantDocuments);
    }
  } catch (error) {
    console.error('❌ Error fetching important documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching important documents'
    });
  }
};

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check if there is a file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded'
      });
    }
    
    const { type, isImportant = false } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }
    
    // In a real implementation, we would save the file
    // For now, we'll just create a document record
    
    // Check for MongoDB connection
    if (process.env.USE_DB === 'true') {
      // First, find the student
      const student = await Student.findOne({ email });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Create a new document
      const document = new Document({
        name: req.file.originalname,
        type,
        size: `${Math.round(req.file.size / 1024)} KB`,
        uploadDate: new Date(),
        url: `/files/documents/${req.file.filename}`,
        isImportant: isImportant === 'true',
        student: student._id
      });
      
      await document.save();
      
      return res.json({
        success: true,
        data: document,
        message: 'Document uploaded successfully'
      });
    } else {
      // Update in JSON file
      const jsonPath = path.join(__dirname, '../data/documents.json');
      let documents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Create a new document
      const newDocument = {
        id: `DOC${String(documents.length + 1).padStart(3, '0')}`,
        name: req.file.originalname,
        type,
        size: `${Math.round(req.file.size / 1024)} KB`,
        uploadDate: new Date().toISOString(),
        url: `/files/documents/${req.file.filename}`,
        isImportant: isImportant === 'true'
      };
      
      documents.push(newDocument);
      
      fs.writeFileSync(jsonPath, JSON.stringify(documents, null, 2));
      
      return res.json({
        success: true,
        data: newDocument,
        message: 'Document uploaded successfully'
      });
    }
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading document'
    });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const documentId = req.params.id;
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check for MongoDB connection
    if (process.env.USE_DB === 'true') {
      // First, find the student
      const student = await Student.findOne({ email });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Find the document
      const document = await Document.findOne({
        _id: documentId,
        student: student._id
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // In a real implementation, we would delete the file as well
      
      // Delete the document from the database
      await Document.deleteOne({ _id: documentId });
      
      return res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } else {
      // Update in JSON file
      const jsonPath = path.join(__dirname, '../data/documents.json');
      let documents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      const documentIndex = documents.findIndex(d => d.id === documentId);
      
      if (documentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // In a real implementation, we would delete the file as well
      
      // Remove the document from the array
      documents.splice(documentIndex, 1);
      
      fs.writeFileSync(jsonPath, JSON.stringify(documents, null, 2));
      
      return res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    }
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting document'
    });
  }
}; 