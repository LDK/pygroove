import { Box, Typography } from "@mui/material";

type BeatMarkersProps = {
  barDiv: number;
  barRange: number;
  keyHeight: number;
  beatWidth: string;
  bars: number;
  barStart: number;
};

type BeatGroupProps = {
  disabled: boolean;
  bar: number;
};

const BeatMarkers = ({ barDiv, barRange, keyHeight, beatWidth, bars, barStart }:BeatMarkersProps) => {
  const BeatMarker = ({ beat, bar }:{ beat:number, bar:number  }) => {
    return (
      <Box display="inline-block" className="beatDiv" borderLeft={1} borderColor={'#333333'} height="100%" width={beatWidth} position="relative">
        <Typography variant="caption" position="absolute" top={keyHeight / 5} left=".5rem" fontWeight={600}>
          {bar}.{beat}
        </Typography>
      </Box>
    );
  }

  const BeatGroup = ({ disabled, bar }:BeatGroupProps) => {
    const beats = [];

    for (let i = 0; i < barDiv; i++) {
      beats.push(<BeatMarker bar={bar} beat={i+1} key={i} />);
    }

    return (
      <Box display="inline-block" className={`barDiv ${barRange}`} height={keyHeight} width={`calc(100% / ${barRange})`} bgcolor={disabled ? '#909090' : "secondary.light"} m={0} p={0}>
        {beats}
      </Box>
    );
  }

  const barDivs = [];

  let i:number;

  for (i = barStart; i < Math.min(bars, barStart + barRange); i++) {
    barDivs.push(
      <BeatGroup bar={(i + 1)} disabled={false} />
    );
  }

  for (i; i < (barStart + barRange); i++) {
    barDivs.push(
      <BeatGroup bar={(i + 1)} disabled={true} />
    );
  }

  return (
    <Box height={keyHeight} width={`calc(100%)`} bgcolor="#303030" position="absolute" top={0} left={0}>
      {barDivs}
    </Box>
  );
};

export default BeatMarkers;