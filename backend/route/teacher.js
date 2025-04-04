const express = require('express');
const router = express.Router();
const Teacher = require('../model/teacher');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authmiddle');

// Register new teacher
router.post('/register', async (req, res) => {
    try {
        const {
            personalInfo,
            contactInfo,
            professionalInfo,
            password
        } = req.body;

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ 'contactInfo.email': contactInfo.email });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher with this email already exists' });
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email: contactInfo.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create new teacher
        const teacher = new Teacher({
            personalInfo,
            contactInfo,
            professionalInfo,
            status: 'Active'
        });

        // Generate teacher ID
        const year = new Date().getFullYear();
        const department = professionalInfo.department.toUpperCase();
        const count = await Teacher.countDocuments();
        teacher.teacherId = `${year}${department}T${String(count + 1).padStart(3, '0')}`;

        await teacher.save();

        // Create user account for teacher
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                email: contactInfo.email,
                password: hashedPassword,
                role: 'teacher'
            });
        }

        // Send welcome notification
        await teacher.addNotification(
            'Welcome to School Management System',
            'Your registration has been completed successfully.'
        );

        res.status(201).json({
            message: 'Teacher registered successfully',
            teacherId: teacher.teacherId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering teacher', error: error.message });
    }
});

// Get all teachers
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers', error: error.message });
    }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .select('-password');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teacher', error: error.message });
    }
});

// Update teacher
router.put('/:id', async (req, res) => {
    try {
        const { personalInfo, contactInfo, professionalInfo } = req.body;
        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    personalInfo,
                    contactInfo,
                    professionalInfo
                }
            },
            { new: true }
        ).select('-password');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json({
            message: 'Teacher updated successfully',
            teacher
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating teacher', error: error.message });
    }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting teacher', error: error.message });
    }
});

// Get teacher profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id)
            .select('-password');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update teacher profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updateFields = {};
        const allowedFields = [
            'personalInfo.fullName',
            'contactInfo.phone',
            'contactInfo.address',
            'professionalInfo.qualification',
            'professionalInfo.specialization',
            'professionalInfo.researchInterests'
        ];

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields[key] = req.body[key];
            }
        });

        const teacher = await Teacher.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            teacher
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get teacher notifications
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id)
            .select('notifications');
        res.json(teacher.notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Mark notification as read
router.put('/notifications/:id', authMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id);
        await teacher.markNotificationAsRead(req.params.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});

// Get teacher courses
router.get('/courses', authMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id)
            .select('courses');
        res.json(teacher.courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Get teacher schedule
router.get('/schedule', authMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id)
            .select('schedule');
        res.json(teacher.schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule', error: error.message });
    }
});

module.exports = router; 