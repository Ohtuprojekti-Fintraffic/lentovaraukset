import { Sequelize } from 'sequelize-typescript';
import { newDb } from 'pg-mem';
import { DATABASE_URL } from './config';
import {
  Airfield, Reservation, ReservedTimeslot, Timeslot, User,
} from '../models';

if (process.env.NODE_ENV === 'test') {
  console.log('creating an in-memory test database');
}

const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize({
    dialect: 'postgres', dialectModule: newDb().adapters.createPg(), logging: false, models: [Airfield, Reservation, ReservedTimeslot, Timeslot, User],
  })
  : new Sequelize(DATABASE_URL as string, { dialect: 'postgres', logging: false, models: [Airfield, Reservation, ReservedTimeslot, Timeslot, User] });

// Relations have to be very late here because models
// have to be connected to a sequalize instance first.
User.hasMany(Reservation);
Reservation.belongsTo(User);

Airfield.hasMany(Reservation);
Reservation.belongsTo(Airfield);

Airfield.hasMany(Timeslot);
Timeslot.belongsTo(Airfield);

Timeslot.belongsToMany(Reservation, { through: ReservedTimeslot });
Reservation.belongsToMany(Timeslot, { through: ReservedTimeslot });

const connectToDatabase = async () => {
  try {
    await sequelize.sync();
    await sequelize.authenticate();
    console.log('database connected');
  } catch (err) {
    console.log('connecting database failed. Error:', err);
    return process.exit(1);
  }

  return null;
};

export { connectToDatabase, sequelize };
