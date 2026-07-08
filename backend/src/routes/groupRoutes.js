const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroup,
  requestJoin,
  handleRequest,
  getPendingRequests,
  inviteUser,
  contribute,
  leaveGroup,
  startCycle,
  drawWinner,
  getCycleStatus,
  endCycle,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.get('/', getGroups);
router.get('/:id/requests', protect, getPendingRequests);
router.get('/:id', getGroup);

router.post('/:id/request-join', protect, requestJoin);
router.put('/:id/requests/:userId', protect, handleRequest);
router.post('/:id/invite', protect, inviteUser);

router.post('/:id/contribute', protect, contribute);
router.delete('/:id/leave', protect, leaveGroup);

router.post('/:id/cycle/start', protect, startCycle);
router.post('/:id/cycle/draw', protect, drawWinner);
router.get('/:id/cycle/status', protect, getCycleStatus);
router.post('/:id/cycle/end', protect, endCycle);

module.exports = router;