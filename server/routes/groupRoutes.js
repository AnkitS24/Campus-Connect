const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getMessages,
  getMessagesCount,
  updateLastReadMessage
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getGroups);
router.post('/', createGroup);
router.get('/:id', getGroup);
router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);
router.delete('/:id', deleteGroup);
router.get('/:id/messages', getMessages);
router.get('/:id/messages/count',getMessagesCount);
router.post('/update-last-read', updateLastReadMessage);

module.exports = router;
