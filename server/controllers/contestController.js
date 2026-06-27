const Contest = require('../models/Contest');
const Leaderboard = require('../models/Leaderboard');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createContest = asyncHandler(async (req, res) => {
  const contest = await Contest.create({
    ...req.body,
    createdBy: req.user._id,
  });
  ApiResponse.success(res, { contest }, 'Contest created', 201);
});

const getContests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Contest.countDocuments(query);

  const contests = await Contest.find(query)
    .populate('createdBy', 'fullName')
    .skip(skip).limit(parseInt(limit))
    .sort({ startTime: -1 });

  ApiResponse.paginated(res, { contests }, {
    page: parseInt(page), limit: parseInt(limit), total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const joinContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return ApiResponse.error(res, 'Contest not found', 404);

  const alreadyJoined = contest.participants.find(
    (p) => p.user.toString() === req.user._id.toString()
  );
  if (alreadyJoined) return ApiResponse.error(res, 'Already joined', 400);

  contest.participants.push({ user: req.user._id, startedAt: new Date() });
  await contest.save();

  ApiResponse.success(res, null, 'Joined contest');
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const entries = await Leaderboard.find()
    .populate('user', 'fullName email avatar branch year')
    .sort({ totalScore: -1 })
    .limit(100);

  ApiResponse.success(res, { leaderboard: entries });
});

module.exports = { createContest, getContests, joinContest, getLeaderboard };
