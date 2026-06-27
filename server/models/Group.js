const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    type: { 
      type: String,
      enum: ['DSA', 'Web Dev', 'SAP', 'AI/ML', 'MCA', 'company-specific', 'general'],
      required: [true, 'Group type is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        lastReadMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message',
          default: null,
        },
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ type: 1 });
groupSchema.index({ members: 1 });

module.exports = mongoose.model('Group', groupSchema);
