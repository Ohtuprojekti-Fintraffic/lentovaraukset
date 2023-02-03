// import {
//   DataTypes,
// } from 'sequelize';
import {
  Table, Column, HasMany, Model, PrimaryKey, AutoIncrement,
} from 'sequelize-typescript';

// import { sequelize } from '../util/db';
// eslint-disable-next-line import/no-cycle
import Reservation from './reservation';

@Table
class Airfield extends Model {
  @Column({ primaryKey: true })
    id!: number;

  @Column
    name!: string;

  @HasMany(() => Reservation)
    reservations!: Reservation[];
}

// Airfield.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//   },
//   {
//     sequelize,
//     underscored: true,
//     timestamps: false,
//     modelName: 'airfield',
//   },
// );

export default Airfield;
