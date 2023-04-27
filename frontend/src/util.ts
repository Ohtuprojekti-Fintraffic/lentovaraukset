/* eslint-disable import/prefer-default-export */

/**
 * Converts a time-zoned Date object to an HTML local datetime string.
 *
 * @param date - The time-zoned Date object to convert.
 * @returns The HTML local datetime string representation of the input
 * date, or undefined if the input is undefined.
 */
export const HTMLDateTimeConvert = (date: Date | undefined) => date && new Date(
  date.getTime() - (date.getTimezoneOffset() * 60 * 1000),
)
  .toISOString()
  .slice(0, 16);
