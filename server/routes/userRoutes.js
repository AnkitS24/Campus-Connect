const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  updateProfile,
  uploadAvatar,
  uploadResume,
  getUserById,
  getAllUsers,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { updateProfileValidator } = require('../validators/profileValidators');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
    }
    if (file.fieldname === 'resume') {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only PDF and DOC files are allowed'), false);
      }
    }
    cb(null, true);
  },
});

router.get('/', protect, authorize('admin', 'tpo'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfileValidator, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/resume', protect, upload.single('resume'), uploadResume);

module.exports = router;
