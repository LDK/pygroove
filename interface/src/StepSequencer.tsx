import { Box, Button, Grid, Slider, Typography } from "@mui/material";
import { MoreHorizTwoTone } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Step, Track, findPatternStepByBeat, getActivePattern, getActiveSong, getTrackSteps, toggleStep } from "./redux/songSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store";

const patternLength = 16;
const beatDiv = 4;
const defaultPitch = 'C4';
const defaultVelocity = 100;

function useTrackControls({ track }:{ track?: Track }) {
    // A vertical slider for volume with db labels beneath
  const VolumeSlider = () => {
    const [volume, setVolume] = useState(track?.volume || 0);
    return (
      <Box pt={0} position="relative">
        <Slider
          orientation="vertical"
          value={volume}
          onChange={(e, v) => setVolume(v as number)}
          aria-label="Volume"
          sx={{ height: 47 }}
          max={12}
          min={-36}
        />
        <Box textAlign="center" position="absolute" bottom="-1rem" left="0" width="100%">
          <Typography variant="caption" component="div" color="text.secondary">
            {volume}dB
          </Typography>
        </Box>
      </Box>
    );
  };

  // A horizontal slider for pan with L/R labels beneath
  const PanSlider = () => {
    const [pan, setPan] = useState(track?.pan || 0);
    return (
      <Box pt={1} position="relative">
        <Slider
          value={pan}
          onChange={(e, v) => setPan(v as number)}
          onBlur={() => alert('blur')}
          aria-label="Pan"
          max={100}
          min={-100}
          sx={{ width: 64, mb: 1 }}
        />
        <Box textAlign="center" position="absolute" bottom="-1rem" left="0" width="100%">
          <Typography variant="caption" component="div" color="text.secondary">
            Pan: {pan < 0 ? `${Math.abs(pan)}L` : pan > 0 ? `${pan}R` : 'C'}
          </Typography>
        </Box>
      </Box>
    );
  };

  return {
    VolumeSlider, PanSlider,
  };
}

const StepMarker = ({ step, track }:{ step:Step, track:Track }) => {
  const { on } = step;
  const isBeat = step.loc.beat % beatDiv === 1;
  const bgColor = isBeat ? 'secondary.main' : 'info.light';
  const dispatch = useDispatch();

  const activePattern = useSelector(getActivePattern);
  const song = useSelector(getActiveSong);

  useEffect(() => {
    if (!activePattern) return;
    console.log('activePattern', activePattern.steps);
    console.log('SONG', song);
  }, [activePattern]);

  return (
    <Box position="relative" mx="1px" display="inline-block" width={`calc(100% / ${patternLength} - 4px)`} height="52px" sx={{ border: '1px solid #ccc' }} bgcolor={bgColor}>
      <Box zIndex={2}
        position="absolute" top="0" left="0" width="100%" textAlign={"center"} pt={0} m={0} className="indicator"
        onClick={() => {
          if (!activePattern) return;

          const patternStep = findPatternStepByBeat(activePattern, step.loc.bar, step.loc.beat, track);
          dispatch(toggleStep({ loc: step.loc, track }));
        }}
      >
        <Box bgcolor={on ? 
          "warning.main" :
          'info.main'
        } sx={{ height: '17px', width: '17px', mx: 'auto', mt: 1, border: '1px solid rgba(255,255,255,.5)' }}></Box>
      </Box>
      <Box position="absolute" bottom="-.5rem" left="0" width="100%" textAlign={"center"} py={1} m={0}>
        <MoreHorizTwoTone sx={{ color:'white', p:0, m:0 }} />
      </Box>
    </Box>
  );
}

const SequencerTrack = ({ track }:{ track:Track }) => {
  const [ on, setOn ] = useState(track.on);
  const { VolumeSlider, PanSlider } = useTrackControls({ track });
  const activePattern = useSelector(getActivePattern);

  let patternSteps:Step[] = [];

  if (activePattern) {
    patternSteps = getTrackSteps(activePattern, track);
  }

  // const patternSteps:Step[] = [];

  // Build an index based on track.steps with each step keyed by its overall tick
  const stepIndex:{
    [key:number]:Step;
  } = {};
  
  patternSteps?.forEach((step, i) => {
    if (step.track !== track) return;
    // We will have to determine overallBeat from the step's loc
    const overallBeat = (step.loc.bar - 1) * beatDiv + step.loc.beat;
    // 1.1.1 -> 1
    // 2.3.1 -> 9
    // 2.3.3 -> 9 (tick 3 is still the same beat as tick 1)
    stepIndex[overallBeat] = step;
  });

  const steps = [...Array(patternLength)].map((_, i) => {
    const overallBeat = i + 1;

    if (stepIndex[overallBeat]) {
      // We have a step at this beat
      return <StepMarker {...{track}} key={i} step={stepIndex[overallBeat]} />;
    }

    // Using beatDiv, determine the loc (bar, beat, tick) of the current step
    const bar = Math.ceil(overallBeat / beatDiv);
    const beat = overallBeat % beatDiv === 0 ? beatDiv : overallBeat % beatDiv;
    const tick = 1;

    // Create a new step with the default values
    const newStep:Step = {
      on: false,
      velocity: defaultVelocity,
      pitch: defaultPitch,
      track,
      loc: {
        bar,
        beat,
        tick,
      },
    };

    return <StepMarker {...{ track }} key={i} step={newStep} />;

  })

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
            <Box width="100%" textAlign={"center"} maxHeight={"64px"} maxWidth="64px" mx="auto">
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
          { steps }
        </Box>
      </Grid>
    </Grid>
  );
}
const StepSequencer = () => {
  const { tracks } = useSelector(getActiveSong);
  const activePattern = useSelector((state:RootState) => state.song.activePattern);

  useEffect(() => {
    console.log('my activePattern', activePattern);
  }, [activePattern]);

  return (
    <Box px={2} m={0} sx={{ overflowY: 'scroll', overflowX: 'hidden' }} maxHeight="400px">
      {tracks.map((track, i) => <SequencerTrack key={i} track={track} />)}
    </Box>
  );
};

export default StepSequencer;