/* eslint-disable import/prefer-default-export */

// converts from time zoned Date to a HTML local datetime string
export const HTMLDateTimeConvert = (date: Date | undefined) => date && new Date(
  date.getTime() - (date.getTimezoneOffset() * 60 * 1000),
)
  .toISOString()
  .slice(0, 16);
