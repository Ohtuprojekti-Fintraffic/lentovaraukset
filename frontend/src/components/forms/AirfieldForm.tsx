import React from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';

function AirfieldForm(
  data: any) {
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

  const {airfield} = data;
  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">{`Airfield #${airfield.name}`}</p>
      </div>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4">
          <label className={labelStyle}>
            Max concurrent flights:
            <input
              type="datetime-local"
              defaultValue={airfield.maxConcurrentFlights}
              className={textFieldStyle}
            />
          </label>
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
