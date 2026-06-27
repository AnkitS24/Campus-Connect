const Experience = require('../models/Experience');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.create({
    ...req.body,
    sharedBy: req.user._id,
  });

  ApiResponse.success(res, { experience }, 'Experience shared successfully', 201);
});

const getExperiences = asyncHandler(async (req, res) => {
  
  const { page = 1, limit = 10, company } = req.query;
  const query = {};
  if (company) query.company = { $regex: company, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Experience.countDocuments(query);

  const experiences = await Experience.find(query)
    .populate('sharedBy', 'fullName email avatar branch year')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  ApiResponse.paginated(res, { experiences }, {
    page: parseInt(page), limit: parseInt(limit), total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const upvoteExperience = asyncHandler(async (req, res) => {
  const exp = await Experience.findById(req.params.id);
  if (!exp) return ApiResponse.error(res, 'Experience not found', 404);

  const idx = exp.upvotes.indexOf(req.user._id);
  if (idx > -1) exp.upvotes.splice(idx, 1);
  else exp.upvotes.push(req.user._id);

  await exp.save();
  ApiResponse.success(res, { experience: exp }, 'Upvote updated');
});

module.exports = { createExperience, getExperiences, upvoteExperience };
