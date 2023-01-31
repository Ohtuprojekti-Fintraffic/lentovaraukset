import User from './user';
import Airfield from './airfield';
import Reservation from './reservation';
import Timeslot from './timeslot';
import ReservedTimeslot from './reservedTimeslot';

User.hasMany(Reservation);
Reservation.belongsTo(User);

Airfield.hasMany(Reservation);
Reservation.belongsTo(Airfield);

Airfield.hasMany(Timeslot);
Timeslot.belongsTo(Airfield);

Timeslot.belongsToMany(Reservation, { through: ReservedTimeslot });
Reservation.belongsToMany(Timeslot, { through: ReservedTimeslot });

// Temporary solution before test database is defined
if (process.env.NODE_ENV !== 'test') {
  User.sync({ alter: true });
  Airfield.sync({ alter: true });
  Reservation.sync({ alter: true });
  Timeslot.sync({ alter: true });
  ReservedTimeslot.sync({ alter: true });
}

export {
  User,
  Airfield,
  Reservation,
  Timeslot,
  ReservedTimeslot,
};
