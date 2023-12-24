import { Box, Typography } from "@mui/material";
import Range from "./Range";
import { useState } from "react";
import { Track, Step } from "../redux/songSlice";

// A horizontal slider for pan with L/R labels beneath
const PanSlider = ({ callback, width, target, defaultValue }:{ callback:(val:number) => void, width?: string, target: Step | Track | null, defaultValue: number }) => {
  const [workingValue, setWorkingValue] = useState(target?.pan || defaultValue);
  
  if (!target) return null;

  return (
    <Box pt={1} position="relative" display="block">
      <Range
        defaultValue={target.pan || defaultValue}
        callback={callback}
        onChange={(e) => {
          setWorkingValue(parseInt(e.target.value) || 0);
        }}
        height="1.75rem"
        width={width || "100%"}
        min={-100}
        max={100}
        step={1}
      />

      <Typography mx="auto" variant="caption" textAlign="center" component="p">{ `${workingValue || ''}${
        workingValue ? (workingValue > 0 ? 'R' : 'L') : 'C'
      }` }</Typography>
    </Box>
  );
};

export default PanSlider;