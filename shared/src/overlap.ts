/**
 * Counts the most concurrent events in a given list of events.
 * @param events - An array of events with start and end times.
 * @returns The highest number of concurrent events.
 */
const countMostConcurrent = (events: { start: Date, end: Date }[]) => {
  let mostConcurrent = 0;
  let currentConcurrent = 0;

  const times: { time: Date; isStart: boolean }[] = events.flatMap(
    (event) => [
      { time: event.start, isStart: true },
      { time: event.end, isStart: false }],
  );
  times.sort((a, b) => {
    // If the times are the same, we want to sort the end times first
    if (a.time.getTime() === b.time.getTime()) {
      return a.isStart ? 1 : -1;
    }

    return a.time.getTime() - b.time.getTime();
  });

  times.forEach((timeObj) => {
    if (timeObj.isStart) {
      currentConcurrent += 1;
      mostConcurrent = Math.max(mostConcurrent, currentConcurrent);
    } else {
      currentConcurrent -= 1;
    }
  });

  return mostConcurrent;
};

export default countMostConcurrent;
