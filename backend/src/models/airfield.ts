import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../util/db';

class Airfield extends Model {}

Airfield.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
