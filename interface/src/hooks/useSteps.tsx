import { MoreHorizTwoTone } from "@mui/icons-material";
import { Box, Checkbox, Dialog, DialogContent, Divider, Grid, Select, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Loc, Step, Track, getActivePattern, toggleStep, Pattern, setTrackPan, setStep } from "../redux/songSlice";
import { useEffect, useState } from "react";
import Range from "../components/Range";
import useDialogUI from "../theme/useDialogUI";

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

  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const dispatch = useDispatch();

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

  // A horizontal slider for pan with L/R labels beneath
  const PanSlider = ({ callback, width }:{ callback:(val:number) => void, width?: string }) => {
    const [workingValue, setWorkingValue] = useState(editingStep?.pan || 0);
    
    if (!editingStep) return null;

    return (
      <Box pt={1} position="relative" display="block">
        <Range
          defaultValue={editingStep.pan || 0}
          callback={callback}
          onChange={(e) => {
            setWorkingValue(parseInt(e.target.value) || 0);
          }}
          height="1.75rem"
          width={width || "100%"}
          min={-100}
          max={100}
          step={1}
        />

        <Typography mx="auto" variant="caption" textAlign="center" component="p">{ `${workingValue || ''}${
          workingValue ? (workingValue > 0 ? 'R' : 'L') : 'C'
        }` }</Typography>
      </Box>
    );
  };

  const StepEditDialog = ({ step }:{ step:Step | null }) => {
    const dispatch = useDispatch();

    // Defaults to step.pitch reduced to only numeric characters through regex
    const [octave, setOctave] = useState(step?.pitch ? parseInt(step.pitch.replace(/\D/g, '')) : 3);

    // Defaults to step.pitch reduced to only non-numeric characters through regex
    const [note, setNote] = useState(step?.pitch ? step.pitch.replace(/\d/g, '') : 'C');

    // Pan and velocity are more straightforward, but remember they can be equal to 0
    const [velocity, setVelocity] = useState(step?.velocity !== undefined ? step.velocity : 100);
    const [pan, setPan] = useState(step?.pan || 0);

    const [on, setOn] = useState(step?.on || false);

    const resetDefaults = () => {
      setOctave(3);
      setNote('C');
      setVelocity(100);
      setPan(0);
    }

    const handleClose = () => {
      setEditingStep(null);
    }

    useEffect(() => {
      if (!step) {
        resetDefaults();
      }
    }, [step]);

    const { DialogActionButtons } = useDialogUI();
    const activePattern = useSelector(getActivePattern);

    if (!step) return null;
    if (!activePattern) return null;

    const { track } = step;

    if (!track) return null;

    return (
      <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Grid container py={0}>
            <Grid item xs={4}>
              <Typography fontWeight={600} component="span">Loc: </Typography>
              <Typography fontWeight={400} component="span">{step.loc.bar}.{step.loc.beat}.{step.loc.tick}</Typography>
              <Typography fontWeight={400} component="span"> on </Typography>
              <Typography fontWeight={600} component="span">{step.track.name}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography fontWeight={600} component="span">Step: </Typography>
              <Typography fontWeight={400} component="span">{getOverallStep(step.loc)} of {activePattern.bars * barDiv * beatStep}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography fontWeight={600} component="span">Active: </Typography>
              <Checkbox sx={{ py: 0 }} defaultChecked={step.on} onChange={() => {
                setOn(!on);
              }} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mx: 'auto', my: 2 }} />
            </Grid>

            {/* Pitch Selector (Note and Octave selects) */}
            <Grid item xs={12} md={4}>
              <Typography fontWeight={600} variant="caption" component="p">Pitch:</Typography>
              {/* Note */}
              <Box display={"inline-block"} mr={1}>
                <Select
                  native
                  // value is only the non-numeric portion of step.pitch, filtered out using regex
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                  }}
                  inputProps={{
                    name: 'note',
                    id: 'note',
                  }}
                >
                  { ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A','A#', 'B'].map((pitch) => {
                    return (
                      <option key={pitch} value={pitch}>{pitch}</option>
                    );
                  })}                
                </Select>
              </Box>

              {/* Octave */}
              <Box display={"inline-block"} mr={1}>
                <Select
                  native
                  // value is only the numeric portion of step.pitch, filtered out using regex
                  value={octave}
                  onChange={(e) => {
                    setOctave(parseInt(`${e.target.value}`));
                  }}
                  inputProps={{
                    name: 'octave',
                    id: 'octave',
                  }}
                >
                  { [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((oct) => {
                    return (
                      <option key={oct} value={oct}>{oct}</option>
                    );
                  })}
                </Select>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>

              <Grid container spacing={0}>
                <Grid item xs={12} sm={3}>
                  <Typography fontWeight={600} variant="caption" component="p">Velocity:</Typography>

                  <input type="number" step={1} min={0} max={127} defaultValue={velocity} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
                    setVelocity(parseInt(e.target.value) || velocity);
                  }} />
                </Grid>

                <Grid item xs={12} sm={6} pl={4}>
                  <Typography fontWeight={600} variant="caption" component="p">Pan:</Typography>

                  <PanSlider callback={(val:number) => {
                    setPan(val);
                  }} width="90%" />
                </Grid>
              </Grid>

            </Grid>

            <Grid item xs={12} md={4}>
              { track.filters?.length ? <>
                  <Typography fontWeight={600} variant="caption" component="p">Filters:</Typography>
                  {
                    track.filters?.map((filter, i) => {
                      return (
                        <Typography key={i} fontWeight={400} variant="caption" component="p">
                          {filter.type} {filter.frequency} {filter.q}
                        </Typography>
                      );
                    })
                  }
                </> : 
                <Typography fontWeight={400} variant="caption" component="p">No filters on track</Typography>
              }
            </Grid>
          </Grid>

          <Grid item xs={12}>
              <Divider sx={{ mx: 'auto', my: 2 }} />
            </Grid>

          <DialogActionButtons
            onCancel={handleClose}
            onConfirm={() => {
              if (editingStep) {
                const newStep:Step = {
                  ...editingStep,
                  on: on,
                  velocity,
                  pan,
                  pitch: `${note}${octave}`,
                };
                handleClose();
                dispatch(setStep(newStep));
              }

            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  const StepMarker = ({ step, track }:{ step:Step, track:Track }) => {
    const { on } = step;
    const isDownbeat = step.loc.beat % beatDiv === 1 && step.loc.tick === 1;
    const isBeat = step.loc.tick === 1 && !isDownbeat;
    const bgColor = isDownbeat ? 'secondary.main' : isBeat ? 'info.main' : 'info.light';
    const dispatch = useDispatch();
  
    const activePattern = useSelector(getActivePattern);
    
    return (
      <Box position="relative" overflow={"hidden"} mx="1px" display="inline-block" width={`calc(100% / 8 - 4px)`} height="52px" sx={{ border: '1px solid #ccc' }} bgcolor={bgColor}>
        <Box zIndex={2} sx={{ cursor: 'crosshair' }}
          position="absolute" top="0" left="0" width="100%" textAlign={"center"} pt={0} m={0} className="indicator"
          onClick={() => {
            if (!activePattern) return;
            dispatch(toggleStep({ loc: step.loc, track }));
          }}
        >
          <Box bgcolor={on ? 
            "warning.main" :
            'info.main'
          } sx={{ height: '17px', width: '17px', maxWidth: '60%', mx: 'auto', mt: 1, border: '1px solid rgba(255,255,255,.5)' }}></Box>
        </Box>
        <Box position="absolute" bottom="0" left="0" width="100%" textAlign={"center"} pb={1} pt={0} m={0}>
          <MoreHorizTwoTone
          onClick={() => {
            console.log('step', step);
            setEditingStep(step);
          }}
            sx={{ color:'white', p:0, m:0, maxWidth: '100%', position: 'relative', top: '.75rem', cursor: "context-menu" }} 
          />
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

  return { getLoc, getOverallStep, StepMarker, StepEditDialog, editingStep, getPatternStepMarkers };
}

export default useSteps;