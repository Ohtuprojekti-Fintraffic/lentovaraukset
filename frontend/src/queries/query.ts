export const sampleQuery = async (): Promise<string> => {
  const response = await fetch(`${process.env.BASE_PATH}/api`);
  return response.text();
};

export const getReservationStatus = async (): Promise<any> => {
  const response = await fetch(`${process.env.BASE_PATH}/api/flight-control/reservation-status`);
  const data = await response.json();
  return data;
};
