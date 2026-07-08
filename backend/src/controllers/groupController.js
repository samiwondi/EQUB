const { Group, Membership, User, Contribution, Round, Invite, Cycle, RoundWinner } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// ===============================
// GROUP CRUD
// ===============================

const createGroup = async (req, res) => {
  try {
    const { name, description, category, privacy, contribution_amount, frequency, max_members } = req.body;

    const group = await Group.create({
      name,
      description,
      category,
      privacy: privacy || 'public',
      contribution_amount,
      frequency: frequency || 'monthly',
      max_members: max_members || 10,
      status: 'open',
      created_by: req.user.id,
    });

    await Membership.create({
      user_id: req.user.id,
      group_id: group.id,
      role: 'admin',
      active_in_cycle: false,
    });

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const { search, category, privacy } = req.query;

    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;
    if (privacy) where.privacy = privacy;

    const groups = await Group.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { model: Membership, attributes: ['user_id', 'role'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        {
          model: Membership,
          include: [{ model: User, attributes: ['id', 'full_name', 'email', 'phone'] }],
        },
        {
          model: Cycle,
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: Round,
              include: [
                { model: User, as: 'winner', attributes: ['id', 'full_name'] },
                { model: User, as: 'fixedWinner', attributes: ['id', 'full_name'] },
              ],
              order: [['round_number', 'ASC']], // <-- FIXED: Rounds now in correct order
            },
          ],
        },
        {
          model: Contribution,
          include: [{ model: User, attributes: ['id', 'full_name'] }],
          limit: 10,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// JOIN REQUESTS
// ===============================

const requestJoin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.privacy === 'private') {
      return res.status(400).json({ message: 'Private groups require an invitation' });
    }

    // Check if group is full
    const memberCount = await Membership.count({
      where: { group_id: group.id, role: ['member', 'admin'] },
    });
    if (memberCount >= group.max_members) {
      return res.status(400).json({ message: 'Group is full' });
    }

    const existing = await Membership.findOne({
      where: { user_id: req.user.id, group_id: group.id },
    });

    if (existing) {
      if (existing.role === 'member' || existing.role === 'admin') {
        return res.status(400).json({ message: 'You are already a member' });
      }
      if (existing.role === 'pending') {
        return res.status(400).json({ message: 'Request already pending' });
      }
    }

    await Membership.create({
      user_id: req.user.id,
      group_id: group.id,
      role: 'pending',
      active_in_cycle: false,
      has_won: false,
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Join request sent successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

const handleRequest = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, userId } = req.params;
    const { action } = req.body;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can manage requests' });
    }

    const membership = await Membership.findOne({
      where: { user_id: userId, group_id: id, role: 'pending' },
    });

    if (!membership) return res.status(404).json({ message: 'No pending request found' });

    if (action === 'approve') {
      // Check if group is full before approving
      const memberCount = await Membership.count({
        where: { group_id: id, role: ['member', 'admin'] },
      });
      if (memberCount >= group.max_members) {
        return res.status(400).json({ message: 'Group is full. Cannot approve more members.' });
      }

      // Check if there is an active cycle
      const activeCycle = await Cycle.findOne({
        where: { group_id: id, status: 'active' },
      });

      // New members are added as 'member' but active_in_cycle = false if cycle active
      await membership.update({
        role: 'member',
        active_in_cycle: activeCycle ? false : true,
        has_won: false,
      }, { transaction: t });

      await t.commit();
      res.json({
        message: activeCycle
          ? 'Request approved. User will join the next cycle.'
          : 'Request approved. User can participate immediately.',
      });
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

const getPendingRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can view pending requests' });
    }

    const pendingMembers = await Membership.findAll({
      where: { group_id: id, role: 'pending' },
      include: [{ model: User, attributes: ['id', 'full_name', 'email'] }],
    });

    res.json(pendingMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// INVITES (Private groups)
// ===============================

const inviteUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { email } = req.body;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can invite members' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check group capacity
    const memberCount = await Membership.count({
      where: { group_id: id, role: ['member', 'admin'] },
    });
    if (memberCount >= group.max_members) {
      return res.status(400).json({ message: 'Group is full' });
    }

    const existing = await Membership.findOne({
      where: { user_id: user.id, group_id: id },
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

    const invite = await Invite.create({
      group_id: id,
      invited_user_id: user.id,
      invited_by: req.user.id,
    }, { transaction: t });

    await Membership.create({
      user_id: user.id,
      group_id: id,
      role: 'invited',
      active_in_cycle: false,
      has_won: false,
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Invitation sent successfully', invite });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// CONTRIBUTIONS
// ===============================

const contribute = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const membership = await Membership.findOne({
      where: { user_id: req.user.id, group_id: id, role: ['member', 'admin'] },
    });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });

    if (!membership.active_in_cycle) {
      return res.status(400).json({ message: 'You are not active in the current cycle' });
    }

    const cycle = await Cycle.findOne({
      where: { group_id: id, status: 'active' },
    });
    if (!cycle) return res.status(400).json({ message: 'No active cycle found' });

    const existingContribution = await Contribution.findOne({
      where: {
        user_id: req.user.id,
        group_id: id,
        cycle_id: cycle.id,
        round_number: cycle.current_round,
      },
    });
    if (existingContribution) {
      return res.status(400).json({ message: 'You have already contributed for this round' });
    }

    const fixedAmount = group.contribution_amount;

    const contribution = await Contribution.create({
      user_id: req.user.id,
      group_id: id,
      cycle_id: cycle.id,
      round_number: cycle.current_round,
      amount: fixedAmount,
      status: 'paid',
      payment_method: payment_method || 'cash',
      paid_at: new Date(),
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Contribution submitted successfully',
      contribution,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// LEAVE GROUP
// ===============================

const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const membership = await Membership.findOne({
      where: {
        user_id: req.user.id,
        group_id: id,
        role: ['member', 'admin'],
      },
    });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });

    await membership.destroy();

    res.json({ message: 'You have left the group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EQUIB CYCLE MANAGEMENT
// ===============================

const startCycle = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { start_date, winOrder } = req.body;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can start a cycle' });
    }

    const activeCycle = await Cycle.findOne({
      where: { group_id: id, status: 'active' },
    });
    if (activeCycle) {
      return res.status(400).json({ message: 'An active cycle already exists' });
    }

    // Activate all members (set active_in_cycle = true, has_won = false)
    await Membership.update(
      { active_in_cycle: true, has_won: false },
      { where: { group_id: id, role: ['member', 'admin'] }, transaction: t }
    );

    const members = await Membership.findAll({
      where: { group_id: id, role: ['member', 'admin'] },
    });
    const totalMembers = members.length;

    if (totalMembers < 2) {
      return res.status(400).json({ message: 'Group needs at least 2 members to start a cycle' });
    }

    const lastCycle = await Cycle.findOne({
      where: { group_id: id },
      order: [['cycle_number', 'DESC']],
    });
    const cycleNumber = lastCycle ? lastCycle.cycle_number + 1 : 1;

    const cycle = await Cycle.create({
      group_id: id,
      cycle_number: cycleNumber,
      start_date: start_date || new Date(),
      total_rounds: totalMembers,
      current_round: 1,
      status: 'active',
    }, { transaction: t });

    if (winOrder && Array.isArray(winOrder) && winOrder.length === totalMembers) {
      for (let i = 0; i < winOrder.length; i++) {
        await Round.create({
          cycle_id: cycle.id,
          round_number: i + 1,
          fixed_winner_id: winOrder[i],
          is_fixed: true,
          amount: totalMembers * group.contribution_amount,
          status: 'pending',
        }, { transaction: t });
      }
    } else {
      for (let i = 0; i < totalMembers; i++) {
        await Round.create({
          cycle_id: cycle.id,
          round_number: i + 1,
          fixed_winner_id: null,
          is_fixed: false,
          amount: totalMembers * group.contribution_amount,
          status: 'pending',
        }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Cycle started successfully', cycle });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

const drawWinner = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can draw winners' });
    }

    const cycle = await Cycle.findOne({
      where: { group_id: id, status: 'active' },
    });
    if (!cycle) return res.status(404).json({ message: 'No active cycle found' });

    if (cycle.current_round > cycle.total_rounds) {
      return res.status(400).json({ message: 'All rounds have been completed' });
    }

    // Ensure all active members have contributed
    const activeMembers = await Membership.findAll({
      where: { group_id: id, active_in_cycle: true, role: ['member', 'admin'] },
      include: [{ model: User, attributes: ['id', 'full_name'] }],
    });

    const currentRound = cycle.current_round;

    for (const member of activeMembers) {
      const contribution = await Contribution.findOne({
        where: {
          user_id: member.user_id,
          group_id: id,
          cycle_id: cycle.id,
          round_number: currentRound,
          status: 'paid',
        },
      });
      if (!contribution) {
        return res.status(400).json({
          message: `Member ${member.User?.full_name || member.user_id} has not contributed for Round ${currentRound}`,
        });
      }
    }

    const round = await Round.findOne({
      where: { cycle_id: cycle.id, round_number: cycle.current_round },
    });
    if (!round) return res.status(404).json({ message: 'Round not found' });

    let winner;

    if (round.is_fixed && round.fixed_winner_id) {
      const fixedWinner = await User.findByPk(round.fixed_winner_id);
      if (!fixedWinner) {
        return res.status(404).json({ message: 'Fixed winner not found' });
      }
      winner = await Membership.findOne({
        where: { user_id: round.fixed_winner_id, group_id: id },
        include: [{ model: User, attributes: ['id', 'full_name'] }],
      });
      if (!winner) {
        return res.status(400).json({ message: 'Fixed winner is not a member of this group' });
      }
    } else {
      const eligibleMembers = await Membership.findAll({
        where: {
          group_id: id,
          has_won: false,
          active_in_cycle: true,
          role: ['member', 'admin'],
        },
        include: [{ model: User, attributes: ['id', 'full_name'] }],
      });

      if (eligibleMembers.length === 0) {
        return res.status(400).json({ message: 'No eligible members left for this round' });
      }

      winner = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
    }

    await winner.update({ has_won: true }, { transaction: t });

    const totalActiveMembers = await Membership.count({
      where: { group_id: id, active_in_cycle: true, role: ['member', 'admin'] },
    });
    const pot = totalActiveMembers * group.contribution_amount;

    await round.update({
      winner_id: winner.user_id,
      amount: pot,
      status: 'paid',
      paid_at: new Date(),
    }, { transaction: t });

    await RoundWinner.create({
      cycle_id: cycle.id,
      round_number: cycle.current_round,
      winner_id: winner.user_id,
      amount: pot,
    }, { transaction: t });

    await cycle.update({
      current_round: cycle.current_round + 1,
    }, { transaction: t });

    if (cycle.current_round > cycle.total_rounds) {
      await cycle.update({
        status: 'completed',
        completed_at: new Date(),
      }, { transaction: t });
    }

    await t.commit();

    res.json({
      message: `Winner drawn: ${winner.User.full_name}`,
      winner: winner.User,
      remaining: await Membership.count({
        where: { group_id: id, has_won: false, active_in_cycle: true, role: ['member', 'admin'] },
      }),
      cycleCompleted: cycle.current_round > cycle.total_rounds,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

const getCycleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const cycle = await Cycle.findOne({
      where: { group_id: id, status: 'active' },
      include: [
        {
          model: Round,
          include: [
            { model: User, as: 'winner', attributes: ['id', 'full_name'] },
            { model: User, as: 'fixedWinner', attributes: ['id', 'full_name'] },
          ],
          order: [['round_number', 'ASC']],
        },
      ],
      order: [[{ model: Round }, 'round_number', 'ASC']],
    });

    if (!cycle) {
      return res.json({ message: 'No active cycle', cycle: null });
    }

    const members = await Membership.findAll({
      where: { group_id: id, role: ['member', 'admin'] },
      include: [{ model: User, attributes: ['id', 'full_name', 'email'] }],
    });

    res.json({
      cycle,
      members,
      remaining: members.filter(m => !m.has_won).length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const endCycle = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { action } = req.body;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can end a cycle' });
    }

    const cycle = await Cycle.findOne({
      where: { group_id: id, status: 'active' },
    });
    if (!cycle) return res.status(404).json({ message: 'No active cycle found' });

    if (action === 'reform') {
      await Membership.update(
        { has_won: false },
        { where: { group_id: id, role: ['member', 'admin'] }, transaction: t }
      );
      await cycle.update({
        status: 'completed',
        completed_at: new Date(),
      }, { transaction: t });

      const totalMembers = await Membership.count({
        where: { group_id: id, role: ['member', 'admin'] },
      });
      await Cycle.create({
        group_id: id,
        cycle_number: cycle.cycle_number + 1,
        start_date: new Date(),
        total_rounds: totalMembers,
        status: 'active',
      }, { transaction: t });

      await Membership.update(
        { active_in_cycle: true, has_won: false },
        { where: { group_id: id, role: ['member', 'admin'] }, transaction: t }
      );

      await t.commit();
      res.json({ message: 'Cycle reformed and new cycle started successfully' });
    } else if (action === 'dismantle') {
      await cycle.update({
        status: 'completed',
        completed_at: new Date(),
      }, { transaction: t });
      await t.commit();
      res.json({ message: 'Cycle dismantled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "reform" or "dismantle"' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EXPORTS
// ===============================

module.exports = {
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
};