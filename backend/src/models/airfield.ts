/* eslint-disable import/no-cycle */
import {
  Table, Column, HasMany, Model,
} from 'sequelize-typescript';
import Reservation from './reservation';
import Timeslot from './timeslot';

@Table
export default class Airfield extends Model {
  @Column({ primaryKey: true })
    id!: number;

  @Column
    name!: string;

  @HasMany(() => Reservation)
    reservations!: Reservation[];

  @HasMany(() => Timeslot)
    timeslots!: Timeslot[];
}
