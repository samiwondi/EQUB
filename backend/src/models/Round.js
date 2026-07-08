const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Round = sequelize.define('Round', {
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
    references: { model: 'users', key: 'id' },
    allowNull: true,
  },
  fixed_winner_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
    allowNull: true,
  },
  is_fixed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'rounds',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['cycle_id', 'round_number'], unique: true },
  ],
});

module.exports = Round;