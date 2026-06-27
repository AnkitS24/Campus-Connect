const Referral = require('../models/Referral');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createReferral = asyncHandler(async (req, res) => {
  const referral = await Referral.create({
    ...req.body,
    postedBy: req.user._id,
  });
  ApiResponse.success(res, { referral }, 'Referral posted', 201);
});

const getReferrals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, company } = req.query;
  const query = { status: 'open' };
  if (company) query.company = { $regex: company, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Referral.countDocuments(query);

  const referrals = await Referral.find(query)
    .populate('postedBy', 'fullName email avatar')
    .skip(skip).limit(parseInt(limit))
    .sort({ createdAt: -1 });

  ApiResponse.paginated(res, { referrals }, {
    page: parseInt(page), limit: parseInt(limit), total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const applyReferral = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id);
  if (!referral) return ApiResponse.error(res, 'Referral not found', 404);

  const alreadyApplied = referral.applicants.find(
    (a) => a.user.toString() === req.user._id.toString()
  );
  if (alreadyApplied) return ApiResponse.error(res, 'Already applied', 400);

  referral.applicants.push({
    user: req.user._id,
    message: req.body.message || '',
  });
  await referral.save();

  ApiResponse.success(res, null, 'Application submitted');
});

module.exports = { createReferral, getReferrals, applyReferral };
