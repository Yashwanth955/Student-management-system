const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    description: String,
    semester: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    schedule: [{
        day: String,
        startTime: String,
        endTime: String,
        room: String
    }],
    fees: {
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Upcoming'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate course ID before saving
courseSchema.pre('save', async function(next) {
    if (!this.courseId) {
        const year = new Date().getFullYear();
        const department = this.department.toUpperCase();
        const count = await mongoose.model('Course').countDocuments();
        this.courseId = `${year}${department}C${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 