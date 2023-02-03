let placehoderReservations = [
  {
    title: 'test',
    start: '2023-01-31T10:00:00',
    end: '2023-01-31T10:45:00',
  },
]

const getReservations = async (): Promise<any[]> => {
  return(placehoderReservations);
};

const addReservation = async (newReservation: any): Promise<boolean> => {
  placehoderReservations = placehoderReservations.concat(newReservation)
  return true
}

export { getReservations, addReservation };

