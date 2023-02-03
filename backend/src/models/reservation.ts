/* eslint-disable import/no-cycle */
import {
  BelongsTo, Table, Column, Model, ForeignKey, AllowNull, BelongsToMany,
} from 'sequelize-typescript';
import Airfield from './airfield';
import User from './user';
import Timeslot from './timeslot';
import ReservedTimeslot from './reservedTimeslot';

@Table
export default class Reservation extends Model {
  @Column
    startTime!: Date;

  @Column
    endTime!: Date;

  @AllowNull
  @Column
    info?: string;

  @ForeignKey(() => Airfield)
  @Column
    airfieldId!: number;

  @BelongsTo(() => Airfield)
    airfield!: Airfield;

  @ForeignKey(() => User)
  @Column
    userId!: number;

  @BelongsTo(() => User)
    user!: User;

  @BelongsToMany(() => Timeslot, () => ReservedTimeslot)
    timeslots!: Timeslot[];
}
