const User = require('./user');
const Airfield = require('./airfield');
const Reservation = require('./reservation');
const Timeslot = require('./timeslot');

User.hasMany(Reservation);
Reservation.belongsTo(User);

Airfield.hasMany(Reservation);
Reservation.belongsTo(Airfield);

Airfield.hasMany(Timeslot);
Timeslot.belongsTo(Airfield);

Timeslot.hasMany(Reservation);
Reservation.belongsTo(Timeslot);

User.sync({ alter: true });
Airfield.sync({ alter: true });
Reservation.sync({ alter: true });
Timeslot.sync({ alter: true });

module.exports = {
  User, Airfield, Reservation, Timeslot,
};
