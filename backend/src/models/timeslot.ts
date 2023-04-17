import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasManyAddAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationsMixin,
  ForeignKey,
} from 'sequelize';
import { TimeslotEntry, TimeslotType } from '@lentovaraukset/shared/src';
import { Airfield, Reservation } from '@lentovaraukset/backend/src/models';
import { sequelize } from '../util/db';

class Timeslot extends Model<
InferAttributes<Timeslot>,
InferCreationAttributes<Timeslot>
> {
  declare id: CreationOptional<number>;

  declare start: Date;

  declare end: Date;

  declare type: TimeslotType;

  declare group: string | null;

  declare info: string | null;

  declare airfieldCode: ForeignKey<Airfield['code']>;

  declare addReservations: HasManyAddAssociationsMixin<Reservation, number>;

  declare getReservations: HasManyGetAssociationsMixin<Reservation>;

  declare removeReservations: HasManyRemoveAssociationsMixin<Reservation, number>;

  static async addGroupTimeslots(
    timeslots: Omit<TimeslotEntry, 'id'>[],
  ) {
    return sequelize.transaction(async (transaction) => Timeslot
      .bulkCreate(timeslots, { transaction }));
  }
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
      unique: false,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      unique: false,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'available',
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
      defaultValue: null,
    },
    info: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
      defaultValue: null,
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
