import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasOneSetAssociationMixin,
  HasManyAddAssociationMixin,
  HasOneGetAssociationMixin,
  HasManyRemoveAssociationMixin,
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

  declare phone: string;

  declare addTimeslot: HasManyAddAssociationMixin<Timeslot, number>;

  declare setTimeslot: HasOneSetAssociationMixin<Timeslot, number>;

  declare getTimeslot: HasOneGetAssociationMixin<Timeslot>;

  declare removeTimeslot: HasManyRemoveAssociationMixin<Timeslot, number>;
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
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
