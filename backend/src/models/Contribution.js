const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contribution = sequelize.define('Contribution', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  round: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'contributions',
  timestamps: true,
  underscored: true,
});

module.exports = Contribution;