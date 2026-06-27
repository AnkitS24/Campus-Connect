const MockInterview = require('../models/MockInterview');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { sendEmail } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

const requestInterview = asyncHandler(async (req, res) => {
  const { domain, preferredDate, preferredTime, notes } = req.body;
  if (!domain || !preferredDate || !preferredTime) {
    return ApiResponse.error(res, 'Domain, date, and time are required', 400);
  }

  const interview = await MockInterview.create({
    requester: req.user._id,
    domain,
    preferredDate: new Date(preferredDate),
    preferredTime,
    notes,
  });

  ApiResponse.success(res, { interview }, 'Interview request submitted', 201);
});

const getInterviewPool = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, domain } = req.query;

  const query = {
    status: "pending",
    requester: { $ne: req.user._id },
  };

  if (domain) query.domain = domain;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await MockInterview.countDocuments(query);

  const interviews = await MockInterview.find(query)
    .populate('requester', 'fullName email avatar branch year')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  ApiResponse.paginated(res, { interviews }, {
    page: parseInt(page), limit: parseInt(limit), total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const getMyInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, domain } = req.query;
  const query = {
    $or: [
      { requester: req.user._id },
      { interviewer: req.user._id },
    ],
  };

  if (status) query.status = status;
  if (domain) query.domain = domain;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await MockInterview.countDocuments(query);

  const interviews = await MockInterview.find(query)
    .populate('requester', 'fullName email avatar branch year')
    .populate('interviewer', 'fullName email avatar')
    .populate('feedback.providedBy', 'fullName email')
    .populate('rescheduleRequest.requestedBy', 'fullName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ scheduledAt: -1, createdAt: -1 });

  ApiResponse.paginated(res, { interviews }, {
    page: parseInt(page), limit: parseInt(limit), total,
    pages: Math.ceil(total / parseInt(limit)),
  });
}); 

const acceptInterview = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);
  if (interview.status !== 'pending') return ApiResponse.error(res, 'Interview is no longer pending', 400);
  if (interview.requester.toString() === req.user._id.toString()) {
    return ApiResponse.error(res, 'You cannot accept your own request', 400);
  }

  const scheduledAt = new Date(`${interview.preferredDate.toISOString().split('T')[0]}T${interview.preferredTime}`);

  interview.interviewer = req.user._id;
  interview.status = 'scheduled';
  interview.scheduledAt = scheduledAt;
  interview.webrtcRoom = uuidv4();
  await interview.save();

  await Notification.create({
    recipient: interview.requester, 
    type: 'interview_accepted',
    title: 'Interview Accepted',
    message: `Your ${interview.domain} interview has been accepted and scheduled for ${interview.preferredDate.toLocaleDateString()} at ${interview.preferredTime}`,
    data: { interviewId: interview._id },
    link: '/mock-interviews',
  });

  ApiResponse.success(res, { interview }, 'Interview accepted');
});

const rejectInterview = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);
  if (interview.status !== 'pending') return ApiResponse.error(res, 'Interview is no longer pending', 400);

  interview.status = 'cancelled';
  await interview.save();

  ApiResponse.success(res, null, 'Interview rejected');
});

const requestReschedule = asyncHandler(async (req, res) => {
  
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);
  if (interview.status !== 'scheduled') return ApiResponse.error(res, 'Only scheduled interviews can be rescheduled', 400);

  const isRequester = interview.requester.toString() === req.user._id.toString();
  const isInterviewer = interview.interviewer?.toString() === req.user._id.toString();
  if (!isRequester && !isInterviewer) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  const scheduledAt = new Date(`${interview.preferredDate.toISOString().split('T')[0]}T${interview.preferredTime}`);
  const now = new Date();
  const diffMs = scheduledAt.getTime() - now.getTime();
  const diffMins = diffMs / (1000 * 60);

  if (diffMins < 30) {
    return ApiResponse.error(res, 'Cannot reschedule within 30 minutes of the interview', 400);
  }

  const { newDate, newTime, reason } = req.body;
  if (!newDate || !newTime) {
    return ApiResponse.error(res, 'New date and time are required', 400);
  }

  interview.rescheduleRequest = {
    requestedBy: req.user._id,
    newDate: new Date(newDate),
    newTime,
    reason: reason || '',
    status: true,
  };
  await interview.save();

  const otherUserId = isRequester ? interview.interviewer : interview.requester;
  await Notification.create({
    recipient: otherUserId,
    type: 'interview_request',
    title: 'Reschedule Request',
    message: `A reschedule has been requested for your ${interview.domain} interview`,
    data: { interviewId: interview._id },
    link: '/mock-interviews',
  });

  ApiResponse.success(res, { interview }, 'Reschedule request submitted');
});

