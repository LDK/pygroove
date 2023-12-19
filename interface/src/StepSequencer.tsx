import { Box, Button, Grid, Typography } from "@mui/material";
import { MoreHorizTwoTone } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Step, Track, getActivePattern, getActiveSong, getTrackSteps } from "./redux/songSlice";
import { useSelector } from "react-redux";
import useTrackControls from "./hooks/useTrackControls";
import useSteps from "./hooks/useSteps";

const stepSettings = {
  barDiv: 4,
  beatDiv: 4,
  beatStep: 4,
  defaultPitch: 'C3',
  defaultVelocity: 100,
};

const arraysEqual = (a:any[], b:any[]) => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

const SequencerTrack = ({ track }:{ track:Track }) => {
  const [ on, setOn ] = useState(!track.disabled);
  const { VolumeSlider, PanSlider } = useTrackControls({ track });
  const activePattern = useSelector(getActivePattern);
  const [patternSteps, setPatternSteps] = useState<Step[]>(activePattern ? getTrackSteps(activePattern, track) : []);

  const { getPatternStepMarkers } = useSteps(stepSettings);

  useEffect(() => {
    console.log('activePattern useEffect', activePattern);
    if (!activePattern) return;
    const newSteps = getTrackSteps(activePattern, track);

    if (!arraysEqual(newSteps, patternSteps)) {
      setPatternSteps(newSteps);
    }
  }, [activePattern, track, patternSteps]);

  if (!activePattern) return null;

  return (
    <Grid container bgcolor="tray.main" sx={{ px: 2, my: 1, py: 1 }}>
      <Grid item xs={3}>
        <Grid container>
          <Grid item xs={3}>
            <Button sx={{ mt: 2, textWrap: 'nowrap', width: '80px', overflowX: 'ellipsis' }} variant="contained" color="primary">
              
              <Typography fontWeight={600} variant="caption" component="div" color="priamry.contrast" width="64px" textAlign="center">
                {/* Show up to 6 characters of track name and then ellipsis as needed */}
                {track.name.length > 7 ? `${track.name.substring(0, 7)}…` : track.name}
              </Typography>
            </Button>
          </Grid>

          <Grid item xs={3}>
            <Box width="100%" textAlign={"center"} maxHeight={"64px"} mx="auto">
              <VolumeSlider />
            </Box>
          </Grid>

          <Grid item xs={3}>
            <Box width="100%" textAlign={"center"} maxHeight={"64px"} maxWidth="64px" mx="auto">
              <PanSlider />
            </Box>
          </Grid>

          <Grid item xs={3}>
            <Box width="100%" textAlign={"center"} mx="auto" mb="0">
              <Box borderRadius="50%" bgcolor={
                on ? 'rgba(225,0,0,.9)' : 'info.dark'
              } height="16px" width="16px" mx="auto"
                onClick={() => setOn(!on)}
              >

              </Box>
              <Typography variant="caption" component="div" color="text.secondary">
                {on ? 'On' : 'Off'}
              </Typography>

              <MoreHorizTwoTone sx={{ color:'black', p:0, m:0 }} />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={9}>
        <Box className="steps" py={1} px={2}>
          { getPatternStepMarkers(activePattern, track) }
        </Box>
      </Grid>
    </Grid>
  );
};

const StepSequencer = () => {
  const { tracks } = useSelector(getActiveSong);

  console.log('render sequencer', tracks);

  return (
    <Box px={2} m={0} sx={{ overflowY: 'scroll', overflowX: 'hidden' }} maxHeight="400px">
      {tracks.map((track, i) => <SequencerTrack key={i} track={track} />)}
    </Box>
  );
};

export default StepSequencer;