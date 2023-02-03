/* eslint-disable import/no-cycle */
import {
  Column, Model, Table, Unique, BelongsTo, ForeignKey, BelongsToMany,
} from 'sequelize-typescript';
import Airfield from './airfield';
import Reservation from './reservation';
import ReservedTimeslot from './reservedTimeslot';

@Table

export default class Timeslot extends Model {
  @Unique
  @Column
    startTime!: Date;

  @Column
    maxAmount!: number;

  @ForeignKey(() => Airfield)
  @Column
    airfieldId!: number;

  @BelongsTo(() => Airfield)
    airfield!: Airfield;

  @BelongsToMany(() => Reservation, () => ReservedTimeslot)
    reservations!: Reservation[];
}
