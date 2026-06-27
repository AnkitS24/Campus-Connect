const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');


router.post('/register', rateLimiter(30, 15 * 60 * 1000),registerValidator, register);
router.post('/login', rateLimiter(30, 15 * 60 * 1000), loginValidator, login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', protect, logout);
router.post('/forgot-password', rateLimiter(10, 15 * 60 * 1000), forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
