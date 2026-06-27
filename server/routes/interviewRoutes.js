const express = require('express');
const router = express.Router();
const {
  requestInterview,
  getInterviewPool,
  getMyInterviews,
  acceptInterview, 
  rejectInterview,
  requestReschedule,
  acceptReschedule,
  cancelReschedule,
  cancelInterview,
  submitFeedback,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', requestInterview);
router.get('/pool', getInterviewPool); 
router.get('/my', getMyInterviews);
router.put('/:id/accept', acceptInterview);
router.put('/:id/reject', rejectInterview);
router.post('/:id/reschedule', requestReschedule);
router.put('/:id/reschedule/accept', acceptReschedule);
router.put('/:id/reschedule/cancel', cancelReschedule);
router.put('/:id/cancel', cancelInterview);
router.post('/:id/feedback', submitFeedback);

module.exports = router;
