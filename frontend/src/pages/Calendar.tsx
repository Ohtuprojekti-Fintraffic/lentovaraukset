import React from 'react';
import { useQuery, useMutation } from 'react-query';
import sampleQuery from '../queries/query';
import deleteTimeslot from '../mutations/deleteTimeslot';
import QueryKeys from '../queries/queryKeys';

function Calendar() {
  const { data, isLoading, isError } = useQuery(QueryKeys.Sample, sampleQuery);

  const mutation = useMutation((timeslotId: number) => deleteTimeslot(timeslotId));

  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Calendar</h1>
      {isError && <p className="text-base">error fetching text</p>}
      {isLoading
        ? <p className="text-base">fetching text</p>
        : (
          <p className="text-base">
            fetched text:
            {data}
          </p>
        )}
      {mutation.isLoading ? (
        'Adding todo...'
      ) : (
        <>
          {(mutation.error instanceof Error) ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Success!</div> : null}

          <button
            onClick={() => {
              mutation.mutate(1)
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  );
}

export default Calendar;
