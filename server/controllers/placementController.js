const Placement = require('../models/Placement');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createPlacement = asyncHandler(async (req, res) => { 
  const placement = await Placement.create({
    ...req.body,
    createdBy: req.user._id,
  });

  const users = await require('../models/User').find({ role: 'student' });
  const notifications = users.map((u) => ({
    recipient: u._id,
    type: 'placement_new',
    title: `New Placement: ${placement.companyName}`,
    message: `${placement.companyName} is hiring for ${placement.role}`,
    data: { placementId: placement._id },
    link: `/placements/${placement._id}`,
  }));
  await Notification.insertMany(notifications);

  ApiResponse.success(res, { placement }, 'Placement created successfully', 201);
});

const getPlacements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, company, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (company) query.companyName = { $regex: company, $options: 'i' };
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Placement.countDocuments(query);

  const placements = await Placement.find(query)
    .populate('createdBy', 'fullName email')
    .populate('bookmarkedBy', 'fullName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ driveDate: -1 });

  ApiResponse.paginated(
    res,
    { placements },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

const getPlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('bookmarkedBy', 'fullName email')
    .populate('applicants.user', 'fullName email');

  if (!placement) {
    return ApiResponse.error(res, 'Placement not found', 404);
  }

  ApiResponse.success(res, { placement });
});

const bookmarkPlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findById(req.params.id);
  if (!placement) {
    return ApiResponse.error(res, 'Placement not found', 404);
  }

  const index = placement.bookmarkedBy.indexOf(req.user._id);
  if (index > -1) {
    placement.bookmarkedBy.splice(index, 1);
  } else {
    placement.bookmarkedBy.push(req.user._id);
  }

  await placement.save();
  ApiResponse.success(res, { placement }, 'Bookmark updated');
});


const updatePlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!placement) {
    return ApiResponse.error(res, 'Placement not found', 404);
  }

  ApiResponse.success(res, { placement }, 'Placement updated');
});

const deletePlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findByIdAndDelete(req.params.id);
  if (!placement) {
    return ApiResponse.error(res, 'Placement not found', 404);
  }

  ApiResponse.success(res, null, 'Placement deleted');
});

module.exports = {
  createPlacement,
  getPlacements,
  getPlacement,
  bookmarkPlacement,
  updatePlacement,
  deletePlacement,
};
