const express = require('express');
const router = express.Router();
const { createExperience, getExperiences, upvoteExperience } = require('../controllers/experienceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getExperiences);
router.post('/', createExperience);
router.post('/:id/upvote', upvoteExperience);

module.exports = router;
