let placehoderTimeSlots = [
    {
        id: '1',
        start: '2023-01-31T8:00:00',
        end: '2023-01-31T16:00:00',
        editable: true
    },
    {
        id: '2',
        start: '2023-02-1T8:00:00',
        end: '2023-02-1T16:00:00',
        editable: true
    },
    {
        id: '3',
        start: '2023-02-2T8:00:00',
        end: '2023-02-2T14:00:00',
        editable: true
    },
]

const getTimeSlots = async (): Promise<any[]> => {
    return (placehoderTimeSlots);
};

const addTimeSlot = async (newTimeSlot: any): Promise<void> => {
    placehoderTimeSlots = placehoderTimeSlots.concat({ id: Date.now(), editable: true, ...newTimeSlot })
}

const modifyTimeSlot = async (timeSlot: any): Promise<void> => {
    placehoderTimeSlots[placehoderTimeSlots.findIndex((element => element.id == timeSlot.id))] = timeSlot
}

export { getTimeSlots, addTimeSlot, modifyTimeSlot };

