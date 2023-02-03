// import { DataTypes } from 'sequelize';
import {
  AutoIncrement, Column, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';
// import { sequelize } from '../util/db';

@Table
class Timeslot extends Model {
  @Unique
  @Column
    startTime!: Date;

  @Column
    maxAmount!: number;
}

// Timeslot.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     startTime: {
//       type: DataTypes.DATE,
//       unique: true,
//       allowNull: false,
//     },
//     maxAmount: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     underscored: true,
//     timestamps: false,
//     modelName: 'timeslot',
//   },
// );

export default Timeslot;
