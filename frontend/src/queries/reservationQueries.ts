let placehoderReservations = [
  {
    id: 1,
    title: 'test',
    start: '2023-01-31T10:00:00',
    end: '2023-01-31T10:45:00',
  },
]

//const sampleQuery = async (): Promise<string> => {
//  const response = await fetch(`${process.env.BASE_PATH}/api`);
//  return response.text();
//};

const getReservations = async (): Promise<any[]> => {
  return (placehoderReservations);
};

const addReservation = async (newReservation: any): Promise<void> => {
  placehoderReservations = placehoderReservations.concat({ id: Date.now(), ...newReservation })
}

const modifyReservation = async (reservation: any): Promise<void> => {
  placehoderReservations[placehoderReservations.findIndex((element => element.id === parseInt(reservation.id)))] = reservation
}

export { getReservations, addReservation, modifyReservation };

