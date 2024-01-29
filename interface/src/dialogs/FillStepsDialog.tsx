import { Box, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import useDialogUI from "../theme/useDialogUI";
import { useDispatch, useSelector } from "react-redux";
import { StepSettings } from "../StepSequencer";
import useSteps, { getLoc, getTicks } from "../hooks/useSteps";
import { useEffect, useMemo, useState } from "react";
import { Loc, Step, Track, getActivePattern, setPatternTrackSteps } from "../redux/songSlice";

const FillStepsDialog = ({ open, handleClose, stepSettings, track }: { open: boolean, handleClose: () => void, stepSettings:StepSettings, track:Track }) => {

  const { DialogActionButtons } = useDialogUI();
  const { bars } = useSelector(getActivePattern) || { bars: 2 };
  const dispatch = useDispatch();

  const { FillMarker, StepEditDialog, editingFillStep } = useSteps(stepSettings);

  const { beatStep, barDiv, defaultPitch, defaultVelocity } = stepSettings;

  const [fillMode, setFillMode] = useState<'every' | 'pattern'>('every');
  const [fillNote, setFillNote] = useState(defaultPitch.slice(0, -1));
  const [fillOctave, setFillOctave] = useState(defaultPitch.slice(-1));
  const [fillVelocity, setFillVelocity] = useState(defaultVelocity);

  const [patternLength, setPatternLength] = useState(4);
  const [patternOffset, setPatternOffset] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  const ticks = getTicks(beatStep);

  const locIndex = new Map<number, Loc>();

  for (let i = 0; i < patternLength; i++) {
    const loc = getLoc(i + 1, ticks, barDiv, beatStep);
    locIndex.set(i, loc);
  }

  // Create an index of overall steps with their corresponding `loc` determined by stepSettings
  const stepIndex = useMemo(() => {
  
    const stepIndex = new Map<number, Step>();

    for (let i = 0; i < patternLength; i++) {
      const loc = getLoc(i + 1, ticks, barDiv, beatStep);
      let newStep:Step;

      console.log('loc', loc, i);

      if (steps.find(step => step?.loc.bar === loc.bar && step?.loc.beat === loc.beat && step?.loc.tick === loc.tick)) {
        newStep = steps.find(step => step?.loc.bar === loc.bar && step?.loc.beat === loc.beat && step?.loc.tick === loc.tick) as Step;
        stepIndex.set(i, newStep);
      } else {
        newStep = {
          loc,
          pitch: defaultPitch,
          velocity: defaultVelocity,
          track,
          on: false,
          duration: 1,
          index: i,
        };
      }

      stepIndex.set(i, newStep);
    }

    return stepIndex;
  }, [steps, ticks, barDiv, defaultPitch, defaultVelocity, track, beatStep, patternLength]);

  useEffect(() => {
    if (!steps.length) {
      setSteps(Array.from(stepIndex.values()));
    }
  }, [stepIndex, steps.length]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Fill Steps</DialogTitle>

      <DialogContent sx={{ mb: 4 }}>

        <Box>
          <FormControl component="fieldset">
            <RadioGroup defaultValue="every" onChange={(e) => {
              setFillMode(e.target.value as 'every' | 'pattern');
            }}>
              <FormControlLabel control={<Radio />} label="Fill Every..." value="every" />
              <FormControlLabel control={<Radio />} label="Pattern Fill" value="pattern" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box height={250} mt={2}>
          { fillMode === 'pattern' && (
            <FormControl component="fieldset" sx={{ display: 'block' }}>
              <TextField
                id="patternLength"
                label="Pattern Length"
                defaultValue={4}
                value={patternLength}
                type="number"
                variant="standard"
                sx={{ width: '100%', mb: 2 }}
                onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                  setPatternLength(Math.min(Math.max(parseInt(e.target.value), 2), 16));
                }}
              />
            </FormControl>
          )}

          { fillMode === 'pattern' && (
            Array.from(stepIndex).map(([_, step], i) => {
              return (
                <FillMarker
                  key={i}
                  step={step}
                  track={track}
                  callback={(st:Step) => {
                    const newSteps = [...steps];
                    newSteps[i] = st;
                    setSteps(newSteps);
                  }}
                />
              )
            }
          )
          )}

          { fillMode === 'every' && (
            <Grid container spacing={1}>
              <Grid item xs={3}>
                <FormControl component="fieldset" sx={{ display: 'block' }}>
                  <TextField
                    id="patternLength"
                    label="Steps"
                    defaultValue={4}
                    value={patternLength}
                    type="number"
                    variant="standard"
                    sx={{ width: '100%', mb: 2 }}
                    onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                      setPatternLength(Math.min(Math.max(parseInt(e.target.value), 2), 16));
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={3}>
                <FormControl component="fieldset" sx={{ display: 'block' }}>
                  <TextField
                    id="patternOffset"
                    label="Start Offset"
                    defaultValue={0}
                    value={patternOffset}
                    type="number"
                    variant="standard"
                    sx={{ width: '100%', mb: 2 }}
                    onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                      setPatternOffset(Math.min(Math.max(parseInt(e.target.value), 0), bars * beatStep * barDiv - patternLength));
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={3}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <FormControl component="fieldset" sx={{ display: 'block', position: 'relative', top: -5 }}>
                      <Typography variant="caption" sx={{ mb: 1 }}>Note</Typography>
                      <Select
                        id="fillNote"
                        label="Note"
                        defaultValue={defaultPitch.slice(0, -1)}
                        value={fillNote}
                        variant="standard"
                        sx={{ width: '100%', mb: 2 }}
                        onChange={(e) => {
                          setFillNote(e.target.value);
                        }}
                      >
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', "A", 'A#', 'B'].map((note, i) => {
                          return <option key={i} value={note}>{note}</option>
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl component="fieldset" sx={{ display: 'block', top: -5 }}>
                      <Typography variant="caption" sx={{ mb: 1 }}>Octave</Typography>

                      <Select
                        id="fillOctave"
                        label="Octave"
                        defaultValue={defaultPitch.slice(-1)}
                        value={fillOctave}
                        variant="standard"
                        sx={{ width: '100%', mb: 2 }}
                        onChange={(e) => {
                          setFillOctave(e.target.value);
                        }}
                      >
                        {[...Array(9)].map((_, i) => {
                          return <option key={i} value={i + 1}>{i + 1}</option>
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <FormControl component="fieldset" sx={{ display: 'block' }}>
                  <TextField
                    id="fillVelocity"
                    label="Velocity"
                    type="number"
                    defaultValue={defaultVelocity}
                    value={fillVelocity}
                    variant="standard"
                    sx={{ width: '100%', mb: 2 }}
                    onChange={(e) => {
                      setFillVelocity(parseInt(e.target.value));
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          )}
        </Box>

        <DialogActionButtons internal padding
          onCancel={handleClose}
          onConfirm={() => {
            let stepList:Step[] = [];

            if (fillMode === 'pattern') {
              let i = 0;

              while (i < bars * beatStep * barDiv) {
                const step = stepIndex.get(i % patternLength) as Step;
                stepList.push({...step, loc: getLoc(i + 1, ticks, barDiv, beatStep)});
                i++;
              }
            } else {
              // Fill every
              let i = 0;
              let j = 0;

              while (i < bars * beatStep * barDiv) {
                const on = (i >= patternOffset && j % patternLength ===  0);

                const newStep:Step = {
                  loc: getLoc(i + 1, ticks, barDiv, beatStep),
                  pitch: defaultPitch,
                  velocity: defaultVelocity,
                  track,
                  on,
                  duration: 1,
                  index: i,
                };

                stepList.push(newStep);

                if (i >= patternOffset) {
                  j++;
                }

                i++;
              }
            }

            dispatch(setPatternTrackSteps({ track, steps: stepList, isPiano: false }));
            handleClose();
          }}
        />

      </DialogContent>

      <StepEditDialog step={editingFillStep} fill={true} callback={(st:Step) => {
        const newSteps = [...steps];
        newSteps[st.index] = st;
        setSteps(newSteps);
      
      }} />
    </Dialog>
  );
};

export default FillStepsDialog;