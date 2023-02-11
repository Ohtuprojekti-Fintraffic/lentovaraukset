import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import { sequelize } from '../util/db';

class ReservedTimeslot extends Model<
InferAttributes<ReservedTimeslot>,
InferCreationAttributes<ReservedTimeslot>
> {
  declare reservationId: number;

  declare timeslotId: number;
}

ReservedTimeslot.init(
  {
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'reservations', key: 'id' },
      primaryKey: true,
    },
    timeslotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'timeslots', key: 'id' },
      primaryKey: true,
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
