import { Box } from "@mui/material";

import { 
  ArrowUpwardTwoTone as UpIcon,
  KeyboardDoubleArrowUpTwoTone as UpDoubleIcon,
  ArrowDownwardTwoTone as DownIcon,
  KeyboardDoubleArrowDownTwoTone as DownDoubleIcon,
} from "@mui/icons-material";

type PitchScrollerProps = {
  pitchStart: number;
  setPitchStart: (pitchStart:number) => void;
  pitchRange: number;
  keyHeight: number;
  notes: string[];
};

const PitchScroller = ({ pitchStart, setPitchStart, pitchRange, keyHeight, notes }:PitchScrollerProps) => (
  <Box width="2.5%" display="inline-block" position="absolute" top={0} left={0} height={`calc(${pitchRange + 1} * ${keyHeight}px)`}>
    <UpDoubleIcon
      onClick={() => {
        setPitchStart(Math.max(0, pitchStart - Math.min(12, pitchRange - 1)));
      }}
      sx={{ 
        width: '.75em',
        fontSize: '2rem',
        cursor: (pitchStart === 0 ? 'default' : 'pointer'),
        position: 'absolute',
        top: '0rem',
        left: 0,
        opacity: (pitchStart === 0 ? 0.25 : 1),
      }}
    />

    <UpIcon 
      onClick={() => {
        setPitchStart(Math.max(0, pitchStart - 1));
      }}
      sx={{ 
        width: '.75em',
        fontSize: '2rem',
        cursor: (pitchStart === 0 ? 'default' : 'pointer'),
        position: 'absolute',
        top: '2rem', 
        left: 0,
        opacity: (pitchStart === 0 ? 0.25 : 1),
      }}
    />
    
    <DownIcon 
      onClick={() => {
        setPitchStart(Math.min(notes.length - pitchRange, pitchStart + 1));
      }}
      sx={{ 
        width: '.75em',
        fontSize: '2rem',
        cursor: (pitchStart >= notes.length - pitchRange ? 'default' : 'pointer'),
        position: 'absolute',
        opacity: (pitchStart >= notes.length - pitchRange ? 0 : 1),
        bottom: '2rem', 
        left: 0,
      }}
    />
    
    <DownDoubleIcon
      onClick={() => {
        setPitchStart(Math.min(notes.length - pitchRange, pitchStart + Math.min(12, pitchRange - 1)));
      }}
      sx={{ 
        width: '.75em',
        fontSize: '2rem',
        cursor: (pitchStart >= notes.length - pitchRange ? 'default' : 'pointer'),
        position: 'absolute',
        opacity: (pitchStart >= notes.length - pitchRange ? 0 : 1),
        bottom: 0,
        left: 0 
      }}
    />

  </Box>
);

export default PitchScroller;