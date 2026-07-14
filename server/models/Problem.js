const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Problem title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 0 },
  constraints: { type: String },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  }],
  hints: [{ type: String }],
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  }],
  timeLimit: { type: Number, default: 2 },
  memoryLimit: { type: Number, default: 256 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

problemSchema.index({ difficulty: 1 });
problemSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Problem', problemSchema);
