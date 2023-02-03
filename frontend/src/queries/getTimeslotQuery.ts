import axios from 'axios';

const getTimeslotQuery = async (startTime: Date, endTime: Date): Promise<string> => {
  console.log('gettimeslot');
  const response = await axios.get(`${process.env.BASE_PATH}/api/timeslots/${startTime.getTime()}/${endTime.getTime()}`);
  return response.data;
};

export default getTimeslotQuery;
