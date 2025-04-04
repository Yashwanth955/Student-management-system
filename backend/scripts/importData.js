const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Student = require('../model/student');
const Assignment = require('../model/assignment');
const Document = require('../model/document');
const Report = require('../model/report');

// Path to data files
const studentsFile = path.join(__dirname, '../data/students.json');
const assignmentsFile = path.join(__dirname, '../data/assignments.json');
const documentsFile = path.join(__dirname, '../data/documents.json');
const reportsFile = path.join(__dirname, '../data/reports.json');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Import Students
const importStudents = async () => {
  try {
    const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
    
    // First clear any existing data
    await Student.deleteMany({});
    console.log('🧹 Cleared existing student data');
    
    // Create student records
    const studentPromises = students.map(async (student) => {
      const newStudent = new Student({
        userId: student.userId,
        fullName: student.fullName,
        studentId: student.id,
        email: student.email,
        phone: student.phone,
        dob: new Date(student.dob),
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        nationality: student.nationality,
        currentAddress: student.currentAddress,
        permanentAddress: student.permanentAddress,
        department: student.department,
        classSection: student.classSection,
        rollNumber: student.rollNumber,
        batch: student.batch,
        semester: student.semester,
        cgpa: student.cgpa,
        hostel: student.hostel,
        creditsCompleted: student.creditsCompleted,
        totalCredits: student.totalCredits,
        attendanceRate: student.attendanceRate
      });
      
      return newStudent.save();
    });
    
    await Promise.all(studentPromises);
    console.log(`✅ Imported ${students.length} students`);
    
    return true;
  } catch (error) {
    console.error('❌ Error importing students:', error);
    return false;
  }
};

// Import Assignments
const importAssignments = async () => {
  try {
    const assignments = JSON.parse(fs.readFileSync(assignmentsFile, 'utf8'));
    const students = await Student.find({});
    
    if (students.length === 0) {
      console.error('❌ No students found. Please import students first.');
      return false;
    }
    
    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('🧹 Cleared existing assignment data');
    
    // Create assignment records
    // We'll associate assignments with the first student for simplicity
    const student = students[0];
    
    const assignmentPromises = assignments.map(async (assignment) => {
      const newAssignment = new Assignment({
        title: assignment.title,
        course: assignment.course,
        courseName: assignment.courseName,
        description: assignment.description,
        dueDate: new Date(assignment.dueDate),
        maxPoints: assignment.maxPoints,
        status: assignment.status,
        score: assignment.score,
        submittedDate: assignment.submittedDate ? new Date(assignment.submittedDate) : undefined,
        feedback: assignment.feedback,
        attachments: assignment.attachments || [],
        submissionFiles: assignment.submissionFiles || [],
        student: student._id
      });
      
      return newAssignment.save();
    });
    
    await Promise.all(assignmentPromises);
    console.log(`✅ Imported ${assignments.length} assignments`);
    
    return true;
  } catch (error) {
    console.error('❌ Error importing assignments:', error);
    return false;
  }
};

// Import Documents
const importDocuments = async () => {
  try {
    const documents = JSON.parse(fs.readFileSync(documentsFile, 'utf8'));
    const students = await Student.find({});
    
    if (students.length === 0) {
      console.error('❌ No students found. Please import students first.');
      return false;
    }
    
    // Clear existing documents
    await Document.deleteMany({});
    console.log('🧹 Cleared existing document data');
    
    // Create document records
    // We'll associate documents with the first student for simplicity
    const student = students[0];
    
    const documentPromises = documents.map(async (document) => {
      const newDocument = new Document({
        name: document.name,
        type: document.type,
        size: document.size,
        uploadDate: new Date(document.uploadDate),
        url: document.url,
        isImportant: document.isImportant,
        student: student._id
      });
      
      return newDocument.save();
    });
    
    await Promise.all(documentPromises);
    console.log(`✅ Imported ${documents.length} documents`);
    
    return true;
  } catch (error) {
    console.error('❌ Error importing documents:', error);
    return false;
  }
};

// Import Reports
const importReports = async () => {
  try {
    const reportsData = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
    const students = await Student.find({});
    
    if (students.length === 0) {
      console.error('❌ No students found. Please import students first.');
      return false;
    }
    
    // Clear existing reports
    await Report.deleteMany({});
    console.log('🧹 Cleared existing report data');
    
    // Create report records
    // We'll associate reports with the first student for simplicity
    const student = students[0];
    
    const reportPromises = reportsData.semesters.map(async (semester) => {
      const newReport = new Report({
        name: semester.name,
        overview: semester.overview,
        gpaHistory: semester.gpaHistory,
        subjectPerformance: semester.subjectPerformance,
        courseReports: semester.courseReports,
        student: student._id,
        semester: semester.name
      });
      
      return newReport.save();
    });
    
    await Promise.all(reportPromises);
    console.log(`✅ Imported ${reportsData.semesters.length} reports`);
    
    return true;
  } catch (error) {
    console.error('❌ Error importing reports:', error);
    return false;
  }
};

// Update .env file to use MongoDB
const updateEnvFile = () => {
  try {
    const envFile = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // Replace USE_DB=false with USE_DB=true
    const updatedContent = envContent.replace('USE_DB=false', 'USE_DB=true');
    
    fs.writeFileSync(envFile, updatedContent);
    console.log('✅ Updated .env file to use MongoDB');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating .env file:', error);
    return false;
  }
};

// Run the import process
const runImport = async () => {
  console.log('🚀 Starting data import process...');
  
  const studentsImported = await importStudents();
  if (!studentsImported) {
    console.error('❌ Failed to import students. Aborting.');
    process.exit(1);
  }
  
  const assignmentsImported = await importAssignments();
  if (!assignmentsImported) {
    console.error('❌ Failed to import assignments. Aborting.');
    process.exit(1);
  }
  
  const documentsImported = await importDocuments();
  if (!documentsImported) {
    console.error('❌ Failed to import documents. Aborting.');
    process.exit(1);
  }
  
  const reportsImported = await importReports();
  if (!reportsImported) {
    console.error('❌ Failed to import reports. Aborting.');
    process.exit(1);
  }
  
  // Update .env file
  const envUpdated = updateEnvFile();
  if (!envUpdated) {
    console.error('❌ Failed to update .env file. Please update it manually by setting USE_DB=true');
  }
  
  console.log('✅ Data import completed successfully!');
  console.log('✅ Your application is now set up to use MongoDB.');
  console.log('✅ Start your server with: npm start');
  
  // Close the database connection
  mongoose.connection.close();
  process.exit(0);
};

// Start the import process
runImport(); 