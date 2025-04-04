const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true }
  },
  contactInfo: {
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  academicInfo: {
    department: { type: String, required: true },
    batch: { type: String, required: true },
    rollNumber: { type: String, required: true },
    admissionDate: { type: Date, required: true }
  },
  courses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    name: String,
    semester: String,
    academicYear: String
  }],
  fees: [{
    semester: Number,
    amount: Number,
    paid: Boolean,
    dueDate: Date,
    paidDate: Date,
    transactionId: String
  }],
  attendance: [{
    date: Date,
    status: String,
    subject: String
  }],
  notifications: [{
    title: String,
    message: String,
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Generate student ID before saving
StudentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const department = this.academicInfo.department.toUpperCase();
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `${year}${department}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Hash password before saving
StudentSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
StudentSchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to add notification
StudentSchema.methods.addNotification = function(title, message) {
  this.notifications.push({ title, message });
  return this.save();
};

// Method to mark notification as read
StudentSchema.methods.markNotificationAsRead = function(notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.read = true;
    return this.save();
  }
  return Promise.reject(new Error('Notification not found'));
};

// Method to add fee record
StudentSchema.methods.addFeeRecord = function(feeData) {
  this.fees.push(feeData);
  return this.save();
};

// Method to update attendance
StudentSchema.methods.updateAttendance = function(attendanceData) {
  this.attendance.push(attendanceData);
  return this.save();
};

module.exports = mongoose.model("Student", StudentSchema); 