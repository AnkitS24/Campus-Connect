const JUDGE0_STATUS = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
};

const mapJudge0Status = (statusId) => {
  switch (statusId) {
    case 3: return 'accepted';
    case 4: return 'wrong';
    case 5: return 'tle';
    case 6: return 'error';
    case 7: case 8: case 9: case 10: case 11: case 12: return 'runtime';
    default: return 'pending';
  }
};

const parseResult = (response) => {
  const statusId = response.status?.id || 0;
  return {
    status: mapJudge0Status(statusId),
    statusId,
    stdout: response.stdout || '',
    stderr: response.stderr || '',
    compileOutput: response.compile_output || '',
    time: parseFloat(response.time || 0),
    memory: response.memory || 0,
    message: JUDGE0_STATUS[statusId] || 'Unknown',
  };
};

module.exports = { JUDGE0_STATUS, mapJudge0Status, parseResult };
