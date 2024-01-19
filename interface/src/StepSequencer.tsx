import { Box, Button, Grid, Typography } from "@mui/material";
import { MoreHorizTwoTone, PianoTwoTone } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Step, Track, getActivePattern, getActiveSong, getTrackSteps, toggleTrack } from "./redux/songSlice";
import { useDispatch, useSelector } from "react-redux";
import useSteps, { getLoc, getOverallStep, getTicks } from "./hooks/useSteps";
import TrackEditDialog from "./dialogs/TrackEditDialog";
import useControls from "./hooks/useControls";
import PianoRoll from "./components/PianoRoll";

export type StepSettings = {
  barDiv: number;
  beatDiv: number;
  beatStep: number;
  defaultPitch: string;
  defaultVelocity: number;
};

const stepSettings:StepSettings = {
  barDiv: 4,
  beatDiv: 4,
  beatStep: 4,
  defaultPitch: 'C3',
  defaultVelocity: 100,
};

export const arraysEqual = (a:any[], b:any[]) => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

const StepSequencer = () => {
  const activeSong = useSelector(getActiveSong);
  const activePattern = useSelector(getActivePattern);

  const { tracks } = activeSong || { tracks: [] };
  
  const { StepEditDialog, editingStep, getPatternStepMarkers, editingTrack, setEditingTrack } = useSteps(stepSettings);

  const { VolumeSlider, PanSlider, onSliderSave } = useControls();

  const dispatch = useDispatch();

  const [pianoRollOpen, setPianoRollOpen] = useState<Track | undefined>(undefined);

  const SequencerTrack = ({ track }:{ track:Track }) => {
    const [ on, setOn ] = useState(!track.disabled);
    const [patternSteps, setPatternSteps] = useState<Step[]>(activePattern ? getTrackSteps(activePattern, track) : []);

    const handleTrackToggle = () => {
      dispatch(toggleTrack(track.position));
    }

    useEffect(() => {
      if (!activePattern) return;
      const newSteps = getTrackSteps(activePattern, track);
  
      if (!arraysEqual(newSteps, patternSteps)) {
        setPatternSteps(newSteps);
      }
    }, [track, patternSteps]);
  
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

    const noteValues = {
      'A': 1,
      'A#': 2,
      'B': 3,
      'C': 4,
      'C#': 5,
      'D': 6,
      'D#': 7,
      'E': 8,
      'F': 9,
      'F#': 10,
      'G': 11,
      'G#': 12
    };

    const getNoteValue = (pitch:string) => {
      const octave = parseInt(pitch.slice(-1));
      const base = noteValues[pitch.slice(0, -1) as keyof typeof noteValues];
      return octave * 12 + base;
    };

    const getNoteRange = (pitches:string[]) => {
      // For each pitch in `pitches`, separate the numeric value at the end from the 1-or-2 character pitch name
      // Multiply the octave by 12 and add the base value of the pitch name

      const values = pitches.map(getNoteValue);

      return {
        lowest: Math.min(...values),
        highest: Math.max(...values),
        range: Math.max(...values) - Math.min(...values),
      };
    }

    // A box that contains the piano roll for this track.  Not editable, does not show piano keys.
    const PianoDisplay = () => {
      const { steps, bars } = activePattern;
      const { beatDiv, barDiv, beatStep } = stepSettings;

      const ticks = getTicks(beatStep);      
      const pitches:string[] = [];

      const notes = steps.filter((step) => {
        return (step.on && (step.track.position === track.position));
      }).map((step, i) => {
        const { pitch } = step;
        pitches.push(pitch);
        const overall = getOverallStep(step.loc, ticks, barDiv, beatStep);
        return { pitch, overall, duration: step.duration };
      })

      const { lowest, highest, range } = getNoteRange(pitches);
      const rowHeightPct = 100 / (range + 1);
      const beatWidthPct = 100 / (bars * beatDiv * beatStep);

      console.log('PITCHES', pitches, lowest, highest, range, rowHeightPct, beatWidthPct);

      return (
        <Box px={2} sx={{ position: 'relative', cursor: 'pointer' }} 
          height={{md: 131, lg: 80 }}
          onClick={() => { setPianoRollOpen(track) }}
        >
          <Box bgcolor="secondary.main" height="100%" width="100%" position="relative">
            {notes.map((note, i) => {
              const { pitch, overall } = note;
              const pitchIdx = getNoteValue(pitch);
              const top = (highest - pitchIdx) * rowHeightPct;
              console.log('TOP', top, highest, pitchIdx, (highest - pitchIdx), rowHeightPct);
              const left = (overall - 1) * beatWidthPct;
              return (
                <Box
                  key={i}
                  position="absolute"
                  top={`${top}%`}
                  left={`${left}%`}
                  width={`calc(${beatWidthPct}% * ${note.duration})`}
                  height={`calc(${rowHeightPct}%)`}
                  bgcolor="warning.light"
                  sx={{ zIndex: 4 }}
                >

                </Box>
              );
            })}

            {[1,2].map((i) => 
              <Box sx={{ zIndex: 3 }} position="absolute" top={0} left={`${(i-1) * 50 + 25}%`} width="25%" height="100%" bgcolor="rgba(0,0,0,.25)">
              </Box>
            )}
          </Box>
        </Box>
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
                <Typography fontWeight={600} variant="caption" component="div" color="primary.contrast" width="64px" textAlign="center">
                  {/* Show up to 6 characters of track name and then ellipsis as needed */}
                  {track.name.length > 7 ? `${track.name.substring(0, 7)}…` : track.name}
                </Typography>
              </Button>
            </Grid>

            <Grid item xs={3}>
              <Box width="100%" textAlign={"center"} maxHeight={"64px"} mx="auto">
                <VolumeSlider
                  target={track}
                  model="Track"
                  useLabel
                  onBlur={(e:React.FocusEvent<HTMLInputElement>) => {
                    onSliderSave({ model: 'Track', target: track, facet: 'volume', value: parseFloat(e.target.value) });
                  }}
                />
              </Box>
            </Grid>
  
            <Grid item xs={3}>
              <Box width="100%" textAlign={"center"} maxHeight={"64px"} maxWidth="64px" mx="auto">
                <PanSlider
                  target={track}
                  model="Track"
                  useLabel
                  onBlur={(e:React.FocusEvent<HTMLInputElement>) => {
                    onSliderSave({ model: 'Track', target: track, facet: 'pan', value: parseFloat(e.target.value) });
                  }}
                />
              </Box>
            </Grid>
  
            <Grid item xs={3}>
              <Box width="100%" textAlign={"center"} mx="auto" mb="0">
                <Box borderRadius="50%" bgcolor={
                  on ? 'rgba(225,0,0,.9)' : 'info.dark'
                } height="16px" width="16px" mx="auto"
                  onClick={() => {
                    setOn(!on)
                    handleTrackToggle();
                  }}
                >
  
                </Box>
                <Typography variant="caption" component="div" color="text.secondary">
                  {on ? 'On' : 'Off'}
                </Typography>
  
                <Typography sx={{ cursor: 'pointer' }} onClick={() => { setPianoRollOpen(track) }} variant="caption" component="div" color="text.secondary">
                  <PianoTwoTone sx={{ p: 0, m:0 }} />
                </Typography>

                {/* <MoreHorizTwoTone sx={{ color:'black', p:0, m:0 }} /> */}
              </Box>
            </Grid>
          </Grid>
        </Grid>
  
        <Grid item xs={9}>
          { Boolean(activePattern.pianoIndex && activePattern.pianoIndex[`${track.position}`]) ? <PianoDisplay /> : <StepMarkers /> }
          {/* <StepMarkers /> */}
        </Grid>
      </Grid>
    );
  };
    

  return (
    <Box px={{ xs: 2, lg: 1, xl: 0 }} m={0} sx={{ overflowY: 'scroll', overflowX: 'hidden' }} maxHeight="400px">
      {tracks.map((track, i) => <SequencerTrack key={i} track={track} />)}
      <StepEditDialog step={editingStep} />
      <TrackEditDialog track={editingTrack} setEditingTrack={setEditingTrack} />
      <PianoRoll open={Boolean(pianoRollOpen)} onClose={() => { setPianoRollOpen(undefined); }} track={pianoRollOpen} {...{ stepSettings }} />
    </Box>
  );
};

export default StepSequencer;