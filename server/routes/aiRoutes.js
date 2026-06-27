const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  reviewResume,
  chatWithMentor,
  summarizeChat,
} = require('../controllers/aiController');

const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
    }
    cb(null, true);
  },
});

router.use(protect);

router.post('/resume-review', upload.single('resume'), reviewResume);
router.post('/chat', chatWithMentor);
router.post('/summarize', summarizeChat);

module.exports = router;
