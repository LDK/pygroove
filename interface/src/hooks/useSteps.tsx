import { MoreHorizTwoTone } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Loc, Step, Track, getActivePattern, toggleStep, Pattern } from "../redux/songSlice";

export interface UseStepsProps {
  barDiv: number;
  beatDiv: number;
  beatStep: number;
  defaultPitch: string;
  defaultVelocity: number;
}

const useSteps = ({ barDiv, beatDiv, beatStep, defaultPitch, defaultVelocity }:UseStepsProps) => {
  // barDiv: How many beats are in a bar
  // beatDiv: How many ticks are in a beat
  // beatStep: How many ticks we display per beat (equidistant)

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

    return { bar, beat, tick };
  };

  const getOverallStep = (loc:Loc) => {
    return ((loc.bar - 1) * barDiv * beatStep) + ((loc.beat - 1) * beatStep) + (ticks.indexOf(loc.tick) + 1);
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
  };

  const getPatternStepMarkers = (pattern:Pattern, track:Track) => {
    console.log('getPatternStepMarkers', pattern, track);
    let stepIndex:{
      [key:number]:Step;
    } = {};

    for (const key in pattern.steps) {
      const step = pattern.steps[key];
      if (!step || step.track.position !== track.position) continue;
      // We determine overallStep from the step's loc
      // For instance, if barDiv is 4 and beatStep is 2, then we have 8 steps per bar (2 per beat)
  
      // 1.3.1 for example:
      // First bar means 0 bars have passed, so we use (loc.bar -1) for our first component (0 steps in this case)
      // Third beat means 2 beats have passed, so we use (loc.beat - 1) and multiply by beatStep of 2 (4 steps in this case)
      // Tick is tricky because we can't add the raw value.
      // What we do instead is use the value's index in the ticks array [1, 9 when beatStep is 2]
      // The index of 1 is 0, so we add 0 to the overallStep.
      // Therefore, 1.3.1 is the 4th step in the pattern (0 + 4 + 0 = 4)
  
      // Second example, 2.4.9:
      // Second bar means 1 bar has passed, so we use (loc.bar - 1) for our first component (8 steps in this case)
      // Fourth beat means 3 beats have passed, so we use (loc.beat - 1) and multiply by beatStep of 2 (6 steps in this case)
      // The index of 9 is 1, so we add 1 to the overallStep.
      // Therefore, 2.4.9 is the 15th step in the pattern (8 + 6 + 1 = 15)
  
      const overallStep = getOverallStep(step.loc);
  
      // 1.1.1 -> 1
      // 2.3.1 -> 9
      // 2.3.3 -> 9 (tick 3 is still the same beat as tick 1)
      stepIndex[overallStep] = step;
    };

    const patternBars = pattern.bars || 2;

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

    return steps;
  }

  return { getLoc, getOverallStep, StepMarker, getPatternStepMarkers };
}

export default useSteps;