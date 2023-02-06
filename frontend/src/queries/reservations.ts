let placehoderReservations: any[] = [];

const getReservations = async (): Promise<any[]> => (placehoderReservations);

const addReservation = async (newReservation: any): Promise<void> => {
  placehoderReservations = placehoderReservations.concat(
    { id: Date.now(), editable: true, ...newReservation },
  );
};

const modifyReservation = async (reservation: any): Promise<void> => {
  placehoderReservations[
    placehoderReservations.findIndex(
      (element) => parseInt(element.id, 10) === parseInt(reservation.id, 10),
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
