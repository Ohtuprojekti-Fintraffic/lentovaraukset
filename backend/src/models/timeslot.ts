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
import { TimeslotType } from '@lentovaraukset/shared/src';
import { Reservation } from '@lentovaraukset/backend/src/models';
import { sequelize } from '../util/db';

class Timeslot extends Model<
InferAttributes<Timeslot>,
InferCreationAttributes<Timeslot>
> {
  declare id: CreationOptional<number>;

  declare start: Date;

  declare end: Date;

  declare type: TimeslotType;

  declare groupId: string | null;

  declare addReservations: HasManyAddAssociationsMixin<Reservation, number>;

  declare getReservations: HasManyGetAssociationsMixin<Reservation>;

  declare removeReservations: HasManyRemoveAssociationsMixin<Reservation, number>;

  static async addGroupTimeslots(
    timeslots: { groupId:string, start: Date, end: Date, type: TimeslotType }[],
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
      validate: {
        customValidator: (value: string) => {
          const enums = ['available', 'blocked'];
          if (!enums.includes(value)) {
            throw new Error('not a valid option');
          }
        },
      },
    },
    groupId: {
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
