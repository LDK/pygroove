import { PlayArrowTwoTone, StopCircleTwoTone } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { ApiCallProps } from "../hooks/useApi";
import { UserState } from "../redux/userSlice";
import useSong from "../hooks/useSong";

const ActionButtons = () => {
  const { handlePatternPreview, patternPlaying, patternAudioLoading } = useSong();

  const [focus, setFocus] = useState<'render' | null>(null);

  return (
    <Box 
      onMouseEnter={() => { setFocus('render') }} onMouseLeave={() => { setFocus(null) }} 
      width="100%" textAlign="center" mx="auto"
      position="absolute" bottom={0} zIndex={2} left={0} right={0} 
      bgcolor="primary.dark" color="primary.contrastText" p={0}
    >
      <Button
        autoFocus={focus === 'render'}
        disabled={patternAudioLoading} 
        onClick={() => { handlePatternPreview() }} 
        variant="contained" sx={{ my: 1, mx: 'auto' }}
        color={patternPlaying ? 'error' : 'primary'}
      >
        {!patternPlaying  ? <PlayArrowTwoTone sx={{ mr: 1 }} /> : <StopCircleTwoTone sx={{ mr: 1 }} />}
        {!patternPlaying ? 'Play Pattern' : 'Stop Pattern'}
      </Button>
    </Box>
  );
}

export default ActionButtons;