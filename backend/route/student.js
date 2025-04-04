const express = require('express');
const router = express.Router();
const Student = require('../model/student');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authmiddle');
const bcrypt = require('bcryptjs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpeg, .jpg, .png and .pdf files are allowed'));
    }
});

// Register new student
router.post('/register', async (req, res) => {
    try {
        const { personalInfo, contactInfo, academicInfo } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ 'contactInfo.email': contactInfo.email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        // Create new student
        const student = new Student({
            personalInfo,
            contactInfo,
            academicInfo,
            status: 'Active'
        });

        // Generate student ID
        const year = new Date().getFullYear();
        const department = academicInfo.department.toUpperCase();
        const count = await Student.countDocuments();
        student.studentId = `${year}${department}${String(count + 1).padStart(3, '0')}`;

        await student.save();

        // Send welcome notification
        await student.addNotification(
            'Welcome to School Management System',
            'Your registration has been completed successfully.'
        );

        res.status(201).json({
            message: 'Student registered successfully',
            studentId: student.studentId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering student', error: error.message });
    }
});

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find()
            .select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student', error: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { personalInfo, contactInfo, academicInfo } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    personalInfo,
                    contactInfo,
                    academicInfo
                }
            },
            { new: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating student', error: error.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
});

// Get student profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update student profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updateFields = {};
        const allowedFields = [
            'personalInfo.fullName',
            'contactInfo.phone',
            'contactInfo.currentAddress',
            'contactInfo.permanentAddress',
            'guardianInfo.phone',
            'guardianInfo.email'
        ];

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields[key] = req.body[key];
            }
        });

        const student = await Student.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get student notifications
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('notifications');
        res.json(student.notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Mark notification as read
router.put('/notifications/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        await student.markNotificationAsRead(req.params.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});

// Get student fees
router.get('/fees', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('fees');
        res.json(student.fees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fees', error: error.message });
    }
});

// Get student attendance
router.get('/attendance', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('attendance');
        res.json(student.attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
});

module.exports = router; 