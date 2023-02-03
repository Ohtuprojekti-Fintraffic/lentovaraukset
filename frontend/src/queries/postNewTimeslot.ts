import axios from 'axios';

const postNewTimeslot = async (startTime: Date): Promise<string> => {
  const response = await axios.post('/api/timeslots/', { startTime });
  return response.data;
};

export default postNewTimeslot;
