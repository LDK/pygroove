
import { Box } from "@mui/material";
import { 
  ArrowLeftTwoTone as LeftIcon,
  ArrowRightTwoTone as RightIcon,
} from "@mui/icons-material";

type BarScrollerProps = {
  bars: number;
  barStart: number;
  barRange: number;
  setBarStart: (barStart:number) => void;
};

const BarScroller = ({ bars, barStart, barRange, setBarStart }:BarScrollerProps) => (
  <Box position="absolute" right="1rem" bottom="0">
    <LeftIcon 
      sx={{
        opacity: (barStart === 0 ? 0.25 : 1),
        cursor: (barStart === 0 ? 'default' : 'pointer'),
      }}
      onClick={() => { setBarStart(Math.max(0, barStart - 1)) }} />

    <RightIcon
      sx={{
        opacity: (barStart >= bars - barRange ? 0.25 : 1),
        cursor: (barStart >= bars - barRange ? 'default' : 'pointer'),
      }}
      onClick={() => { setBarStart(Math.min(bars - barRange, barStart + 1)) }} />
  </Box>
);

export default BarScroller;
