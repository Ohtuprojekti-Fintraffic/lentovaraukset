const User = require('./user');
const Airfield = require('./airfield');
const Reservation = require('./reservation');
const Timeslot = require('./timeslot');
const ReservedTimeslot = require('./reservedTimeslot');

User.hasMany(Reservation);
Reservation.belongsTo(User);

Airfield.hasMany(Reservation);
Reservation.belongsTo(Airfield);

Airfield.hasMany(Timeslot);
Timeslot.belongsTo(Airfield);

Timeslot.belongsToMany(Reservation, { through: ReservedTimeslot });
Reservation.belongsToMany(Timeslot, { through: ReservedTimeslot });

User.sync({ alter: true });
Airfield.sync({ alter: true });
Reservation.sync({ alter: true });
Timeslot.sync({ alter: true });
ReservedTimeslot.sync({ alter: true });

module.exports = {
  User,
  Airfield,
  Reservation,
  Timeslot,
  ReservedTimeslot,
};
