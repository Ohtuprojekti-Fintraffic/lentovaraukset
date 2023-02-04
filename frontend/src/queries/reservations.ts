let placehoderReservations = [
  {
    id: '1',
    title: 'test',
    start: '2023-01-31T10:00:00',
    end: '2023-01-31T10:45:00',
    editable: true
  },
]

const getReservations = async (): Promise<any[]> => {
  return (placehoderReservations);
};

const addReservation = async (newReservation: any): Promise<void> => {
  placehoderReservations = placehoderReservations.concat({ id: Date.now(), editable: true, ...newReservation })
}

const modifyReservation = async (reservation: any): Promise<void> => {
  placehoderReservations[placehoderReservations.findIndex((element => element.id == reservation.id))] = reservation
}

export { getReservations, addReservation, modifyReservation };

