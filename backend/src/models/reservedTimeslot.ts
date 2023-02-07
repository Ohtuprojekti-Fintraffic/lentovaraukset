import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../util/db';

class ReservedTimeslot extends Model {}

ReservedTimeslot.init(
  {
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

export default ReservedTimeslot;
