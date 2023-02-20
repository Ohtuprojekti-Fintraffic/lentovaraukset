import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

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
