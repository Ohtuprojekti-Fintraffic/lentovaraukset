const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../util/db');

class ReservedTimeslot extends Model {}

ReservedTimeslot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'reservations', key: 'id' },
    },
    timeslotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'timeslots', key: 'id' },
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'reservedTimeslot',
  },
);

module.exports = ReservedTimeslot;

export {};
