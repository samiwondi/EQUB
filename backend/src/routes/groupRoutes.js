const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroup,
  requestJoin,
  handleRequest,
  inviteUser,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/:id/request-join', protect, requestJoin);
router.put('/:id/requests/:userId', protect, handleRequest);
router.post('/:id/invite', protect, inviteUser);

module.exports = router;