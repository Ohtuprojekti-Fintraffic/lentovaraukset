// import {
//   DataTypes,
// } from 'sequelize';
import {
  BelongsTo, Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey, AllowNull,
} from 'sequelize-typescript';
// import { sequelize } from '../util/db';
// eslint-disable-next-line import/no-cycle
import Airfield from './airfield';

@Table
class Reservation extends Model {
  @Column
    startTime!: Date;

  @Column
    endTime!: Date;

  @AllowNull
  @Column
    info?: string;

  @ForeignKey(() => Airfield)
    airfieldId!: number;

  @BelongsTo(() => Airfield)
    airfield!: Airfield;
}

// Reservation.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     startTime: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     endTime: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     info: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     underscored: true,
//     timestamps: true,
//     modelName: 'reservation',
//   },
// );
export default Reservation;
