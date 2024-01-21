import { Box, Typography } from "@mui/material";
import Range from "./Range";
import { useState } from "react";
import { Track, Step } from "../redux/songSlice";

type PanSliderProps = {
  callback: (val: number) => void;
  width?: string;
  target: Step | Track | null;
  defaultValue: number;
  hideLabel?: boolean;
  inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
};

// A horizontal slider for pan with L/R labels beneath
const PanSlider = ({ callback, width, target, defaultValue, inputProps, hideLabel }:PanSliderProps) => {
  const [workingValue, setWorkingValue] = useState(target?.pan || defaultValue);
  
  if (!target) return null;

  return (
    <Box pt={1} position="relative" display="block">
      <Range
        {...{ inputProps, callback }}
        defaultValue={target.pan || defaultValue}
        onChange={(e) => {
          setWorkingValue(parseInt(e.target.value) || 0);
        }}
        height="1.75rem"
        width={width || "100%"}
        min={-100}
        max={100}
        step={1}
      />

      { !Boolean(hideLabel) &&
        <Typography mx="auto" variant="caption" textAlign="center" component="p">{ `${workingValue || ''}${
        workingValue ? (workingValue > 0 ? 'R' : 'L') : 'C'
      }` }</Typography>}
    </Box>
  );
};

export default PanSlider;