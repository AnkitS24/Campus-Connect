const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    eligibility: {
      branches: { type: String },
      minCgpa: { type: Number, min: 0, max: 10 },
      activeBacklogs: { type: Number, default: 0 },
      graduationYear: { type: String },
    },
    package: {
      type: String,
    },
    locations: { type: String, },
    interviewRounds: [
      {
        roundName: { type: String },
        roundDate: {type:Date},
        roundType: {
          type: String,
          enum: ['online_test', 'technical', 'hr', 'group_discussion', 'coding'],
        },
        roundMode : String,
        description: { type: String },
      },
    ],
    applicationStart: {
      type: Date,
    },
    applicationDeadline : { type: Date },
    link : {type : String},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['applied', 'shortlisted', 'rejected', 'selected'],
          default: 'applied',
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

placementSchema.index({ status: 1, driveDate: -1 });
placementSchema.index({ 'eligibility.branches': 1 });
placementSchema.index({ bookmarkedBy: 1 });

module.exports = mongoose.model('Placement', placementSchema);
