const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, userValidation } = require('../middleware/validation');

router.post('/register', validate(userValidation.register), register);
router.post('/login', validate(userValidation.login), login);
router.get('/me', protect, getMe);

module.exports = router;