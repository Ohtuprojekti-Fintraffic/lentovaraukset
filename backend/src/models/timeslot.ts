import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../util/db';

class Timeslot extends Model {}

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
