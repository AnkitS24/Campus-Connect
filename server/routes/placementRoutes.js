const express = require('express');
const router = express.Router();
const {
  createPlacement,
  getPlacements, 
  getPlacement,
  bookmarkPlacement,
  updatePlacement, 
  deletePlacement,
} = require('../controllers/placementController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { createPlacementValidator } = require('../validators/placementValidators');

router.use(protect);

router.get('/', getPlacements);
router.post('/', authorize('admin', 'tpo', 'cr'), createPlacementValidator, createPlacement);
router.get('/:id', getPlacement);
router.put('/:id', authorize('admin', 'tpo'), updatePlacement);
router.delete('/:id/delete', authorize('admin'), deletePlacement);
router.post('/:id/bookmark', bookmarkPlacement);


module.exports = router;
