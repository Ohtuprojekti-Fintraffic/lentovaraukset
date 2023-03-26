import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { sequelize } from '../util/db';

class Airfield extends Model<
InferAttributes<Airfield>,
InferCreationAttributes<Airfield>
> {
  declare id: string;

  declare name: string;

  declare maxConcurrentFlights: number;

  declare eventGranularityMinutes: number;
}

Airfield.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    maxConcurrentFlights: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventGranularityMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'airfield',
  },
);

export default Airfield;
