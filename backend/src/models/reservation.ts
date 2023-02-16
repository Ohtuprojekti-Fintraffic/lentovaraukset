import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../util/db';

class Reservation extends Model {}

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
    phoneNumber: {
      type: DataTypes.STRING,
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
