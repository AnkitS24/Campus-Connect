const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    contestScore: {
      type: Number,
      default: 0,
    },
    contributionScore: {
      type: Number,
      default: 0,
    },
    codingScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
    },
    badges: [
      {
        name: { type: String },
        icon: { type: String },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      contestsParticipated: { type: Number, default: 0 },
      contestsWon: { type: Number, default: 0 },
      studyMaterialsShared: { type: Number, default: 0 },
      experiencesShared: { type: Number, default: 0 },
      problemsSolved: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

leaderboardSchema.index({ totalScore: -1 });
leaderboardSchema.index({ rank: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
