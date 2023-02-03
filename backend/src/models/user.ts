// import { DataTypes } from 'sequelize';
import {
  AutoIncrement, Column, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';
// import { sequelize } from '../util/db';

@Table
class User extends Model {
  @Unique
  @Column
    username!: string;

  @Column
    name!: string;

  @Column
    role!: string;

  @Column
    email!: string;

  @Column
    phone!: string;
}

// User.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     username: {
//       type: DataTypes.STRING,
//       unique: true,
//       allowNull: false,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     role: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     underscored: true,
//     timestamps: true,
//     modelName: 'user',
//   },
// );

export default User;
