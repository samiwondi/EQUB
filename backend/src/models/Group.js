const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  privacy: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
  },
  contribution_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  frequency: {
    type: DataTypes.ENUM('weekly', 'biweekly', 'monthly'),
    defaultValue: 'monthly',
  },
  max_members: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 2 },
  },
  total_rounds: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
    validate: { min: 1 },
  },
  current_round: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'groups',
  timestamps: true,
  underscored: true,
});

module.exports = Group;