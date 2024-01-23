import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function valuetext(value: number) {
  return `${value}°C`;
}

const minDistance = 1000;

type StartEndProps = {
  min?:number;
  max?:number;
  callback?: (value:number[]) => void;
  defaultValue?: number[];
  sliderProps?: React.ComponentProps<typeof Slider>;
};

export default function StartEndRange({ min = 0, max = 100, callback, defaultValue, sliderProps = {} }:StartEndProps) {
  const [value, setValue] = React.useState<number[]>(defaultValue || [min, max]);

  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], max - minDistance);
        setValue([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue([clamped - minDistance, clamped]);
      }
    } else {
      setValue(newValue as number[]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        disableSwap
        onChangeCommitted={() => { if (callback) { callback(value); }}}
        {...{ min, max }}
        {...{ sliderProps }}
      />
    </Box>
  );
}