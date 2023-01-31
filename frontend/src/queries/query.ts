const sampleQuery = async (): Promise<string> => {
  const response = await fetch(`${process.env.BASE_PATH}/api`);
  return response.text();
};

export default sampleQuery;
