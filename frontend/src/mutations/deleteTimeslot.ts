const deleteTimeslot = async (timeslotId: Number): Promise<string> => {
    const response = await fetch('/api/timeslots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            timeslotId: timeslotId
        })
    });
    return response.text();
};

export default deleteTimeslot;