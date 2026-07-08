const { sequelize } = require('../config/database');
const User = require('./User');
const Group = require('./Group');
const Membership = require('./Membership');
const Contribution = require('./Contribution');
const Round = require('./Round');
const Invite = require('./Invite');
const Cycle = require('./Cycle');
const RoundWinner = require('./RoundWinner');

User.hasMany(Group, { foreignKey: 'created_by', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.belongsToMany(Group, {
  through: Membership,
  foreignKey: 'user_id',
  otherKey: 'group_id',
});
Group.belongsToMany(User, {
  through: Membership,
  foreignKey: 'group_id',
  otherKey: 'user_id',
});

User.hasMany(Membership, { foreignKey: 'user_id' });
Group.hasMany(Membership, { foreignKey: 'group_id' });
Membership.belongsTo(User, { foreignKey: 'user_id' });
Membership.belongsTo(Group, { foreignKey: 'group_id' });

User.hasMany(Contribution, { foreignKey: 'user_id' });
Group.hasMany(Contribution, { foreignKey: 'group_id' });
Contribution.belongsTo(User, { foreignKey: 'user_id' });
Contribution.belongsTo(Group, { foreignKey: 'group_id' });

Group.hasMany(Cycle, { foreignKey: 'group_id' });
Cycle.belongsTo(Group, { foreignKey: 'group_id' });

Cycle.hasMany(Round, { foreignKey: 'cycle_id' });
Round.belongsTo(Cycle, { foreignKey: 'cycle_id' });
Round.belongsTo(User, { foreignKey: 'winner_id', as: 'winner' });
Round.belongsTo(User, { foreignKey: 'fixed_winner_id', as: 'fixedWinner' });

Cycle.hasMany(RoundWinner, { foreignKey: 'cycle_id' });
RoundWinner.belongsTo(Cycle, { foreignKey: 'cycle_id' });
RoundWinner.belongsTo(User, { foreignKey: 'winner_id', as: 'winner' });

Group.hasMany(Invite, { foreignKey: 'group_id' });
User.hasMany(Invite, { foreignKey: 'invited_user_id', as: 'invites' });
User.hasMany(Invite, { foreignKey: 'invited_by', as: 'sentInvites' });
Invite.belongsTo(Group, { foreignKey: 'group_id' });
Invite.belongsTo(User, { foreignKey: 'invited_user_id', as: 'invitedUser' });
Invite.belongsTo(User, { foreignKey: 'invited_by', as: 'invitedBy' });

module.exports = {
  sequelize,
  User,
  Group,
  Membership,
  Contribution,
  Round,
  Invite,
  Cycle,
  RoundWinner,
};