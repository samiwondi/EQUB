const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Round = sequelize.define('Round', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  group_id: {
    type: DataTypes.INTEGER,
    references: { model: 'groups', key: 'id' },
  },
  round_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  winner_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  payout_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'rounds',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['group_id', 'round_number'], unique: true },
  ],
});

module.exports = Round;