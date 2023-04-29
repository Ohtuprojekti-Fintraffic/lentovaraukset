/* eslint-disable import/prefer-default-export */

import { useMediaQuery } from 'react-responsive';

// converts from time zoned Date to a HTML local datetime string
export const HTMLDateTimeConvert = (date: Date | undefined) => date && new Date(
  date.getTime() - (date.getTimezoneOffset() * 60 * 1000),
)
  .toISOString()
  .slice(0, 16);

const breakpoints = {
  xxs: '400px',
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

type BreakpointKey = keyof typeof breakpoints;

/**
 * Returns responsive boolean value to use tailwindcss breakpoints programmatically
 * @param breakpointKey the breakpoint key to be used
 * @returns responsive boolean value of whether the screen size is over the breakpoint
 */
export function usetwBreakpoint<K extends BreakpointKey>(breakpointKey: K) {
  const bool = useMediaQuery({
    query: `(min-width: ${breakpoints[breakpointKey]})`,
  });
  return {
    [breakpointKey]: bool,
  } as Record<K, boolean>;
}
