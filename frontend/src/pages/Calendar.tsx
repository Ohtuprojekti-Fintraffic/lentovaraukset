import React from 'react';
import { useQuery, useMutation } from 'react-query';
import getTimeslotQuery from '../queries/getTimeslotQuery';
import postNewTimeslot from '../mutations/postNewTimeslot';
import QueryKeys from '../queries/queryKeys';

function Calendar() {
  const date1 = new Date(1990, 4, 7);
  const date2 = new Date(2025, 4, 8);
  const date3 = new Date(2022, 4, 8);

  const { data, isLoading, isError } = useQuery(
    [QueryKeys.GetTimeslotQuery, date1, date2],
    () => getTimeslotQuery(date1, date2),
  );
  const mutation = useMutation(() => postNewTimeslot(date3));
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Calendar</h1>
      {isError && <p className="text-base">error fetching text</p>}
      {isLoading ? (
        <p className="text-base">fetching text</p>
      ) : (
        <p className="text-base">
          fetched text:
          {JSON.stringify(data)}
        </p>
      )}
      <div>
        {mutation.isLoading ? (
          'Adding new timeslot...'
        ) : (
          <>
            {mutation.isError ? (
              <div>
                An error occurred:
              </div>
            ) : null}

            {mutation.isSuccess ? <div>slot added!</div> : null}

            <button type="submit" onClick={() => mutation.mutate()}>new slot</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Calendar;
