const { Group, Membership, User, Contribution, Round } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, category, privacy, contribution_amount, frequency, max_members, total_rounds } = req.body;

    const group = await Group.create({
      name,
      description,
      category,
      privacy: privacy || 'public',
      contribution_amount,
      frequency: frequency || 'monthly',
      max_members: max_members || 10,
      total_rounds: total_rounds || 12,
      created_by: req.user.id,
    });

    // Add creator as admin
    await Membership.create({
      user_id: req.user.id,
      group_id: group.id,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public
const getGroups = async (req, res) => {
  try {
    const { search, category, privacy, status } = req.query;

    const where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    if (category) where.category = category;
    if (privacy) where.privacy = privacy;
    if (status) where.status = status;

    const groups = await Group.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Public
const getGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
        {
          model: Membership,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name', 'email', 'phone'],
            },
          ],
        },
        {
          model: Contribution,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name'],
            },
          ],
        },
        {
          model: Round,
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request to join a group (public groups)
// @route   POST /api/groups/:id/request-join
// @access  Private
const requestJoin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.privacy !== 'public') {
      return res.status(400).json({ message: 'Private groups require an invitation' });
    }

    // Check if already a member or pending
    const existing = await Membership.findOne({
      where: {
        user_id: req.user.id,
        group_id: group.id,
      },
    });

    if (existing) {
      if (existing.role === 'member' || existing.role === 'admin') {
        return res.status(400).json({ message: 'You are already a member' });
      }
      if (existing.role === 'pending') {
        return res.status(400).json({ message: 'Request already pending' });
      }
    }

    // Create pending membership
    await Membership.create({
      user_id: req.user.id,
      group_id: group.id,
      role: 'pending',
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Join request sent successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Deny join request (creator only)
// @route   PUT /api/groups/:id/requests/:userId
// @access  Private (creator only)
const handleRequest = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, userId } = req.params;
    const { action } = req.body;

    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is creator
    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can manage requests' });
    }

    const membership = await Membership.findOne({
      where: {
        user_id: userId,
        group_id: id,
        role: 'pending',
      },
    });

    if (!membership) {
      return res.status(404).json({ message: 'No pending request found' });
    }

    if (action === 'approve') {
      await membership.update({ role: 'member' }, { transaction: t });
      await t.commit();
      res.json({ message: 'Request approved successfully' });
    } else if (action === 'deny') {
      await membership.destroy({ transaction: t });
      await t.commit();
      res.json({ message: 'Request denied' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite user to private group
// @route   POST /api/groups/:id/invite
// @access  Private (creator only)
const inviteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can invite members' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already invited or member
    const existing = await Membership.findOne({
      where: {
        user_id: user.id,
        group_id: id,
      },
    });

    if (existing) {
      if (existing.role === 'member' || existing.role === 'admin') {
        return res.status(400).json({ message: 'User is already a member' });
      }
      if (existing.role === 'pending') {
        return res.status(400).json({ message: 'User already has a pending request' });
      }
      if (existing.role === 'invited') {
        return res.status(400).json({ message: 'User already invited' });
      }
    }

    // Create invite
    const invite = await Invite.create({
      group_id: id,
      invited_user_id: user.id,
      invited_by: req.user.id,
    });

    await Membership.create({
      user_id: user.id,
      group_id: id,
      role: 'invited',
    });

    res.status(201).json({
      message: 'Invitation sent successfully',
      invite,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  requestJoin,
  handleRequest,
  inviteUser,
};