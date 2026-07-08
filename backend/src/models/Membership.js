const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Membership = sequelize.define('Membership', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
  group_id: {
    type: DataTypes.INTEGER,
    references: { model: 'groups', key: 'id' },
  },
  role: {
    type: DataTypes.ENUM('admin', 'member', 'pending', 'invited'),
    defaultValue: 'member',
  },
  has_won: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  active_in_cycle: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'group_memberships',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'group_id'], unique: true },
  ],
});

module.exports = Membership;