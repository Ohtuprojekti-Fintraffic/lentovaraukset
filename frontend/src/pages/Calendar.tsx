import React from 'react';
import { useQuery } from 'react-query';
import getTimeslotQuery from '../queries/getTimeslotQuery';
import QueryKeys from '../queries/queryKeys';

function Calendar() {
  const date1 = new Date(1990, 4, 7);
  const date2 = new Date(1990, 4, 7);

  const { data, isLoading, isError } = useQuery(
    [
      QueryKeys.GetTimeslotQuery,
      date1,
      date2,
    ],
    getTimeslotQuery,
  );

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
    </div>
  );
}

export default Calendar;
