/* eslint-disable import/no-cycle */
import {
  Column, Model, ForeignKey, Table,
} from 'sequelize-typescript';
import Reservation from './reservation';
import Timeslot from './timeslot';

@Table
export default class ReservedTimeslot extends Model {
  @ForeignKey(() => Reservation)
  @Column
    reservationId!: number;

  @ForeignKey(() => Timeslot)
  @Column
    timeslotId!: number;
}

// export default ReservedTimeslot;
