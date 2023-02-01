export const sampleQuery = async (): Promise<string> => {
  const response = await fetch('/api');
  return response.text();
};

export const getResrvationStatus = async (): Promise<any> => {
  const response = await fetch('/api/staff/reservation-status');
  const data = await response.json();
  return data;
};
