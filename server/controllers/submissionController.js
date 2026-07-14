const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { getLanguageId } = require('../utils/languageMap');
// Note: We now import batchSubmit and waitForResult to evaluate all test cases cleanly
const { batchSubmit, waitForResult, submitCode } = require('../services/judge0Services');

const axios = require("axios");

const LANGUAGE_CONFIG = {
  cpp: {
    language: "c++",
    version: "10.2.0",
  },
  python: {
    language: "python",
    version: "3.12.0",
  },
  java: {
    language: "java",
    version: "15.0.2",
  },
  javascript: {
    language: "javascript",
    version: "20.11.1",
  },
  c: {
  language: "c",
  version: "10.2.0",
},
};


const runCode = asyncHandler(async (req, res) => {
  const { code, language, testCases = [], problem: problemId } = req.body;
  
  if (!code || !language) {
    return ApiResponse.error(res, "Code and language are required", 400);
  }

  let timeLimit = 2;
  let memoryLimit = 256;

  if (problemId) {
    const problem = await Problem.findById(problemId);

    if (problem) {
      timeLimit = problem.timeLimit;
      memoryLimit = problem.memoryLimit;
    }
  }

  try {
    // Get installed runtimes from Piston
    const runtime = LANGUAGE_CONFIG[language];

    if (!runtime) {
      return ApiResponse.error(
        res,
        `Language ${language} is not supported by Piston`,
        400
      );
    }

    console.log(runtime.language)
    console.log(runtime.version)
    console.log(code)
    console.log(testCases)
    // Execute every test case
    const executions = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          const response = await axios.post(
            "http://localhost:2000/api/v2/execute",
            {
              language: runtime.language,
              version: runtime.version,
              files: [
                {
                  content: code,
                },
              ],
              stdin: testCase.input || "",
              compile_timeout: timeLimit * 1000,
              run_timeout: timeLimit * 1000,
              run_memory_limit: memoryLimit * 1024 * 1024,
            }
          );

          return {
            stdout: response.data.run?.stdout || "",
            stderr: response.data.run?.stderr || "",
            compile_output: response.data.compile?.stderr || "",
            time: response.data.run?.time || 0,
            memory: response.data.run?.memory || 0,
            status:
              response.data.run?.code === 0
                ? { id: 3, description: "Accepted" }
                : { id: 4, description: "Runtime Error" },
          };
        } catch (err) {
          console.log("Status:", err.response?.status);
          console.log("Response:", err.response?.data);
          return {
            stdout: "",
            stderr: err.message,
            compile_output: "",
            time: 0,
            memory: 0,
            status: {
              id: 13,
              description: "Internal Error",
            },
          };
        }
      })
    );
    console.log(executions);

    return ApiResponse.success(
      res,
      { runs: executions },
      "Code executed successfully"
    );
  } catch (err) {
    return ApiResponse.error(
      res,
      `Execution failed: ${err.message}`,
      500
    );
  }
});


const createSubmission = asyncHandler(async (req, res) => {
  const { problem: problemId, code, language } = req.body;
  if (!problemId || !code || !language) {
    return ApiResponse.error(res, 'Problem, code, and language are required', 400);
  }

  const problem = await Problem.findById(problemId);
  if (!problem) return ApiResponse.error(res, 'Problem not found', 404);

  const languageId = getLanguageId(language);
  if (!languageId) return ApiResponse.error(res, `Unsupported language: ${language}`, 400);

  // 1. Prepare ALL test cases for a batch execution request
  const batchRequests = problem.testCases.map((testCase) => ({
    sourceCode: code,
    languageId,
    stdin: testCase.input || '',
    expectedOutput: testCase.output || '',
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
  }));

  // 2. Fire the batch submission request to local Judge0
  const tokensArray = await batchSubmit(batchRequests);

  // 3. Resolve all tokens synchronously or asynchronously via your polling mechanism
  // (If you want to keep the worker setup, you can pass 'tokensArray' to your background process here)
  const results = await Promise.all(
    tokensArray.map((t) => waitForResult(t.token).catch((err) => ({ status: { id: 4 }, message: err.message })))
  );

  // 4. Calculate final stats based on parsed results
  const passedCases = results.filter((r) => r.status?.id === 3).length; // 3 is 'Accepted'
  const totalCases = problem.testCases.length;
  
  // Pick a final status: If all passed, it's 'accepted', otherwise mark it by the first failing case status
  let finalStatus = 'accepted';
  const failedCase = results.find((r) => r.status?.id !== 3);
  if (failedCase) {
    const statusMap = { 4: 'wrong', 5: 'tle', 6: 'runtime' };
    finalStatus = statusMap[failedCase.status?.id] || 'error';
  }

  // Find max execution metrics to give accurate feedback to the user
  const maxTime = Math.max(...results.map((r) => r.time || 0));
  const maxMemory = Math.max(...results.map((r) => r.memory || 0));

  // 5. Create the single, completed submission record in your DB
  const submission = await Submission.create({
    user: req.user._id,
    problem: problemId,
    code,
    language,
    languageId,
    status: finalStatus,
    testCasesPassed: passedCases,
    totalTestCases: totalCases,
    timeTaken: maxTime,
    memoryUsed: maxMemory,
    judge0Response: results, // Save full results array for editor diagnostics
  });

  ApiResponse.success(res, { submission }, 'Code executed and submission scored', 201);
});

const getSubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, problem: problemId } = req.query;
  const query = { user: req.user._id };
  
  if (problemId) query.problem = problemId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Submission.countDocuments(query);

  const submissions = await Submission.find(query)
    .populate('problem', 'title')
    .sort({ createdAt: -1 }) // Optimized: Utilizing the automatic 'createdAt' timestamp from your schema
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, { submissions }, {
    page: parseInt(page), 
    limit: parseInt(limit), 
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('problem', 'title description')
    .populate('user', 'fullName email');
  if (!submission) return ApiResponse.error(res, 'Submission not found', 404);

  // Security layer: Ensure users can only look at their own historical solution code
  if (submission.user._id.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  ApiResponse.success(res, { submission });
});

module.exports = { createSubmission, getSubmissions, getSubmission,runCode };