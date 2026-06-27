const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { sendEmail } = require('../utils/email');

const register = asyncHandler(async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, errors.array()[0].msg, 400);
  }

  
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'Email already registered', 400);
  }

  const user = await User.create({ fullName, email, password });
  console.log("user has been created")
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  console.log("user has been saved")
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  console.log("cookies setup")
  ApiResponse.success(
    res,
    {
      user,
      accessToken,
      refreshToken,
    },
    'Registration successful',
    201
  );
});



const login = asyncHandler(async (req, res) => {
    console.log("inside loging function....")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Get some login validation errors..")
      return ApiResponse.error(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log("user not found")
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("password not matched...")
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    ApiResponse.success(res, { user, accessToken, refreshToken }, 'Login successful');
});


const refreshTokenHandler = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token is required', 400);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return ApiResponse.error(res, 'Invalid refresh token', 401);
      }

      const newAccessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save({ validateBeforeSave: false });

      ApiResponse.success(res, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return ApiResponse.error(res, 'Invalid refresh token', 401);
    }
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('refreshToken');

  ApiResponse.success(res, null, 'Logged out successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {

  console.log("inside forgot password....")
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, errors.array()[0].msg, 400);
  }

  const { email } = req.body;
  //console.log(email)
  const user = await User.findOne({ email });

  if (!user) {
    console.log("user not found")
    return ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - CampusConnect',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
  
  ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
});

const resetPassword = asyncHandler(async (req, res) => {
 
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, errors.array()[0].msg, 400);
  }

  const { newPassword, token } = req.body;
  
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return ApiResponse.error(res, 'Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  // user.resetPasswordToken = undefined;
  // user.resetPasswordExpire = undefined;
  // user.refreshToken = null;
  await user.save();

  ApiResponse.success(res, null, 'Password reset successful');
});

const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { user: req.user });
});

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
