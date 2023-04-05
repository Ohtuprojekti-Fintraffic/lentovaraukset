import User from './user';
import Airfield from './airfield';
import Reservation from './reservation';
import Timeslot from './timeslot';

User.hasMany(Reservation);
Reservation.belongsTo(User);

Airfield.hasMany(Timeslot, {
  foreignKey: {
    name: 'airfieldCode',
    allowNull: false,
  },
});
Timeslot.belongsTo(Airfield);

Timeslot.hasMany(Reservation);
Reservation.belongsTo(Timeslot);

export {
  User,
  Airfield,
  Reservation,
  Timeslot,
};
