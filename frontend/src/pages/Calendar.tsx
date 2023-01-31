import React from 'react';
import { useQuery } from 'react-query';
import sampleQuery from '../queries/query';
import QueryKeys from '../queries/queryKeys';

function Calendar() {
  const { data, isLoading, isError } = useQuery(QueryKeys.Sample, sampleQuery);

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
