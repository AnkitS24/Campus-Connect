const Group = require('../models/Group');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createGroup = asyncHandler(async (req, res) => {
  const { name, description, type, isPrivate } = req.body;

  if (!name || !type) {
    return ApiResponse.error(res, 'Name and type are required', 400);
  }

  const group = await Group.create({
    name,
    description,
    type,
    isPrivate: isPrivate || false,
    createdBy: req.user._id,
    admins: [req.user._id],
    members: [{ userId: req.user._id}],
  });

  ApiResponse.success(res, { group }, 'Group created successfully', 201);
});

const getGroups = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, search } = req.query;
  const query = {};

  if (type) query.type = type;
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Group.countDocuments(query);

  const groups = await Group.find(query)
    .populate('createdBy', 'fullName email')
    .populate('members', 'fullName email avatar')
    .populate('admins', 'fullName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ updatedAt: -1 });

  ApiResponse.paginated(
    res,
    { groups },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('members', 'fullName email avatar role')
    .populate('admins', 'fullName email');

  if (!group) {
    return ApiResponse.error(res, 'Group not found', 404);
  }

  ApiResponse.success(res, { group });
});

const joinGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return ApiResponse.error(res, 'Group not found', 404);
  }

  if (group.members.includes(req.user._id)) {
    return ApiResponse.error(res, 'Already a member', 400);
  }

  group.members.push(req.user._id);
  await group.save();

  ApiResponse.success(res, { group }, 'Joined group successfully');
});

const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return ApiResponse.error(res, 'Group not found', 404);
  }

  if (!group.members.includes(req.user._id)) {
    return ApiResponse.error(res, 'Not a member', 400);
  }

  group.members = group.members.filter(
    (m) => m.toString() !== req.user._id.toString()
  );
  await group.save();

  ApiResponse.success(res, null, 'Left group successfully');
});

const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return ApiResponse.error(res, 'Group not found', 404);
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Only the group creator can delete this group', 403);
  }

  await Message.deleteMany({ group: group._id });
  await Group.findByIdAndDelete(group._id);

  ApiResponse.success(res, null, 'Group deleted successfully');
});

const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Message.countDocuments({ group: req.params.id });

  const messages = await Message.find({ group: req.params.id })
    .populate('sender', 'fullName email avatar role')
    .populate('readBy', 'fullName email avatar')
    .populate('reactions.user', 'fullName email')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'fullName' },
    })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: 1 });

  ApiResponse.paginated(
    res,
    { messages },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

const getMessagesCount = asyncHandler(async (req, res) => {
  const groupId = req.params.id; 
  if (!groupId) {
    return ApiResponse.error(res, 'groupId is required', 400);
  }
  const { userId } = req.query;

  //console.log('groupId:', groupId, 'userId:', userId);
  const result = await Group.findOne({ _id: groupId, 'members.userId': userId }, { 'members.$': 1 }).lean() ;
  //console.log('result:', result);
  const msgID = result?.members?.[0]?.lastReadMessageId || null;

  let unreadCount = 0;
  if (!msgID) {
    unreadCount = await Message.countDocuments({
      group : groupId
    });
  } else {
      unreadCount = await Message.countDocuments({
        group: groupId,
        _id: { $gt: msgID }
      });
    }

  ApiResponse.success(res, {unreadCount });
});

const updateLastReadMessage = asyncHandler(async (req, res) => {
  const {groupId} = req.body;

  if (!groupId || !req.user?._id ) {
    return ApiResponse.error(res, 'groupId and userId are required', 400);
  }
  const lastMessage = await Message.findOne({ group: groupId }).sort({ _id: -1 }).select('_id');
  //console.log('lastmessages id : ',lastMessage)

  const group = await Group.findOneAndUpdate(
    { _id: groupId, 'members.userId': req.user._id},
    { $set: { 'members.$.lastReadMessageId': lastMessage?._id } },
    { new: true }
  );

  if (!group) {
    return ApiResponse.error(res, 'Group or member not found', 404);
  }

  ApiResponse.success(res, {group}, 'Last read message updated successfully');
});

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getMessages,
  getMessagesCount,
  updateLastReadMessage
};
