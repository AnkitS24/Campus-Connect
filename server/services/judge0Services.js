const axios = require('axios');
const { parseResult } = require('../utils/compileResult');

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

const submitCode = async ({ sourceCode, languageId, stdin, expectedOutput, timeLimit, memoryLimit }) => {
  const response = await axios.post(`${JUDGE0_URL}/submissions`, {
    source_code: sourceCode,
    language_id: languageId, 
    stdin: stdin || '',
    expected_output: expectedOutput,
    cpu_time_limit: timeLimit || 2,
    memory_limit: memoryLimit || 256000,
    redirect_stderr_to_stdout: true,
  }, { headers });

  return response.data;
};

const getSubmission = async (token) => {
  const response = await axios.get(`${JUDGE0_URL}/submissions/${token}`, {
    params: { base64_encoded: false, fields: '*' },
    headers : { 'Content-Type': 'application/json' },
  });
  return response.data;
};

const waitForResult = async (token, retries = 10, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    const result = await getSubmission(token);
    if (result.status?.id >= 3) {
      return parseResult(result);
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error('Judge0 polling timed out');
};

const batchSubmit = async (submissions) => {
  const response = await axios.post(`${JUDGE0_URL}/submissions/batch`, {
    submissions: submissions.map((s) => ({
      source_code: s.sourceCode,
      language_id: s.languageId,
      stdin: s.stdin || '',
      expected_output: s.expectedOutput || '', // Added fallback empty string
      cpu_time_limit: s.timeLimit || 2,
      memory_limit: s.memoryLimit || 256000,
    })),
  }, { 
    params: { base64_encoded: false },
    headers: { 'Content-Type': 'application/json' } // Fixed: Explicitly passed the header object
  });
  
  return response.data;
};

module.exports = { submitCode, getSubmission, waitForResult, batchSubmit };
