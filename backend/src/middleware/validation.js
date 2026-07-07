const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  };
};

const userValidation = {
  register: [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional(),
  ],
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const groupValidation = {
  create: [
    body('name').notEmpty().withMessage('Group name is required'),
    body('contribution_amount').isNumeric().withMessage('Contribution amount must be a number'),
    body('max_members').isInt({ min: 2 }).withMessage('Max members must be at least 2'),
  ],
};

module.exports = { validate, userValidation, groupValidation };