const acceptReschedule = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);
  if (!interview.rescheduleRequest || interview.rescheduleRequest.status == false) {
    return ApiResponse.error(res, 'No pending reschedule request', 400);
  }

  const isRequester = interview.requester.toString() === req.user._id.toString();
  const isInterviewer = interview.interviewer?.toString() === req.user._id.toString();
  if (!isRequester && !isInterviewer) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  const { newDate, newTime } = interview.rescheduleRequest;
  interview.preferredDate = newDate;
  interview.preferredTime = newTime;
  interview.scheduledAt = new Date(`${newDate.toISOString().split('T')[0]}T${newTime}`);
  interview.rescheduleRequest.status = false;
  interview.reminderSent = false;
  await interview.save();

  const otherUserId = isRequester ? interview.interviewer : interview.requester;
  await Notification.create({
    recipient: otherUserId,
    type: 'interview_accepted',
    title: 'Reschedule Accepted',
    message: `Your ${interview.domain} interview has been rescheduled to ${newDate.toLocaleDateString()} at ${newTime}`,
    data: { interviewId: interview._id },
    link: '/mock-interviews',
  });

  const requesterUser = await User.findById(interview.requester);
  const interviewerUser = await User.findById(interview.interviewer);
  const emailHtml = `
    <h2>Interview Rescheduled</h2>
    <p>Your <strong>${interview.domain}</strong> interview has been rescheduled.</p>
    <p><strong>New Date:</strong> ${newDate.toLocaleDateString()}</p>
    <p><strong>New Time:</strong> ${newTime}</p>
    <p>Login to CampusConnect to view details.</p>
  `;
  await Promise.allSettled([
    sendEmail({ to: requesterUser?.email, subject: `Interview Rescheduled - ${interview.domain}`, html: emailHtml }),
    sendEmail({ to: interviewerUser?.email, subject: `Interview Rescheduled - ${interview.domain}`, html: emailHtml }),
  ]);

  ApiResponse.success(res, { interview }, 'Reschedule accepted');
});

const cancelReschedule = asyncHandler(async(req,res) => {
  
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);
  if (!interview.rescheduleRequest || interview.rescheduleRequest.status == false) {
    return ApiResponse.error(res, 'No pending reschedule request', 400);
  }

  const isRequester = interview.requester.toString() === req.user._id.toString();
  const isInterviewer = interview.interviewer?.toString() === req.user._id.toString();
  if (!isRequester && !isInterviewer) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }
  const { newDate, newTime } = interview.rescheduleRequest;
  interview.rescheduleRequest.status = false;
  await interview.save();

  const otherUserId = isRequester ? interview.interviewer : interview.requester;
  await Notification.create({
    recipient: otherUserId,
    type: 'interview_accepted',
    title: 'Reschedule Cancelled',
    message: `Your ${interview.domain} interview reschedule request on ${newDate.toLocaleDateString()} at ${newTime} has been cancelled`,
    data: { interviewId: interview._id },
    link: '/mock-interviews',
  });
  ApiResponse.success(res, { interview }, 'Reschedule canceled');
});


const cancelInterview = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);

  const isRequester = interview.requester.toString() === req.user._id.toString();
  const isInterviewer = interview.interviewer?.toString() === req.user._id.toString();
  if (!isRequester && !isInterviewer) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  interview.status = 'cancelled';
  await interview.save();

  ApiResponse.success(res, null, 'Interview cancelled');
});

const submitFeedback = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);
  if (!interview) return ApiResponse.error(res, 'Interview not found', 404);
  if (interview.status !== 'scheduled') return ApiResponse.error(res, 'Interview must be completed first', 400);

  const isRequester = interview.requester.toString() === req.user._id.toString();
  const isInterviewer = interview.interviewer?.toString() === req.user._id.toString();
  if (!isRequester && !isInterviewer) return ApiResponse.error(res, 'Not authorized', 403);

  interview.feedback = {
    ...req.body,
    providedBy: req.user._id,
    providedAt: new Date(),
  };
  interview.status = 'completed';
  await interview.save();

  ApiResponse.success(res, { interview }, 'Feedback submitted');
});

module.exports = {
  requestInterview,
  getInterviewPool,
  getMyInterviews,
  acceptInterview,
  rejectInterview,
  requestReschedule,
  acceptReschedule,
  cancelReschedule,
  cancelInterview,
  submitFeedback,
};
