const Report = require('../model/report');
const Student = require('../model/student');
const fs = require('fs');
const path = require('path');

// Get all semesters for a student
exports.getSemesters = async (req, res) => {
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
      
      // Then, find the semesters (distinct semester values in reports)
      const reports = await Report.find({ student: student._id });
      const semesters = [...new Set(reports.map(r => r.semester))];
      
      return res.json({
        success: true,
        data: semesters
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/reports.json');
      const reports = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Get the semesters from the reports data
      const semesters = reports.semesters.map(s => s.name);
      
      return res.json({
        success: true,
        data: semesters
      });
    }
  } catch (error) {
    console.error('❌ Error fetching semesters:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching semesters'
    });
  }
};

// Get report for a specific semester
exports.getReport = async (req, res) => {
  try {
    const email = req.user ? req.user.email : null;
    const semesterId = req.params.id;
    
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
      
      // Then, find the report
      const report = await Report.findOne({
        student: student._id,
        _id: semesterId
      });
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      return res.json({
        success: true,
        data: report
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/reports.json');
      const reports = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Find the semester by ID
      const semester = reports.semesters.find(s => s.id === semesterId);
      
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      return res.json({
        success: true,
        data: semester
      });
    }
  } catch (error) {
    console.error('❌ Error fetching report:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching report'
    });
  }
};

// Get all reports for a student
exports.getAllReports = async (req, res) => {
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
      
      // Then, find all reports
      const reports = await Report.find({ student: student._id }).sort({ createdAt: -1 });
      
      return res.json({
        success: true,
        data: reports
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/reports.json');
      const reports = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      return res.json({
        success: true,
        data: reports
      });
    }
  } catch (error) {
    console.error('❌ Error fetching all reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching all reports'
    });
  }
};

// Get overall academic performance
exports.getOverallPerformance = async (req, res) => {
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
      
      // Calculate overall performance from all reports
      const reports = await Report.find({ student: student._id });
      
      if (reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No reports found'
        });
      }
      
      // Calculate the overall CGPA as the average of all semester CGPAs
      const cgpa = reports.reduce((sum, report) => sum + report.overview.cgpa, 0) / reports.length;
      
      // Calculate total credits completed
      const creditsCompleted = reports.reduce((sum, report) => sum + report.overview.creditsCompleted, 0);
      
      // Calculate average attendance rate
      const attendanceRate = reports.reduce((sum, report) => sum + report.overview.attendanceRate, 0) / reports.length;
      
      // Calculate average assignment score
      const assignmentScore = reports.reduce((sum, report) => sum + report.overview.assignmentScore, 0) / reports.length;
      
      // Get GPA history from the most recent report
      const gpaHistory = reports[0].gpaHistory;
      
      // Combine subject performance from all reports
      const subjectPerformance = reports.reduce((subjects, report) => {
        report.subjectPerformance.forEach(subject => {
          const existingSubject = subjects.find(s => s.subject === subject.subject);
          
          if (existingSubject) {
            existingSubject.score = (existingSubject.score + subject.score) / 2;
          } else {
            subjects.push({ ...subject });
          }
        });
        
        return subjects;
      }, []);
      
      const performance = {
        cgpa,
        creditsCompleted,
        attendanceRate,
        assignmentScore,
        gpaHistory,
        subjectPerformance
      };
      
      return res.json({
        success: true,
        data: performance
      });
    } else {
      // Get from JSON file
      const jsonPath = path.join(__dirname, '../data/reports.json');
      const reports = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      if (reports.semesters.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No reports found'
        });
      }
      
      // Calculate the overall CGPA as the average of all semester CGPAs
      const cgpa = reports.semesters.reduce((sum, semester) => sum + semester.overview.cgpa, 0) / reports.semesters.length;
      
      // Calculate total credits completed
      const creditsCompleted = reports.semesters.reduce((sum, semester) => sum + semester.overview.creditsCompleted, 0);
      
      // Calculate average attendance rate
      const attendanceRate = reports.semesters.reduce((sum, semester) => sum + semester.overview.attendanceRate, 0) / reports.semesters.length;
      
      // Calculate average assignment score
      const assignmentScore = reports.semesters.reduce((sum, semester) => sum + semester.overview.assignmentScore, 0) / reports.semesters.length;
      
      // Get GPA history from the most recent report
      const gpaHistory = reports.semesters[0].gpaHistory;
      
      // Combine subject performance from all reports
      const subjectPerformance = reports.semesters.reduce((subjects, semester) => {
        semester.subjectPerformance.forEach(subject => {
          const existingSubject = subjects.find(s => s.subject === subject.subject);
          
          if (existingSubject) {
            existingSubject.score = (existingSubject.score + subject.score) / 2;
          } else {
            subjects.push({ ...subject });
          }
        });
        
        return subjects;
      }, []);
      
      const performance = {
        cgpa,
        creditsCompleted,
        attendanceRate,
        assignmentScore,
        gpaHistory,
        subjectPerformance
      };
      
      return res.json({
        success: true,
        data: performance
      });
    }
  } catch (error) {
    console.error('❌ Error fetching overall performance:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching overall performance'
    });
  }
}; 