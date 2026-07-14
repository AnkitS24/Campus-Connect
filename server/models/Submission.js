const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: [true, 'Code is required'] },
  language: { type: String, required: [true, 'Language is required'] },
  languageId: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'tle', 'runtime', 'error'],
    default: 'pending',
  },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  timeTaken: { type: Number },      // Helpful for user feedback in an editor
  memoryUsed: { type: Number },     // Helpful for user feedback in an editor
  judge0Response: { type: mongoose.Schema.Types.Mixed }, // Kept for debugging failed test cases
}, { timestamps: true }); // Automatically handles createdAt and updatedAt

// Cleaned up indexes (removed contest-based indexes)
submissionSchema.index({ user: 1 });
submissionSchema.index({ problem: 1 });

module.exports = mongoose.model('Submission', submissionSchema);