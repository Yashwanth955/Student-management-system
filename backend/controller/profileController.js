const Student = require('../model/student');
const fs = require('fs');
const path = require('path');

// Get student profile data
exports.getProfile = async (req, res) => {
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
      // Get from MongoDB
      const student = await Student.findOne({ email });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }
      
      return res.json({
        success: true,
        data: student
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/students.json');
      const students = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      const student = students.find(s => s.email === email);
      
      if (!student) {
        // For testing purposes, return the first student if email doesn't match
        console.log('⚠️ No student found with email:', email);
        console.log('⚠️ Returning first student for testing purposes');
        return res.json(students[0]);
      }
      
      return res.json(student);
    }
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const profileData = req.body;
    
    // Check for MongoDB connection
    if (process.env.USE_DB === 'true') {
      // Update in MongoDB
      const student = await Student.findOneAndUpdate(
        { email },
        { $set: profileData },
        { new: true }
      );
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }
      
      return res.json({
        success: true,
        data: student,
        message: 'Profile updated successfully'
      });
    } else {
      // Update in JSON file
      const jsonPath = path.join(__dirname, '../data/students.json');
      let students = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      const studentIndex = students.findIndex(s => s.email === email);
      
      if (studentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }
      
      // Update only allowed fields
      const allowedFields = [
        'phone', 'currentAddress', 'permanentAddress'
      ];
      
      allowedFields.forEach(field => {
        if (profileData[field]) {
          students[studentIndex][field] = profileData[field];
        }
      });
      
      // Update hostel information if provided
      if (profileData.hostel) {
        students[studentIndex].hostel = {
          ...students[studentIndex].hostel,
          ...profileData.hostel
        };
      }
      
      fs.writeFileSync(jsonPath, JSON.stringify(students, null, 2));
      
      return res.json({
        success: true,
        data: students[studentIndex],
        message: 'Profile updated successfully'
      });
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Get academic progress
exports.getAcademicProgress = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const semester = req.query.semester || 'current';
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // For now, we'll use mock data
    // In a real implementation, this would come from a database
    const progress = {
      cgpa: 3.8,
      creditsCompleted: 60,
      totalCredits: 120,
      coursesCompleted: 15,
      coursesInProgress: 5,
      semesters: [
        {
          name: 'Fall 2022',
          cgpa: 3.75
        },
        {
          name: 'Spring 2023',
          cgpa: 3.8
        },
        {
          name: 'Current',
          cgpa: 3.85
        }
      ]
    };
    
    return res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Error fetching academic progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching academic progress'
    });
  }
};

// Get attendance data
exports.getAttendance = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    
    if (!email) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // For now, we'll use mock data
    // In a real implementation, this would come from a database
    const attendance = {
      overall: 95,
      courses: [
        {
          name: 'Data Structures and Algorithms',
          code: 'CS301',
          attended: 28,
          total: 30,
          percentage: 93.33
        },
        {
          name: 'Database Management Systems',
          code: 'CS305',
          attended: 27,
          total: 28,
          percentage: 96.43
        },
        {
          name: 'Computer Networks',
          code: 'CS310',
          attended: 26,
          total: 28,
          percentage: 92.86
        },
        {
          name: 'Web Technologies',
          code: 'CS401',
          attended: 29,
          total: 30,
          percentage: 96.67
        },
        {
          name: 'Artificial Intelligence',
          code: 'CS405',
          attended: 28,
          total: 30,
          percentage: 93.33
        }
      ]
    };
    
    return res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance'
    });
  }
}; 