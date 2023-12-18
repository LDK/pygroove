import { Box, Button, Grid, Slider, Typography } from "@mui/material";
import { MoreHorizTwoTone } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Step, Track, getActivePattern, getActiveSong, getTrackSteps, toggleStep } from "./redux/songSlice";
import { useDispatch, useSelector } from "react-redux";

// patternBars: How many bars are in a pattern
// barDiv: How many beats are in a bar
// beatDiv: How many ticks are in a beat
// beatStep: How many ticks we display per beat (equidistant)

const barDiv:number = 4;
const beatDiv:number = 16;
const beatStep:number = 4;
const defaultPitch = 'C3';
const defaultVelocity = 100;

const ticks:number[] = [];

switch (beatStep) {
  case 2:
    // Equivalent to an eighth note
    ticks.push(1, 9);
    break;
  case 3:
    // Equivalent to a dotted eighth note
    ticks.push(1, 6, 12)
    break;
  case 4:
    // Equivalent to a sixteenth note
    ticks.push(1, 5, 9, 13);
    break;
  case 8:
    // Equivalent to a thirty-second note
    ticks.push(1, 3, 5, 7, 9, 11, 13, 15);
    break;
  case 16:
    // Equivalent to a sixty-fourth note
    ticks.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ,11, 12, 13, 14, 15, 16);
    break;
}

const getLoc = (overallStep:number) => {
  const bar = Math.ceil(overallStep / (barDiv * beatStep));
  const beat = Math.ceil((overallStep % (barDiv * beatStep)) / beatStep) || barDiv;
  const tick = ticks[(overallStep % (barDiv * beatStep)) % beatStep - 1] || ticks[beatStep - 1];

  return {
    bar,
    beat,
    tick,
  };
};

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
  const isDownbeat = step.loc.beat % beatDiv === 1 && step.loc.tick === 1;
  const isBeat = step.loc.tick === 1 && !isDownbeat;
  const bgColor = isDownbeat ? 'secondary.main' : isBeat ? 'info.main' : 'info.light';
  const dispatch = useDispatch();

  const activePattern = useSelector(getActivePattern);
  const patternBars = activePattern?.bars || 2;
  
  return (
    <Box position="relative" mx="1px" display="inline-block" width={`calc(100% / ${patternBars * barDiv * beatStep} - 4px)`} height="52px" sx={{ border: '1px solid #ccc' }} bgcolor={bgColor}>
      <Box zIndex={2}
        position="absolute" top="0" left="0" width="100%" textAlign={"center"} pt={0} m={0} className="indicator"
        onClick={() => {
          if (!activePattern) return;
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
  const [ on, setOn ] = useState(!track.disabled);
  const { VolumeSlider, PanSlider } = useTrackControls({ track });
  const activePattern = useSelector(getActivePattern);
  const [patternSteps, setPatternSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (!activePattern) return;
    const newSteps = getTrackSteps(activePattern, track);
    setPatternSteps(newSteps);
  }, [activePattern, track]);

  // const patternSteps:Step[] = [];

  // Build an index based on track.steps with each step keyed by its overall tick
  const stepIndex:{
    [key:number]:Step;
  } = {};
  
  console.log('patternSteps', patternSteps);

  patternSteps?.forEach((step, i) => {
    if (step.track.name !== track.name) return;
    // We will have to determine overallStep from the step's loc
    // For instance, if barDiv is 4 and beatStep is 2, then we have 8 steps per bar (2 per beat)

    // 1.3.1 for example:
    // First bar means 0 bars have passed, so we use (loc.bar -1) for our first component (0 steps in this case)
    // Third beat means 2 beats have passed, so we use (loc.beat - 1) and multiply by beatStep of 2 (4 steps in this case)
    // Tick is tricky because we can't add the raw value.
    // What we do instead is use the value's index in the ticks array [1, 5 when beatStep is 2]
    // The index of 1 is 0, so we add 0 to the overallStep.
    // Therefore, 1.3.1 is the 4th step in the pattern (0 + 4 + 0 = 4)

    // Second example, 2.4.5:
    // Second bar means 1 bar has passed, so we use (loc.bar - 1) for our first component (8 steps in this case)
    // Fourth beat means 3 beats have passed, so we use (loc.beat - 1) and multiply by beatStep of 2 (6 steps in this case)
    // The index of 5 is 1, so we add 1 to the overallStep.
    // Therefore, 2.4.5 is the 15th step in the pattern (8 + 6 + 1 = 15)

    const overallStep = ((step.loc.bar - 1) * barDiv * beatStep) + ((step.loc.beat - 1) * beatStep) + (ticks.indexOf(step.loc.tick) + 1);

    // 1.1.1 -> 1
    // 2.3.1 -> 9
    // 2.3.3 -> 9 (tick 3 is still the same beat as tick 1)
    stepIndex[overallStep] = step;
  });

  const patternBars = activePattern?.bars || 2;

  const steps = [...Array(patternBars * barDiv * beatStep)].map((_, i) => {
    const overallStep = i + 1;

    if (stepIndex[overallStep]) {
      // We have a step at this beat
      return <StepMarker {...{track}} key={i} step={stepIndex[overallStep]} />;
    }

    const { bar, beat, tick } = getLoc(overallStep);
    
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

  return (
    <Box px={2} m={0} sx={{ overflowY: 'scroll', overflowX: 'hidden' }} maxHeight="400px">
      {tracks.map((track, i) => <SequencerTrack key={i} track={track} />)}
    </Box>
  );
};

export default StepSequencer;