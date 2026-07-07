const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Invite = sequelize.define('Invite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  group_id: {
    type: DataTypes.INTEGER,
    references: { model: 'groups', key: 'id' },
  },
  invited_user_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
  invited_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'expired', 'declined'),
    defaultValue: 'pending',
  },
  expires_at: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
}, {
  tableName: 'invites',
  timestamps: true,
  underscored: true,
});

// Generate unique token before create
Invite.beforeCreate(async (invite) => {
  if (!invite.token) {
    invite.token = crypto.randomBytes(32).toString('hex');
  }
});

module.exports = Invite;