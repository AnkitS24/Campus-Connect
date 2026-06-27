const { body } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('branch')
    .optional()
    .isIn(['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MCA', 'other'])
    .withMessage('Invalid branch'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('targetCompanies')
    .optional()
    .isArray()
    .withMessage('Target companies must be an array'),
];

module.exports = { updateProfileValidator };
