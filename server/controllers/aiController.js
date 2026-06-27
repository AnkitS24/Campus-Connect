const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { analyzeResume, generateMentorResponse, generateChatSummary } = require('../services/ai/geminiService');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

const reviewResume = asyncHandler(async (req, res) => {

  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }
  // console.log("inside reviewResume function");
  let resumeText = '';

  try {
    if (req.file.mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
    } else {
      resumeText = req.file.buffer.toString('utf-8');
    }
  } catch (error) {
    //console.error('Error extracting text from resume:', error);
    return ApiResponse.error(res, 'Failed to parse resume file', 400);
  }

  // console.log(resumeText);

  if (!resumeText || resumeText.trim().length < 50) {
    return ApiResponse.error(res, 'Could not extract enough text from the resume', 400);
  }

  let result;
  try {
    result = await analyzeResume(resumeText);
  } catch (error) {
    return ApiResponse.error(res, 'AI analysis failed. Please try again.', 500);
  }

  // const uploadResult = await uploadToCloudinary(req.file.buffer, {
  //   folder: 'campusconnect/resumes',
  //   resourceType: 'raw',
  // });

  ApiResponse.success(
    res,
    {
      ...result,
      //resumeUrl: uploadResult.secure_url,
    },
    'Resume analyzed successfully'
  );
});

const chatWithMentor = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return ApiResponse.error(res, 'Message is required', 400);
  }

  try {
    const response = await generateMentorResponse(message);
    ApiResponse.success(res, { response }, 'Response generated');
  } catch (error) {
    return ApiResponse.error(res, 'Failed to generate response. Please try again.', 500);
  }
});

const summarizeChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return ApiResponse.error(res, 'Messages array is required', 400);
  }

  try {
    const summary = await generateChatSummary(messages);
    ApiResponse.success(res, { summary }, 'Summary generated');
  } catch (error) {
    return ApiResponse.error(res, 'Failed to generate summary', 500);
  }
});

module.exports = {
  reviewResume,
  chatWithMentor,
  summarizeChat,
};
