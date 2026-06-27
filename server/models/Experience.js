const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    interviewDate: {
      type: Date,
    },
    rounds: [
      {
        roundName: { type: String },
        roundType: {
          type: String,
          enum: ['aptitude', 'technical', 'hr', 'group_discussion', 'coding', 'online_test'],
        },
        description: { type: String, maxlength: 3000 },
        questions: [{ type: String }],
      },
    ],
    overallExperience: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
    },
    tips: {
      type: String,
      maxlength: 2000,
    },
    offerReceived: {
      type: Boolean,
      default: false,
    },
    packageOffered: {
      type: String,
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

experienceSchema.index({ company: 1 });
experienceSchema.index({ sharedBy: 1 });
experienceSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
