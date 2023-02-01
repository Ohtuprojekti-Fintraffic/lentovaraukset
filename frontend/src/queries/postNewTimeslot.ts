import axios from 'axios';

const postNewTimeslot = async (startTime: Date): Promise<string> => {
  const response = await axios.post('/api/post/newtimeslot/', { startTime });
  return response.data;
};

export default postNewTimeslot;
