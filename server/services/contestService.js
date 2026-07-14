const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const Leaderboard = require('../models/Leaderboard');
const { getContestLeaderboard } = require('./leaderboardService');

const getActiveContest = async () => {
  const now = new Date();
  const contest = await Contest.findOne({
    startTime: { $lte: now },
    endTime: { $gte: now },
    status: 'active',
  }).populate('problems');

  return contest;
};

const getLatestContest = async () => {
  return Contest.findOne({ status: 'completed' })
    .sort({ endTime: -1 })
    .populate('problems');
};

const getUpcomingContests = async () => {
  const now = new Date();
  return Contest.find({ startTime: { $gt: now }, status: 'upcoming' })
    .sort({ startTime: 1 })
    .populate('createdBy', 'fullName');
};

const updateContestStatus = async () => {
  const now = new Date();
  await Contest.updateMany(
    { startTime: { $lte: now }, status: 'upcoming' },
    { status: 'active' }
  );
  await Contest.updateMany(
    { endTime: { $lte: now }, status: 'active' },
    { status: 'completed' }
  );
};

const getUserContestStatus = async (contestId, userId) => {
  const submissions = await Submission.find({ contest: contestId, user: userId });
  const accepted = submissions.filter((s) => s.status === 'accepted');
  const pending = submissions.filter((s) => s.status === 'pending');

  return {
    total: submissions.length,
    accepted: accepted.length,
    pending: pending.length,
    problemsSolved: [...new Set(accepted.map((s) => s.problem.toString()))],
  };
};

module.exports = {
  getActiveContest, getLatestContest, getUpcomingContests,
  updateContestStatus, getUserContestStatus,
};
