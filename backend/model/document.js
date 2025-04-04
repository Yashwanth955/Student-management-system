const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Academic Records", "Certificates", "Assignments", "Other Documents"],
    required: true
  },
  size: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    required: true
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  // Reference to the student who owns this document
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Document", DocumentSchema); 