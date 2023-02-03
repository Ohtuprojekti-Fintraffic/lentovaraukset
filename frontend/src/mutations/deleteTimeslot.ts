const deleteTimeslot = async (id: Number): Promise<string> => {
  const response = await fetch(`${process.env.BASE_PATH}/api/timeslots/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.text();
};

export default deleteTimeslot;
