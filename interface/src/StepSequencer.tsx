import { Box, Button, Grid, Typography } from "@mui/material";
import { MoreHorizTwoTone } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Step, Track, getActivePattern, getActiveSong, getTrackSteps } from "./redux/songSlice";
import { useSelector } from "react-redux";
import useTrackControls from "./hooks/useTrackControls";
import useSteps from "./hooks/useSteps";
import TrackEditDialog from "./components/TrackEditDialog";

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

const StepSequencer = () => {
  const { tracks } = useSelector(getActiveSong);
  const { StepEditDialog, editingStep, getPatternStepMarkers, editingTrack, setEditingTrack } = useSteps(stepSettings);

  const SequencerTrack = ({ track }:{ track:Track }) => {
    const [ on, setOn ] = useState(!track.disabled);
    const { VolumeSlider, PanSlider } = useTrackControls({ track });
    const activePattern = useSelector(getActivePattern);
    const [patternSteps, setPatternSteps] = useState<Step[]>(activePattern ? getTrackSteps(activePattern, track) : []);
  
    useEffect(() => {
      if (!activePattern) return;
      const newSteps = getTrackSteps(activePattern, track);
  
      if (!arraysEqual(newSteps, patternSteps)) {
        console.log('activePattern useEffect', activePattern);
        setPatternSteps(newSteps);
      }
    }, [activePattern, track, patternSteps]);
  
    if (!activePattern) return null;
  
    const StepMarkers = () => {
      const steps = getPatternStepMarkers(activePattern, track);
  
      return (
        <Grid className="steps" py={1} px={2} container>
          <Grid item xs={12} sm={6} xl={3}>
            {
              steps.slice(0, 8)
            }
          </Grid>
          {
            steps.length > 8 &&
            <Grid item xs={12} sm={6} xl={3}>
              {
                steps.slice(8, 16)
              }
            </Grid>
          }
          {
            steps.length > 16 &&
            <Grid item xs={12} sm={6} xl={3}>
              {
                steps.slice(16, 24)
              }
            </Grid>
          }
          {
            steps.length > 24 &&
            <Grid item xs={12} sm={6} xl={3}>
              {
                steps.slice(24, 32)
              }
            </Grid>
          }
        </Grid>
      );
    };
  
    return (
      <Grid container bgcolor="tray.main" sx={{ width: "100%", mx: 0, px: { xs: 2, lg: 1 }, my: 1, py: 1 }}>
        <Grid item xs={3}>
          <Grid container>
            <Grid item xs={3}>
              <Button
                onClick={() => setEditingTrack(track)}
                sx={{ mt: 2, textWrap: 'nowrap', width: '80px', overflowX: 'ellipsis' }}
                variant="contained" color="primary"
              >
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
          <StepMarkers />
        </Grid>
      </Grid>
    );
  };
    
  console.log('render sequencer', tracks);

  return (
    <Box px={{ xs: 2, lg: 1, xl: 0 }} m={0} sx={{ overflowY: 'scroll', overflowX: 'hidden' }} maxHeight="400px">
      {tracks.map((track, i) => <SequencerTrack key={i} track={track} />)}
      <StepEditDialog step={editingStep} />
      <TrackEditDialog track={editingTrack} setEditingTrack={setEditingTrack} />
    </Box>
  );
};

export default StepSequencer;