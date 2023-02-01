import axios from 'axios';

const sampleQuery = async (): Promise<string> => {
  const response = await axios.get('/api');
  return response.data;
};

export default sampleQuery;
