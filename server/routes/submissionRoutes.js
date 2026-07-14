 const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissions, getSubmission, runCode } = require('../controllers/submissionController');
const { protect } = require('../middleware/auth'); // Or your authentication hook

// Your submission paths
router.post('/submit', protect, createSubmission);
router.get('/', protect, getSubmissions);
router.get('/:id', protect, getSubmission);
router.post('/run', protect, runCode);

module.exports = router;