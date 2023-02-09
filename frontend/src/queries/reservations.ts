const placehoderReservations: any[] = [];

const getReservations = async (): Promise<any[]> => (placehoderReservations);

const addReservation = async (newReservation: any): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/reservations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newReservation),
  });
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

const deleteReservation = async (id: Number): Promise<string> => {
  const response = await fetch(`${process.env.BASE_PATH}/api/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export {
  getReservations, addReservation, modifyReservation, deleteReservation,
};
