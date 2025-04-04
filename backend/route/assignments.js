const express = require('express');
const router = express.Router();
const Assignment = require('../model/assignment');
const Student = require('../model/student');
const Teacher = require('../model/teacher');
const Course = require('../model/course');
const authMiddleware = require('../middleware/authmiddle');

// Teacher: Create a new assignment
router.post('/create', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Only teachers and admins can create assignments' 
            });
        }

        const { title, course, courseName, description, dueDate, maxPoints, studentIds } = req.body;

        if (!title || !course || !courseName || !dueDate || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields' 
            });
        }

        // Verify teacher has access to this course
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ 'contactInfo.email': req.user.email });
            
            if (!teacher) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Teacher not found' 
                });
            }

            const hasAccess = teacher.courses.some(c => c.name === course);
            if (!hasAccess) {
                return res.status(403).json({ 
                    success: false,
                    message: 'You do not have access to this course' 
                });
            }
        }

        // Create assignment for each student
        const createdAssignments = [];
        
        for (const studentId of studentIds) {
            const student = await Student.findOne({ studentId });
            
            if (!student) {
                createdAssignments.push({
                    studentId,
                    success: false,
                    message: 'Student not found'
                });
                continue;
            }

            const newAssignment = new Assignment({
                title,
                course,
                courseName,
                description,
                dueDate: new Date(dueDate),
                maxPoints: maxPoints || 100,
                status: 'upcoming',
                student: student._id
            });

            await newAssignment.save();

            // Add notification for the student
            await student.addNotification(
                'New Assignment',
                `You have a new assignment: ${title} for ${courseName}`
            );

            createdAssignments.push({
                studentId,
                success: true,
                assignmentId: newAssignment._id
            });
        }

        res.status(201).json({
            success: true,
            message: 'Assignment(s) created successfully',
            results: createdAssignments
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Teacher: Get assignments by course
router.get('/course/:courseCode', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied' 
            });
        }

        const { courseCode } = req.params;
        const { status } = req.query;

        // Verify teacher has access to this course
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ 'contactInfo.email': req.user.email });
            
            if (!teacher) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Teacher not found' 
                });
            }

            const hasAccess = teacher.courses.some(c => c.name === courseCode);
            if (!hasAccess) {
                return res.status(403).json({ 
                    success: false,
                    message: 'You do not have access to this course' 
                });
            }
        }

        // Find all assignments for this course
        let query = { course: courseCode };
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        const assignments = await Assignment.find(query)
            .populate('student', 'studentId personalInfo.fullName')
            .sort({ dueDate: 1 });

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching course assignments:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Teacher: Grade an assignment
router.put('/grade/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Only teachers and admins can grade assignments' 
            });
        }

        const { id } = req.params;
        const { score, feedback } = req.body;

        if (score === undefined) {
            return res.status(400).json({ 
                success: false,
                message: 'Score is required' 
            });
        }

        const assignment = await Assignment.findById(id)
            .populate('student');
            
        if (!assignment) {
            return res.status(404).json({ 
                success: false,
                message: 'Assignment not found' 
            });
        }

        // Verify teacher has access to this course
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ 'contactInfo.email': req.user.email });
            
            if (!teacher) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Teacher not found' 
                });
            }

            const hasAccess = teacher.courses.some(c => c.name === assignment.course);
            if (!hasAccess) {
                return res.status(403).json({ 
                    success: false,
                    message: 'You do not have access to this course' 
                });
            }
        }

        // Update assignment with grade
        assignment.score = score;
        assignment.feedback = feedback || '';
        assignment.status = 'completed';
        
        await assignment.save();

        // Notify student
        if (assignment.student) {
            await assignment.student.addNotification(
                'Assignment Graded',
                `Your assignment "${assignment.title}" has been graded. Score: ${score}/${assignment.maxPoints}`
            );
        }

        res.json({
            success: true,
            message: 'Assignment graded successfully',
            assignment
        });
    } catch (error) {
        console.error('Error grading assignment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Student: Get assignments
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        
        // Find the student by email
        const student = await Student.findOne({ 'contactInfo.email': req.user.email });
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found'
            });
        }
        
        // Build query for assignments
        let query = { student: student._id };
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        // Fetch assignments
        const assignments = await Assignment.find(query).sort({ dueDate: 1 });
        
        return res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('❌ Error fetching assignments:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching assignments'
        });
    }
});

// Student: Get a specific assignment
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Assignment not found'
            });
        }
        
        // Check if the assignment belongs to the student
        const student = await Student.findOne({ 'contactInfo.email': req.user.email });
        
        if (!student || assignment.student.toString() !== student._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have access to this assignment'
            });
        }
        
        return res.json({
            success: true,
            assignment
        });
    } catch (error) {
        console.error('❌ Error fetching assignment:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching assignment'
        });
    }
});

// Student: Submit an assignment
router.put('/submit/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { submissionFiles } = req.body;
        
        // Find the assignment
        const assignment = await Assignment.findById(id);
        
        if (!assignment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Assignment not found'
            });
        }
        
        // Check if the assignment belongs to the student
        const student = await Student.findOne({ 'contactInfo.email': req.user.email });
        
        if (!student || assignment.student.toString() !== student._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have access to this assignment'
            });
        }
        
        // Update assignment with submission
        assignment.submissionFiles = submissionFiles || [];
        assignment.submittedDate = new Date();
        assignment.status = 'submitted';
        
        await assignment.save();
        
        return res.json({
            success: true,
            message: 'Assignment submitted successfully',
            assignment
        });
    } catch (error) {
        console.error('❌ Error submitting assignment:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while submitting assignment'
        });
    }
});

module.exports = router; 