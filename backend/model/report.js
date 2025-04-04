const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  overview: {
    cgpa: {
      type: Number,
      required: true
    },
    creditsCompleted: {
      type: Number,
      required: true
    },
    totalCredits: {
      type: Number,
      required: true
    },
    attendanceRate: {
      type: Number,
      required: true
    },
    assignmentScore: {
      type: Number,
      required: true
    }
  },
  gpaHistory: {
    type: [Number],
    default: []
  },
  subjectPerformance: [
    {
      subject: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        required: true
      }
    }
  ],
  courseReports: [
    {
      course: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      },
      credits: {
        type: Number,
        required: true
      },
      grade: {
        type: String,
        required: true
      },
      attendance: {
        type: String,
        required: true
      },
      status: {
        type: String,
        required: true
      }
    }
  ],
  // Reference to the student who owns this report
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  semester: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Report", ReportSchema); 