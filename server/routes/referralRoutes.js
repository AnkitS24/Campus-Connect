const express = require('express');
const router = express.Router();
const { createReferral, getReferrals, applyReferral } = require('../controllers/referralController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getReferrals);
router.post('/', createReferral);
router.post('/:id/apply', applyReferral);

module.exports = router;
