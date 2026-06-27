const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
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
    description: {
      type: String,
      maxlength: 2000,
    },
    referralLink: {
      type: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String },
        resume: { type: String },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ company: 1, status: 1 });
referralSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Referral', referralSchema);
