const express = require('express');
const router = express.Router();
const { createContest, getContests, joinContest } = require('../controllers/contestController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getContests);
router.post('/', createContest);
router.post('/:id/join', joinContest);

module.exports = router; 
