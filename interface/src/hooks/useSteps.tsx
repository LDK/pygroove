import { MoreHorizTwoTone } from "@mui/icons-material";
import { Box, Checkbox, Dialog, DialogContent, Divider, Grid, Select, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Loc, Step, Track, getActivePattern, toggleStep, Pattern, setStep, Filter, findTrackByPosition } from "../redux/songSlice";
import { useEffect, useMemo, useState } from "react";
import useDialogUI from "../theme/useDialogUI";
import PanSlider from "../components/PanSlider";
import Knob from "../components/Knob";
import { RootState } from "../redux/store";

export interface UseStepsProps {
  barDiv: number;
  beatDiv: number;
  beatStep: number;
  defaultPitch: string;
  defaultVelocity: number;
}

// TODO: Split these off into some sort of utility file
export const getTicks = ( beatStep:number ) => {
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

  return ticks;
}

export const getOverallStep = (loc:Loc, ticks:number[], barDiv:number, beatStep: number) => {
  const bar = parseInt(`${loc.bar}`);
  const beat = parseInt(`${loc.beat}`);
  const tick = parseInt(`${loc.tick}`);

  const tickIndex = ticks.indexOf(tick) + 1;
  const overallStep = ((bar - 1) * barDiv * beatStep) + ((beat - 1) * beatStep) + tickIndex;
  
  return overallStep;
};

export const getLoc = (overallStep:number, ticks:number[], barDiv:number, beatStep:number) => {
  const bar = Math.ceil(overallStep / (barDiv * beatStep));
  const beat = Math.ceil((overallStep % (barDiv * beatStep)) / beatStep) || barDiv;
  const tick = ticks[(overallStep % (barDiv * beatStep)) % beatStep - 1] || ticks[beatStep - 1];

  return { bar, beat, tick };
};

// END TODO

