const { body } = require('express-validator');

const createPlacementValidator = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('eligibility')
    .optional()
    .isObject()
    .withMessage('Eligibility must be an object'),
  body('driveDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid drive date'),
];

module.exports = { createPlacementValidator };
