const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RoundWinner = sequelize.define('RoundWinner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cycle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'cycles', key: 'id' },
  },
  round_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid'),
    defaultValue: 'pending',
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'round_winners',
  timestamps: true,
  underscored: true,
});

module.exports = RoundWinner;