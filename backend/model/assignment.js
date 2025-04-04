const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ["upcoming", "completed", "overdue"],
    default: "upcoming"
  },
  score: {
    type: Number
  },
  submittedDate: {
    type: Date
  },
  feedback: {
    type: String
  },
  attachments: [
    {
      name: {
        type: String
      },
      url: {
        type: String
      },
      size: {
        type: String
      }
    }
  ],
  submissionFiles: [
    {
      name: {
        type: String
      },
      url: {
        type: String
      },
      size: {
        type: String
      }
    }
  ],
  // Reference to the student who has this assignment
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Assignment", AssignmentSchema); 