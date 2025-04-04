const express = require('express');
const router = express.Router();
const Course = require('../model/course');
const Teacher = require('../model/teacher');
const Student = require('../model/student');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructor', 'personalInfo.fullName')
            .select('-students');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Register new course
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            code,
            department,
            credits,
            description,
            semester,
            academicYear,
            instructor
        } = req.body;

        // Check if course code already exists
        const existingCourse = await Course.findOne({ code });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course with this code already exists' });
        }

        // Create new course
        const course = new Course({
            name,
            code,
            department,
            credits,
            description,
            semester,
            academicYear,
            instructor,
            status: 'Active'
        });

        // Generate course ID
        const year = new Date().getFullYear();
        const dept = department.toUpperCase();
        const count = await Course.countDocuments();
        course.courseId = `${year}${dept}C${String(count + 1).padStart(3, '0')}`;

        await course.save();

        res.status(201).json({
            message: 'Course registered successfully',
            courseId: course.courseId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering course', error: error.message });
    }
});

// Get course details
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'personalInfo.fullName')
            .populate('students', 'personalInfo.fullName');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course details', error: error.message });
    }
});

// Update course
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({
            message: 'Course updated successfully',
            course
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

// Enroll student in course
router.post('/:id/enroll', async (req, res) => {
    try {
        const { studentId } = req.body;
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student is already enrolled
        if (course.students.includes(studentId)) {
            return res.status(400).json({ message: 'Student already enrolled in this course' });
        }

        // Add student to course
        course.students.push(studentId);
        await course.save();

        // Add course to student's courses
        await Student.findByIdAndUpdate(studentId, {
            $push: {
                courses: {
                    courseId: course._id,
                    name: course.name,
                    semester: course.semester,
                    academicYear: course.academicYear
                }
            }
        });

        res.json({ message: 'Student enrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling student', error: error.message });
    }
});

// Get course schedule
router.get('/:id/schedule', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .select('schedule');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course.schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule', error: error.message });
    }
});

module.exports = router; 