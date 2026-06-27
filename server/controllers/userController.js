const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'fullName',
    'bio',
    'branch',
    'year',
    'skills',
    'socialLinks',
    'targetCompanies',
  ]; 

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'campusconnect/avatars',
  });

  req.user.avatar = result.secure_url;
  await req.user.save();

  ApiResponse.success(res, { avatar: result.secure_url }, 'Avatar uploaded successfully');
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'campusconnect/resumes',
    resourceType: 'raw',
  });

  req.user.resume = {
    url: result.secure_url,
    publicId: result.public_id,
    uploadedAt: new Date(),
  };
  await req.user.save();

  ApiResponse.success(res, { resume: req.user.resume }, 'Resume uploaded successfully');
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  ApiResponse.success(res, { user });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, branch, year, search } = req.query;

  const query = {};

  if (role) query.role = role;
  if (branch) query.branch = branch;
  if (year) query.year = parseInt(year);
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-refreshToken')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  ApiResponse.paginated(
    res,
    { users },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

module.exports = {
  updateProfile,
  uploadAvatar,
  uploadResume,
  getUserById,
  getAllUsers,
};
