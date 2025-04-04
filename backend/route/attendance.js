const express = require('express');
const router = express.Router();
const Student = require('../model/student');
const Teacher = require('../model/teacher');
const Course = require('../model/course');
const authMiddleware = require('../middleware/authmiddle');

// Get attendance for a class
router.get('/class/:classCode', authMiddleware, async (req, res) => {
    try {
        const { classCode } = req.params;
        const { date } = req.query;

        // Verify teacher has access to this class
        const teacher = await Teacher.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if teacher teaches this class
        const hasAccess = teacher.courses.some(course => course.name.includes(classCode));
        if (!hasAccess) {
            return res.status(403).json({ message: 'Not authorized to access this class' });
        }

        // Get students in this class
        const students = await Student.find({
            'courses.name': { $regex: classCode, $options: 'i' }
        }).select('studentId personalInfo.fullName academicInfo attendance');

        // Filter attendance records for the specified date (if provided)
        if (date) {
            students.forEach(student => {
                const dateObj = new Date(date);
                const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
                const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
                
                student.attendance = student.attendance.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate >= startOfDay && recordDate <= endOfDay && record.subject === classCode;
                });
            });
        }

        res.json(students);
    } catch (error) {
        console.error('Error fetching class attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
});

// Submit attendance for a class
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { classCode, date, attendanceData } = req.body;

        if (!classCode || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        // Verify teacher has access to this class
        const teacher = await Teacher.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if teacher teaches this class
        const hasAccess = teacher.courses.some(course => course.name.includes(classCode));
        if (!hasAccess) {
            return res.status(403).json({ message: 'Not authorized to access this class' });
        }

        // Process attendance data for each student
        const results = [];
        for (const record of attendanceData) {
            const { studentId, status, notes } = record;
            
            // Find the student
            const student = await Student.findOne({ studentId });
            if (!student) {
                results.push({ studentId, success: false, message: 'Student not found' });
                continue;
            }
            
            // Create attendance record
            const attendanceRecord = {
                date: new Date(date),
                status,
                subject: classCode,
                notes: notes || ''
            };
            
            // Check if an attendance record already exists for this date and subject
            const existingRecordIndex = student.attendance.findIndex(a => {
                const recordDate = new Date(a.date);
                const targetDate = new Date(date);
                return recordDate.toDateString() === targetDate.toDateString() && a.subject === classCode;
            });
            
            if (existingRecordIndex !== -1) {
                // Update existing record
                student.attendance[existingRecordIndex] = attendanceRecord;
            } else {
                // Add new record
                student.attendance.push(attendanceRecord);
            }
            
            await student.save();
            results.push({ studentId, success: true });
        }
        
        res.status(200).json({ 
            message: 'Attendance submitted successfully', 
            results 
        });
    } catch (error) {
        console.error('Error submitting attendance:', error);
        res.status(500).json({ message: 'Error submitting attendance', error: error.message });
    }
});

// Get attendance statistics for a class
router.get('/stats/:classCode', authMiddleware, async (req, res) => {
    try {
        const { classCode } = req.params;
        const { startDate, endDate } = req.query;

        // Verify teacher has access to this class
        const teacher = await Teacher.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if teacher teaches this class
        const hasAccess = teacher.courses.some(course => course.name.includes(classCode));
        if (!hasAccess) {
            return res.status(403).json({ message: 'Not authorized to access this class' });
        }

        // Get all students in this class
        const students = await Student.find({
            'courses.name': { $regex: classCode, $options: 'i' }
        }).select('studentId personalInfo.fullName attendance');
        
        // Calculate statistics
        const stats = {
            totalStudents: students.length,
            dateRange: { startDate, endDate },
            overallAttendance: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            totalRecords: 0,
            studentStats: []
        };
        
        // Set date range for filtering
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        // Calculate per-student statistics
        students.forEach(student => {
            const studentStats = {
                studentId: student.studentId,
                name: student.personalInfo.fullName,
                present: 0,
                absent: 0,
                late: 0,
                total: 0,
                percentage: 0
            };
            
            // Filter relevant attendance records
            const relevantAttendance = student.attendance.filter(record => {
                const recordDate = new Date(record.date);
                const dateInRange = (!start || recordDate >= start) && (!end || recordDate <= end);
                return dateInRange && record.subject === classCode;
            });
            
            // Count statuses
            relevantAttendance.forEach(record => {
                if (record.status === 'present') {
                    studentStats.present++;
                    stats.presentCount++;
                } else if (record.status === 'absent') {
                    studentStats.absent++;
                    stats.absentCount++;
                } else if (record.status === 'late') {
                    studentStats.late++;
                    stats.lateCount++;
                }
                
                studentStats.total++;
                stats.totalRecords++;
            });
            
            // Calculate percentage
            studentStats.percentage = studentStats.total > 0
                ? (studentStats.present + studentStats.late) / studentStats.total * 100
                : 0;
                
            stats.studentStats.push(studentStats);
        });
        
        // Calculate overall attendance percentage
        stats.overallAttendance = stats.totalRecords > 0
            ? (stats.presentCount + stats.lateCount) / stats.totalRecords * 100
            : 0;
            
        res.json(stats);
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        res.status(500).json({ message: 'Error fetching attendance statistics', error: error.message });
    }
});

module.exports = router; 