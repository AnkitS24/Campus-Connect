const Problem = require('../models/Problem');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createProblem = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    return ApiResponse.error(res, 'Only admins, TPOs, and CRs can create problems', 403);
  }  
  const problem = await Problem.create({ ...req.body, createdBy: req.user._id });

  ApiResponse.success(res, { problem }, 'Problem created', 201);
  
});

const getProblems = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, difficulty } = req.query;
  const query = {};
  if (difficulty) query.difficulty = difficulty;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Problem.countDocuments(query);

  const problems = await Problem.find(query)
    .skip(skip).limit(parseInt(limit))
    .sort({ createdAt: -1 });

  ApiResponse.paginated(res, { problems }, {
    page: parseInt(page), limit: parseInt(limit), total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const getProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return ApiResponse.error(res, 'Problem not found', 404);
  ApiResponse.success(res, { problem });
});

const updateProblem = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!problem) return ApiResponse.error(res, 'Problem not found', 404);
  ApiResponse.success(res, { problem }, 'Problem updated');
});

const deleteProblem = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    return ApiResponse.error(res, 'Not authorized', 403);
  }
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) return ApiResponse.error(res, 'Problem not found', 404);
  ApiResponse.success(res, null, 'Problem deleted');
});

module.exports = { createProblem, getProblems, getProblem, updateProblem, deleteProblem };
