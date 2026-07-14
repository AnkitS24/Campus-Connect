const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    domain: {
      type: String,
      enum: ['DSA', 'HR', 'Web Dev', 'SAP', 'System Design'],
      required: [true, 'Domain is required'],
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
    },
    scheduledAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    reminderSent : {
      type : Boolean, 
      default : false},
    notes: {
      type: String,
      maxlength: 1000,
    },
    rescheduleRequest: {
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default : null},
      newDate: { type: Date },
      newTime: { type: String },
      reason: { type: String, maxlength: 500 },
      status: { type: Boolean, default: false },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 2000 },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      providedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      providedAt: { type: Date },
    },
    meetingLink: {
      type: String,
    },
    webrtcRoom: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

mockInterviewSchema.index({ requester: 1, status: 1 });
mockInterviewSchema.index({ interviewer: 1, status: 1 });
mockInterviewSchema.index({ domain: 1, status: 1 });
mockInterviewSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
