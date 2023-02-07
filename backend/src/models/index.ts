import User from './user';
import Airfield from './airfield';
import Reservation from './reservation';
import Timeslot from './timeslot';
import ReservedTimeslot from './reservedTimeslot';

User.hasMany(Reservation);
Reservation.belongsTo(User);

Airfield.hasMany(Timeslot);
Timeslot.belongsTo(Airfield);

Timeslot.belongsToMany(Reservation, { through: ReservedTimeslot });
Reservation.belongsToMany(Timeslot, { through: ReservedTimeslot });

export {
  User,
  Airfield,
  Reservation,
  Timeslot,
  ReservedTimeslot,
};
