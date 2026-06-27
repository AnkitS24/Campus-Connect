const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'cr', 'tpo', 'admin'],
      default: 'student',
    },
    points : {
      type : Number,
      default : 0
    },
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MCA', 'other'],
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    skills: [{ type: String, trim: true }],
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      leetcode: { type: String },
    },
    targetCompanies: [{ type: String, trim: true }],
    resume: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return ;
  this.password = await bcrypt.hash(this.password, 12);
  
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

userSchema.index({ role: 1 });
userSchema.index({ branch: 1, year: 1 });

module.exports = mongoose.model('User', userSchema);
