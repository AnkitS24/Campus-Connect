const express = require('express');
const router = express.Router();
const { createProblem, getProblems, getProblem, updateProblem, deleteProblem } = require('../controllers/problemController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getProblems);
router.get('/:id', getProblem);
router.post('/', createProblem);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

module.exports = router;
