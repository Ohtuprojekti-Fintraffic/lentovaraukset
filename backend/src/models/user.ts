/* eslint-disable import/no-cycle */
import {
  Column, Model, Table, Unique, HasMany,
} from 'sequelize-typescript';
import Reservation from './reservation';

@Table
export default class User extends Model {
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

  @HasMany(() => Reservation)
    reservations!: Reservation[];
}
