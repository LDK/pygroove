import { Box, Typography } from "@mui/material";

const PianoKey = ({ pitch, idx, textColor, bgColor, height }:{ pitch:string, idx: number, textColor: string, bgColor: string, height: number }) => {
  return (
    <Box
      width="calc(100% - 1px)"
      height={`${height - 1}px`}
      bgcolor={bgColor}
      borderTop={1}
      borderColor={'#333333'}
      borderRadius={0}
      // position="absolute"
      left={0}
      zIndex={1}
      top={height * (idx)}
    >
      <Typography textAlign="right" pr={1} color={textColor}>
        {pitch}
      </Typography>
    </Box>
  );
};

export const WhiteKey = ({ pitch, idx, height }:{ pitch:string, idx: number, height: number }) => (
  <PianoKey height={height} pitch={pitch} idx={idx} textColor={'black'} bgColor={'white'} />
);

export const BlackKey = ({ pitch, idx, height }:{ pitch:string, idx: number, height: number }) => (
  <PianoKey height={height} pitch={pitch} idx={idx} textColor={'white'} bgColor={'black'} />
);

export default PianoKey;