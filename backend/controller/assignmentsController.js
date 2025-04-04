const Assignment = require('../model/assignment');
const Student = require('../model/student');
const fs = require('fs');
const path = require('path');

// Get all assignments for a student
exports.getAssignments = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const status = req.query.status || 'all'; // Filter by status
    
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
      
      // Then, find the assignments
      let query = { student: student._id };
      
      if (status !== 'all') {
        query.status = status;
      }
      
      const assignments = await Assignment.find(query).sort({ dueDate: 1 });
      
      return res.json({
        success: true,
        data: assignments
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/assignments.json');
      const assignments = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Filter by status if needed
      let filteredAssignments = assignments;
      
      if (status !== 'all') {
        filteredAssignments = assignments.filter(a => a.status === status);
      }
      
      return res.json(filteredAssignments);
    }
  } catch (error) {
    console.error('❌ Error fetching assignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching assignments'
    });
  }
};

// Get a single assignment by ID
exports.getAssignment = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const assignmentId = req.params.id;
    
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
      
      // Then, find the assignment
      const assignment = await Assignment.findOne({
        _id: assignmentId,
        student: student._id
      });
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
      
      return res.json({
        success: true,
        data: assignment
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/assignments.json');
      const assignments = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      const assignment = assignments.find(a => a.id === assignmentId);
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
      
      return res.json(assignment);
    }
  } catch (error) {
    console.error('❌ Error fetching assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching assignment'
    });
  }
};

// Submit an assignment
exports.submitAssignment = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const assignmentId = req.params.id;
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check if there are files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }
    
    // In a real implementation, we would save the files
    // For now, we'll just update the assignment status
    
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
      
      // Then, find and update the assignment
      const assignment = await Assignment.findOneAndUpdate(
        {
          _id: assignmentId,
          student: student._id
        },
        {
          $set: {
            status: 'completed',
            submittedDate: new Date(),
            submissionFiles: req.files.map(file => ({
              name: file.originalname,
              url: `/files/submissions/${assignmentId}/${file.filename}`,
              size: `${Math.round(file.size / 1024)} KB`
            }))
          }
        },
        { new: true }
      );
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
      
      return res.json({
        success: true,
        data: assignment,
        message: 'Assignment submitted successfully'
      });
    } else {
      // Update in JSON file
      const jsonPath = path.join(__dirname, '../data/assignments.json');
      let assignments = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
      
      if (assignmentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
      
      // Update the assignment
      assignments[assignmentIndex].status = 'completed';
      assignments[assignmentIndex].submittedDate = new Date().toISOString();
      assignments[assignmentIndex].submissionFiles = req.files.map(file => ({
        name: file.originalname,
        url: `/files/submissions/${assignmentId}/${file.filename}`,
        size: `${Math.round(file.size / 1024)} KB`
      }));
      
      fs.writeFileSync(jsonPath, JSON.stringify(assignments, null, 2));
      
      return res.json({
        success: true,
        data: assignments[assignmentIndex],
        message: 'Assignment submitted successfully'
      });
    }
  } catch (error) {
    console.error('❌ Error submitting assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting assignment'
    });
  }
}; 