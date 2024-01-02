import { useTheme } from "@mui/material"
import { Box } from "@mui/material";
import { useState } from "react";
import { useCircularInputContext, CircularInput, CircularProgress, CircularTrack, CircularThumb } from "react-circular-input";

const Knob = ({ onBlur, initValue }:{ initValue: number; onBlur: (val:number) => void }) => {
  const CustomComponent = ({ value }:{ value:number }) => {
    const { getPointFromValue } = useCircularInputContext();
    const point = getPointFromValue();
    if (!point) return null;
    return (
      <text
        {...point}
        width="2rem"
        textAnchor="middle"
        dy="0.25em"
        fill="rgb(61, 153, 255)"
        // use transform to flip the text upside-down
        style={{ pointerEvents: "none", fontWeight: "600", fontSize: '.7rem', letterSpacing: '.1px' }}
      >
        {Math.round(value * 100)}
      </text>
    );
  }

  const [value, setValue] = useState(initValue || 0.5);

  const theme = useTheme();

  const handleBlur = () => {
    onBlur(value);
  };

  return (
    <Box textAlign={"left"} ml={2}>
      <CircularInput value={value} radius={15} onChange={setValue} onChangeEnd={handleBlur}>
        <CircularProgress
          strokeWidth={10}
          stroke={theme.palette.success.light}
          opacity={value}
        />
        <CircularTrack strokeWidth={10} stroke={theme.palette.success.main} opacity={.25} />

        <CircularThumb
          fill="white"
          stroke={theme.palette.success.main}
          strokeWidth="2"
          r={11}
        />
        <CustomComponent value={value} />
      </CircularInput>
    </Box>
  );
};

export default Knob;