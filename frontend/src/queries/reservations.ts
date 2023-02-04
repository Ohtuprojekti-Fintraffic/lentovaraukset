let placehoderReservations: any[] = [
  {
    id: '1',
    title: 'test',
    start: '2023-01-31T10:00:00',
    end: '2023-01-31T10:45:00',
    editable: true,
  },
];

const getReservations = async (): Promise<any[]> => (placehoderReservations);

const addReservation = async (newReservation: any): Promise<void> => {
  placehoderReservations = placehoderReservations.concat(
    { id: Date.now(), editable: true, ...newReservation },
  );
};

const modifyReservation = async (reservation: any): Promise<void> => {
  placehoderReservations[
    placehoderReservations.findIndex(
      ((element) => parseInt(element.id, 10) === parseInt(reservation.id, 10)),
    )
  ] = {
    id: reservation.id,
    title: reservation.title,
    start: reservation.start,
    end: reservation.end,
    editable: true,
  };
};

export { getReservations, addReservation, modifyReservation };