const useSteps = ({ barDiv, beatDiv, beatStep, defaultPitch, defaultVelocity }:UseStepsProps) => {
  // barDiv: How many beats are in a bar
  // beatDiv: How many ticks are in a beat
  // beatStep: How many ticks we display per beat (equidistant)

  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [editingTrack, setEditingTrack] = useState<Track | undefined>(undefined);

  const { DialogActionButtons } = useDialogUI();

  const ticks = useMemo(() =>  getTicks(beatStep), [beatStep]);

  const getLoc = (overallStep:number) => {
    const bar = Math.ceil(overallStep / (barDiv * beatStep));
    const beat = Math.ceil((overallStep % (barDiv * beatStep)) / beatStep) || barDiv;
    const tick = ticks[(overallStep % (barDiv * beatStep)) % beatStep - 1] || ticks[beatStep - 1];

    return { bar, beat, tick };
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
  
    const track = useSelector((state:RootState) => findTrackByPosition(state.song, editingStep?.track?.position || 0));

    let trackFilters:Filter[] = [];

    if (track) {
      trackFilters = track.filters || [];
    } else {
      trackFilters = editingStep?.track?.filters || [];
    }
  
    const [filter1On, setFilter1On] = useState(trackFilters.length ? trackFilters[0].on : false);
    const [filter1Type, setFilter1Type] = useState(trackFilters.length ? trackFilters[0].filter_type : 'lp');
    const [filter1Q, setFilter1Q] = useState(trackFilters.length ? trackFilters[0].q : 0);
    const [filter1Freq, setFilter1Freq] = useState<number>(trackFilters.length ? trackFilters[0].frequency : 0);
  
    const [filter2On, setFilter2On] = useState((trackFilters.length && trackFilters.length > 1) ? trackFilters[1].on : false);
    const [filter2Type, setFilter2Type] = useState((trackFilters.length && trackFilters.length > 1) ? trackFilters[1].filter_type : 'lp');
    const [filter2Q, setFilter2Q] = useState((trackFilters.length && trackFilters.length > 1) ? trackFilters[1].q : 0);
    const [filter2Freq, setFilter2Freq] = useState((trackFilters.length && trackFilters.length > 1) ? trackFilters[1].frequency : 0);
  
    const resetDefaults = () => {
      setOctave(3);
      setNote('C');
      setVelocity(100);
      setPan(0);
    }

    const handleClose = () => {
      setEditingStep(null);
    }

    const handleConfirm = () => {
      if (editingStep) {
        let filters:(Filter[] | undefined) = undefined;

        if (track?.filters?.length) {
          let changed = [false, false];

          for (let idx = 0; idx < track.filters.length; idx++) {
            if (track.filters[idx]) {
              let filter = track.filters[idx];

              for (const key in filter) {
                if (key === 'on') {
                  let compareVal = idx === 0 ? filter1On : filter2On;
                  changed[idx] = filter.on !== compareVal;

                } else if (key === 'filter_type') {
                  let compareVal = idx === 0 ? filter1Type : filter2Type;
                  changed[idx] = filter.filter_type !== compareVal;

                } else if (key === 'q') {
                  let compareVal = idx === 0 ? filter1Q : filter2Q;
                  changed[idx] = filter.q !== compareVal;

                } else if (key === 'frequency') {
                  let compareVal = idx === 0 ? filter1Freq : filter2Freq;
                  changed[idx] = filter.frequency !== compareVal;

                }
              }
            }
          }

          for (let idx = 0; idx < changed.length; idx++) {
            if (changed[idx]) {
              if (!filters) {
                filters = [];
              }

              const filterPosition = idx + 1;
              
              filters.push({
                on: filterPosition === 1 ? filter1On : filter2On,
                filter_type: filterPosition === 1 ? filter1Type : filter2Type,
                q: filterPosition === 1 ? filter1Q : filter2Q,
                frequency: filterPosition === 1 ? filter1Freq : filter2Freq,
                position: filterPosition,
              });              
            }
          }
        } else {
          if (filter1On || filter2On) {
            filters = [];

            if (filter1On) {
              filters.push({
                on: filter1On,
                filter_type: filter1Type,
                q: filter1Q,
                frequency: filter1Freq,
                position: 1,
              });
            }

            if (filter2On) {
              filters.push({
                on: filter2On,
                filter_type: filter2Type,
                q: filter2Q,
                frequency: filter2Freq,
                position: 2,
              });
            }
          }
        }

        const newStep:Step = {
          ...editingStep,
          on: on,
          velocity,
          pan,
          filters,
          pitch: `${note}${octave}`,
        };
        dispatch(setStep(newStep));
        handleClose();
      }
    };

    useEffect(() => {
      if (!step) {
        resetDefaults();
      }
    }, [step]);

    const activePattern = useSelector(getActivePattern);

    if (!step) return null;
    if (!activePattern) return null;
    if (!editingStep) return null;

    // const { track } = step;

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
              <Typography fontWeight={400} component="span">{getOverallStep(step.loc, ticks, barDiv, beatStep)} of {activePattern.bars * barDiv * beatStep}</Typography>
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
            <Grid item xs={12} md={6}>

              <Grid container spacing={0}>
                <Grid item xs={12} sm={3}>
                  <Typography fontWeight={600} variant="caption" component="p">Velocity:</Typography>

                  <input type="number" step={1} min={0} max={127} defaultValue={velocity} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
                    setVelocity(parseInt(e.target.value) || velocity);
                  }} />
                </Grid>

                <Grid item xs={12} sm={6} pl={4}>
                  <Typography fontWeight={600} variant="caption" component="p">Pan:</Typography>

                  <PanSlider target={step} defaultValue={pan}
                    callback={(val:number) => {
                    setPan(val);
                  }} width="90%" />
                </Grid>
              </Grid>

            </Grid>

            <Grid item xs={12} md={6}>
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

            { track.filters?.length ? <>
                <Grid item xs={12} my={2}>
                  <Divider sx={{ mx: 'auto', my: 2 }} />
                  <Typography fontWeight={600} variant="caption" component="p">Filter Overrides:</Typography>
                </Grid>
                {
                  track.filters?.map((filter, i) => {
                    return (
                      <Grid item xs={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle1" fontWeight={600} display="inline-block">
                            Filter {filter.position}
                          </Typography>

                          <Checkbox sx={{ py: 0, display: 'inline-block' }} defaultChecked={filter.position === 1 ? filter1On : filter2On} onChange={() => {
                            if (filter.position === 1) {
                              setFilter1On(!filter1On);
                            } else {
                              setFilter2On(!filter2On);
                            }
                          }} />
                        </Box>

                        <Grid container spacing={0}>
                          <Grid item xs={4}>
                            <Typography variant="caption" component="p" mt={0} mb={2}>
                              Filter Type
                            </Typography>

                            <Select
                              native
                              value={i === 0 ? filter1Type : filter2Type}
                              onChange={(e) => {
                                if (i === 0) {
                                  setFilter1Type(e.target.value);
                                } else {
                                  setFilter2Type(e.target.value);
                                }
                              } }
                              inputProps={{
                                name: 'filterType',
                                id: 'filterType',
                              }}
                            >
                              {['lp', 'hp', 'bp'].map((type) => {
                                return (
                                  <option key={type} value={type}>{type.toUpperCase()}</option>
                                );
                              })}
                            </Select>
                          </Grid>

                          <Grid item xs={4}>
                            <Knob initValue={filter.position === 1 ? filter1Freq : filter2Freq} onBlur={(val:number) => {
                              if (filter.position === 1) {
                                setFilter1Freq(val);
                              } else {
                                setFilter2Freq(val);
                              }
                            }} />
                          </Grid>

                          <Grid item xs={4}>
                            <Knob initValue={filter.position === 1 ? filter1Q : filter2Q} onBlur={(val:number) => {
                              if (filter.position === 1) {
                                setFilter1Q(val);
                              } else {
                                setFilter2Q(val);
                              }
                            }} />
                          </Grid>
                        </Grid>
                      </Grid>
                    );
                  })
                }
              </> : 
              <Typography fontWeight={400} variant="caption" component="p">No filters on track</Typography>
            }
          </Grid>

          <DialogActionButtons
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />
        </DialogContent>
      </Dialog>
    );
  }

  const StepMarker = ({ step, track }:{ step:Step, track:Track }) => {
    const { on } = step;

    const tick = parseInt(`${step.loc.tick}`);
    const beat = parseInt(`${step.loc.beat}`);

    const isDownbeat = beat % beatDiv === 1 && tick === 1;
    const isBeat = tick === 1 && !isDownbeat;
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
            setEditingStep(step);
          }}
            sx={{ color:'white', p:0, m:0, maxWidth: '100%', position: 'relative', top: '.75rem', cursor: "context-menu" }} 
          />
        </Box>
      </Box>
    );
  };

  const getPatternStepMarkers = (pattern:Pattern, track:Track) => {
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
  
      const overallStep = getOverallStep(step.loc, ticks, barDiv, beatStep);
  
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
        duration: 1,
        index: i,
        retrigger: 0
      };
  
      return <StepMarker {...{ track }} key={i} step={newStep} />;
    })

    return steps;
  }

  return { getLoc, getOverallStep, StepMarker, StepEditDialog, editingStep, getPatternStepMarkers, editingTrack, setEditingTrack };
}

export default useSteps;