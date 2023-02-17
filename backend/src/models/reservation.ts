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

import { Timeslot } from '@lentovaraukset/backend/src/models';
import { sequelize } from '../util/db';

class Reservation extends Model<
InferAttributes<Reservation>,
InferCreationAttributes<Reservation>
> {
  declare id: CreationOptional<number>;

  declare start: Date;

  declare end: Date;

  declare aircraftId: string;

  declare info: CreationOptional<string>;

  declare addTimeslots: HasManyAddAssociationsMixin<Timeslot, number>;

  declare getTimeslots: HasManyGetAssociationsMixin<Timeslot>;

  declare removeTimeslots: HasManyRemoveAssociationsMixin<Timeslot, number>;
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    aircraftId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'reservation',
  },
);
export default Reservation;
