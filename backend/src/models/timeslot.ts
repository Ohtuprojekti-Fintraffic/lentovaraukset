import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasManyAddAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationsMixin,
} from 'sequelize';

import { Reservation } from '@lentovaraukset/backend/src/models';
import { sequelize } from '../util/db';

class Timeslot extends Model<
InferAttributes<Timeslot>,
InferCreationAttributes<Timeslot>
> {
  declare id: CreationOptional<number>;

  declare start: Date;

  declare end: Date;

  declare addReservations: HasManyAddAssociationsMixin<Reservation, number>;

  declare getReservations: HasManyGetAssociationsMixin<Reservation>;

  declare removeReservations: HasManyRemoveAssociationsMixin<Reservation, number>;
}

Timeslot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start: {
      type: DataTypes.DATE,
      unique: true,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'timeslot',
  },
);

export default Timeslot;
