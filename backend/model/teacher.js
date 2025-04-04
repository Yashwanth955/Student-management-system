const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
    teacherId: {
        type: String,
        unique: true
    },
    personalInfo: {
        fullName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, required: true },
        nationality: { type: String }
    },
    contactInfo: {
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    professionalInfo: {
        department: { type: String, required: true },
        designation: { type: String, required: true },
        qualification: { type: String, required: true },
        experience: { type: Number, required: true },
        specialization: { type: String, required: true },
        researchInterests: { type: String }
    },
    courses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        name: String,
        semester: String,
        academicYear: String
    }],
    schedule: [{
        day: String,
        timeSlot: String,
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        className: String
    }],
    notifications: [{
        title: String,
        message: String,
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false }
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'On Leave'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Generate teacher ID before saving
teacherSchema.pre('save', async function(next) {
    if (!this.teacherId) {
        const year = new Date().getFullYear();
        const department = this.professionalInfo.department.toUpperCase();
        const count = await mongoose.model('Teacher').countDocuments();
        this.teacherId = `${year}${department}T${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

// Hash password before saving
teacherSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to check password
teacherSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to add notification
teacherSchema.methods.addNotification = function(title, message) {
    this.notifications.push({ title, message });
    return this.save();
};

// Method to mark notification as read
teacherSchema.methods.markNotificationAsRead = function(notificationId) {
    const notification = this.notifications.id(notificationId);
    if (notification) {
        notification.read = true;
        return this.save();
    }
    return Promise.reject(new Error('Notification not found'));
};

// Method to add course
teacherSchema.methods.addCourse = function(courseData) {
    this.courses.push(courseData);
    return this.save();
};

// Method to update schedule
teacherSchema.methods.updateSchedule = function(scheduleData) {
    this.schedule.push(scheduleData);
    return this.save();
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher; 