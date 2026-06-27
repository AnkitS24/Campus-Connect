const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Contest title is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    problems: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
        sampleInput: { type: String },
        sampleOutput: { type: String },
        testCases: [
          {
            input: { type: String },
            output: { type: String },
            isHidden: { type: Boolean, default: false },
          },
        ],
        timeLimit: { type: Number, default: 2 },
        memoryLimit: { type: Number, default: 256 },
      },
    ],
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, default: 0 },
        submissions: [
          {
            problemId: { type: mongoose.Schema.Types.ObjectId },
            status: {
              type: String,
              enum: ['accepted', 'wrong', 'timeout', 'error'],
            },
            submittedAt: { type: Date, default: Date.now },
          },
        ],
        startedAt: { type: Date },
        completedAt: { type: Date },
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Contest', contestSchema);
