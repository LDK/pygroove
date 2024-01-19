import { Box, Dialog, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Loc, Step, Track, getActivePattern, getActiveSong, setPatternTrackSteps } from "../redux/songSlice";
import { StepSettings } from "../StepSequencer";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { getLoc, getOverallStep, getTicks } from "../hooks/useSteps";
import { 
  ClearTwoTone as EraseIcon,
  DrawTwoTone as DrawIcon,
  LocationSearchingTwoTone as SelectIcon,
  ArrowUpwardTwoTone as UpIcon,
  KeyboardDoubleArrowUpTwoTone as UpDoubleIcon,
  ArrowDownwardTwoTone as DownIcon,
  KeyboardDoubleArrowDownTwoTone as DownDoubleIcon,
  ContentCutTwoTone as SliceIcon,
  ArrowLeftTwoTone as LeftIcon,
  ArrowRightTwoTone as RightIcon,
} from "@mui/icons-material";
import { BlackKey, WhiteKey } from "./PianoKey";
import { noSelect } from "./SongArranger";
import useDialogUI from "../theme/useDialogUI";


const doStepsMatch = (compare: Step[], ignorePitch:boolean = false) => {
  if (!compare || compare.length !== 2) return false;

  const [step1, step2] = compare;

  if (`${step1.loc.bar}-${step1.loc.beat}-${step1.loc.tick}` !== `${step2.loc.bar}-${step2.loc.beat}-${step2.loc.tick}`) {
    return false;
  }

  if (!ignorePitch && step1.pitch !== step2.pitch) {
    return false;
  }
  
  if (step1.on !== step2.on) {
    return false;
  }
  
  return true;
};

const PianoRoll = ({ track, stepSettings, onClose }:{ track?:Track, stepSettings: StepSettings, open:boolean, onClose: () => void }) => {
  const dispatch = useDispatch();

  const { barDiv, beatDiv, beatStep, defaultVelocity } = stepSettings;
  
  const activePattern = useSelector(getActivePattern);

  const keyHeight:number = 28;

  const tickDivs = getTicks(beatStep);

  const [pitchStart, setPitchStart] = useState(71);
  const pitchRange = 16;

  const [barStart, setBarStart] = useState(0);
  const barRange = 2;

  const notes:string[] = useMemo(() => {
    const octaves = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4];
    const pitches = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];

    const list:string[] = [];

    for (let i = 0; i < octaves.length; i++) {
      for (let j = 0; j < pitches.length; j++) {
        const pitch = pitches[j] + octaves[i];
        list.push(pitch);
      }
    }

    return list;
  }, []);

  const keys:ReactElement[] = useMemo(() => {
    const list:ReactElement[] = [];

    for (let idx = pitchStart; idx < Math.min(pitchStart + pitchRange, notes.length); idx++) {
      const note = notes[idx];
      if (note.includes('#')) {
        list.push(<BlackKey height={keyHeight} pitch={note} idx={idx - pitchStart} />);
      } else {
        list.push(<WhiteKey height={keyHeight} pitch={note} idx={idx - pitchStart} />);
      }
    }

    return list;
  }, [pitchStart, notes]);

  const originalSteps = useMemo(() => (!activePattern || !track) ? [] as Step[] : 
    activePattern.steps.filter(step => step.track.position === track.position),
    [activePattern, track]);

  const [steps, setSteps] = useState<Step[]>(originalSteps);

  useEffect(() => {
    setSteps(originalSteps);
  }, [originalSteps]);

  const [mode, setMode] = useState<'select' | 'draw' | 'erase' | 'slice'>('select');

  const [erasing, setErasing] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [sizing, setSizing] = useState<Step | false>(false);
  const [dragging, setDragging] = useState<Step | false>(false);
  const [dragStart, setDragStart] = useState<number | false>(false);

  const { DialogActionButtons } = useDialogUI();

  if (!activePattern || !track) {
    return null;
  }

  const { bars } = activePattern;

  const beatWidth = `calc((100%  / ${barDiv}) - 1px)`;
  const stepWidth = `calc((100% / ${beatDiv}) - 1px)`;

  const barDivs = [];

  const BeatMarker = ({ bar, beat }:{ bar:number, beat:number }) => {
    return (
      <Box display="inline-block" className="beatDiv" borderLeft={1} borderColor={'#333333'} height="100%" width={beatWidth} position="relative">
        <Typography variant="caption" position="absolute" top={keyHeight / 5} left=".5rem" fontWeight={600}>
          {bar}.{beat}
        </Typography>
      </Box>
    );
  }

  const BeatMarkers = ({ bar, disabled }:{bar:number, disabled?: boolean}) => {
    const beats = [];

    for (let i = 0; i < barDiv; i++) {
      beats.push(<BeatMarker bar={bar} beat={i+1} />);
    }

    return (
      <Box display="inline-block" className={`barDiv ${barRange}`} height={keyHeight} width={`calc(100% / ${barRange})`} bgcolor={disabled ? '#909090' : "secondary.light"} m={0} p={0}>
        {beats}
      </Box>
    );
  }

  const reindex = (steps:Step[]) => {
    const newSteps = steps.map((step, i) => {
      return {
        ...step,
        index: i,
      };
    });

    return newSteps;
  };

  const removeStep = (step:Step) => {
    const newSteps = steps.filter(s => s.index !== step.index);

    setSteps(newSteps);
  };

  const addStep = (step:Step) => {
    const newSteps:Step[] = [];

    let newStep:Step = {...step}

    steps.forEach((s, i) => {
      newSteps.push({
        ...s,
        index: i,
      });
    });

    newStep.index = newSteps.length;

    newSteps.push(newStep);

    setSteps(newSteps);

    return newStep;
  };

  const moveStep = (step:Step, loc:Loc, pitch?:string, duration?:number, drop?:boolean) => {
    let newStep:Step;

    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        newStep = {
          ...s,
          loc,
          pitch: pitch || s.pitch,
          duration: duration || s.duration,
        };

        if (dragging && !drop) {
          setDragging(newStep);
        }

        if (dragStart) {
          const diff = getOverallStep(newStep.loc, tickDivs, barDiv, beatStep) - getOverallStep(step.loc, tickDivs, barDiv, beatStep);
          setDragStart(diff + dragStart);
        }
        return newStep;
      }

      return s;
    });

    setSteps(newSteps);
  }

  const sizeStep = (step:Step, duration:number) => {
    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        return {
          ...s,
          duration,
        };
      }

      return s;
    });

    setSteps(newSteps);
  }

  const splitStep = (step:Step, split:number) => {
    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        return {
          ...s,
          duration: split,
        };
      }

      return s;
    });

    newSteps.push({
      ...step,
      duration: step.duration - split,
      loc: getLoc(getOverallStep(step.loc, tickDivs, barDiv, beatStep) + split, tickDivs, barDiv, beatStep),
    });

    setSteps(reindex(newSteps));
  }

  const NoteMarker = ({ step, height }:{ step:Step, height: number }) => {
    const overall = getOverallStep(step.loc, tickDivs, barDiv, beatStep);

    const isDragging = dragging && dragging.index === step.index;
    const isSizing = sizing && sizing.index === step.index;

    return (
      <Box 
        borderColor="#333" borderRight={1} 
        zIndex={(isDragging || isSizing) ? 6 : 4} position="absolute" top={0} left={0}
        bgcolor={`warning.${ (isDragging || isSizing) ? 'light' : 'main' }`} pl={0}
        height={`${height}px`} width={`calc(100% * ${step.duration} + ${step.duration - 1}px + ${Math.floor(step.duration / 4)}px)`}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (mode === 'draw') {
            setSizing(step);
          }
        }}
        onMouseEnter={(e) => {
          if (erasing) {
            removeStep(step);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();

          if (mode === 'erase') {
            removeStep(step);
          }
        }}
      >
        <Typography pl={".25rem"} variant="caption" fontWeight={600} pt={".25rem"} display="block">
          {step.pitch}
        </Typography>

        <Box width="100%" position="absolute" top={0} left={0} height="100%">
          {[...Array(step.duration)].map((_, i) => {
            return (
              <Box 
                onMouseDown={(e) => {
                  if (mode === 'select') {
                    e.stopPropagation();
                    setDragging(step);
                    setDragStart(overall + i);
                  }

                  if (mode === 'slice') {
                    e.stopPropagation();
                    splitStep(step, i);
                  }
                }}
                onMouseEnter={(e) => {
                  if (sizing) {
                    sizeStep(sizing, i + 1);
                  }

                  if (dragging && dragging.index === step.index && dragStart) {
                    const ov = overall + i;
                    const diff = ov - dragStart;

                    const newLoc = getLoc(overall + diff, tickDivs, barDiv, beatStep);

                    moveStep(step, newLoc);
                  }
                }}
                width={`calc(100% / ${step.duration})`} p={0} m={0} height="100%" display="inline-block" />
            );
          })}
        </Box>
      </Box>
    );
  };

  const TickCell = ({ tick, beat, bar, note }:{ tick:number, beat:number, bar:number, note:string }) => {
    const searchStep:Step = {
      loc: {
        bar,
        beat,
        tick,
      },
      pitch: note,
      velocity: defaultVelocity,
      track: track,
      on: true,
      duration: 1,
      index: 0,
    };

    const step = steps.find(step => doStepsMatch([step, searchStep]));

    return (
      <Box id={`tick-${bar}-${beat}-${tick}`} className="tickDiv"
        display="inline-block" borderLeft={1} borderColor={'#333333'}
        height="100%" width={stepWidth} position="relative"
        onMouseUp={(e) => {
          e.stopPropagation();
          console.log('mouse up');
          if (dragging && dragStart) {
            const dropStart = getOverallStep({ bar, beat, tick }, tickDivs, barDiv, beatStep);
            const dropEnd = dropStart + dragging.duration - 1;
            // console.log('dropped item ranges from', dropStart, 'to', dropEnd);

            setDragging(false);
            setDragStart(false);

            const overlapped = steps.filter(s => {
              if (s.pitch !== note) return false;
              if (s.index === dragging.index) return false;
              const stepStart = getOverallStep(s.loc, tickDivs, barDiv, beatStep);
              const stepEnd = stepStart + s.duration - 1;

              if (stepStart > dropEnd) return false;
              if (stepEnd < dropStart) return false;

              return true;
            });

            overlapped.forEach(s => {
              const stepStart = getOverallStep(s.loc, tickDivs, barDiv, beatStep);
              const stepEnd = stepStart + s.duration - 1;

              const fullyCovered = stepStart >= dropStart && stepEnd <= dropEnd;
              const droppedInMiddle = stepStart < dropStart && stepEnd > dropEnd;
              const cutoffStart = stepStart <= dropEnd && stepEnd > dropEnd && !droppedInMiddle;
              const cutoffEnd = stepStart < dropStart && stepEnd <= dropEnd;

              // console.log('step start', stepStart, 'step end', stepEnd);
              // console.log('drop start', dropStart, 'drop end', dropEnd);

              if (fullyCovered) {
                removeStep(s);
                console.log('fully covered', s);
              }

              if (droppedInMiddle) {
                console.log('dropped in middle', s);
                console.log('start', stepStart, 'end', stepEnd);
                console.log('drop start', dropStart, 'drop end', dropEnd);
                removeStep(s);
                // setDragging(false);
                // setDragStart(false);
              }

              if (cutoffStart) {
                console.log('cutoff start', s);
                moveStep(s, getLoc(dropEnd + 1, tickDivs, barDiv, beatStep), note, stepEnd - dropEnd, true); 
              }

              if (cutoffEnd) {
                console.log('cutoff end', s);
                moveStep(s, getLoc(stepStart, tickDivs, barDiv, beatStep), note, dropStart - stepStart, true);
              }
            });
          }
          setErasing(false);
          setDrawing(false);
          setSizing(false);
        }}
        onMouseMove={(e) => {
          if (sizing && !step && sizing.pitch === note) {
            const stepOverall = getOverallStep(sizing.loc, tickDivs, barDiv, beatStep);
            const cellOverall = getOverallStep(
              { 
                bar: parseInt(`${bar}`), 
                beat: parseInt(`${beat}`),
                tick: parseInt(`${tick}`),
              } as Loc,
              tickDivs, barDiv, beatStep
            );

            const diff = cellOverall - stepOverall - sizing.duration + 1;
            
            console.log('diff', diff, cellOverall, stepOverall);
            if (diff > 0) {
              sizeStep(sizing, sizing.duration + diff);
            }
          }
        }}
        onMouseEnter={() => {
          if (dragging && dragStart && dragging.index !== step?.index) {
            const diff = getOverallStep(
              { 
                bar: parseInt(`${bar}`), 
                beat: parseInt(`${beat}`),
                tick: parseInt(`${tick}`),
              } as Loc,
              tickDivs, barDiv, beatStep
            ) - dragStart;

            const newLoc = getLoc(getOverallStep(dragging.loc, tickDivs, barDiv, beatStep) + diff, tickDivs, barDiv, beatStep);

            moveStep(dragging, newLoc, note);
          }
        }}
        onMouseDown={() => {
          if (mode === 'erase') {
            setErasing(true);

            if (step) {
              removeStep(step);
            }
          }

          if (mode === 'draw') {
            if (!step) {
              setSizing(addStep(searchStep));
            }
          }
        }}
      >
        {step && step.pitch ? 
          <NoteMarker step={step} height={keyHeight - 1} /> :
          null}
      </Box>
    );
  }

  const BarDivCells = ({ bar, note, disabled }:{ bar:number, note:string, disabled?:boolean }) => {
    const beats = [];

    for (let i = 0; i < barDiv; i++) {
      const ticks = [];
      for (let j = 0; j < beatDiv; j++) {
        ticks.push(
          <TickCell tick={tickDivs[j]} beat={i+1} bar={bar} note={note} />
        );
      }

      const bgcolor = disabled ? "rgba(90,90,90,.667)" : (i % 2 ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.33)");

      beats.push(
        <Box bgcolor={bgcolor} display="inline-block" className="cellBeatDiv" borderLeft={1} borderColor={'#333333'} height="100%" width={beatWidth} position="relative">
          {ticks}
        </Box>
      );
    }

    return (
      <Box display="inline-block" className="barDiv" height={keyHeight} width={`calc(100% / ${barRange})`} m={0} p={0}>
        {beats}
      </Box>
    );
  }

  let i:number;

  for (i = barStart; i < Math.min(bars, barStart + barRange); i++) {
    barDivs.push(
      <BeatMarkers bar={(i + 1)} />
    );
  }

  for (i; i < (barStart + barRange); i++) {
    console.log('disabled bar', i);
    barDivs.push(
      <BeatMarkers bar={(i + 1)} disabled={true} />
    );
  }

  const NoteRows = () => {
    const rows = [];

    let pitchIdx = 0;

    for (let i = pitchStart; i < Math.min(pitchStart + pitchRange, notes.length); i++) {
    // for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
  
      const barCells = [];
  
      let j:number; 

      for (j = barStart; j < Math.min(bars, barStart + barRange); j++) {
        barCells.push(<BarDivCells bar={j + 1} note={note} />);
      }

      for (j; j <= (barStart + barRange); j++) {
        barCells.push(<BarDivCells bar={j + 1} note={note} disabled={true} />);
      }
  
      rows.push(
        <Box width="100%" height={`${(keyHeight - 1)}px`}
          key={`note-row-${i}`}
          id={`note-row-${note}`}
          position="absolute" left={0} top={pitchIdx * ((keyHeight - 1) + 1)}
          borderBottom={1}
          borderColor="#333"
          sx={{ borderBottom: '1px dashed white' }}
          zIndex={3}
          onScroll={(e) => {
            console.log('SCROLL', e);
          }}
          bgcolor={note.includes('#') ? 'primary.main' : 'primary.light'}
        >
          {barCells}
        </Box>
      );
  
      pitchIdx++;
    }
  
    return (
      <Box height={keyHeight * pitchRange} width={`calc(100%)`} position="relative" top={keyHeight + 1} sx={{ overflowY: 'hidden' }}>
        {rows}
      </Box>
    );
  };

  const ModeSelector = () => (
    <Grid container spacing={0}>
      <Grid item xs={3} textAlign={"center"}>
        <SelectIcon 
          onClick={() => setMode('select')}
          sx={{ color: (mode === 'select' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
      </Grid>

      <Grid item xs={3}textAlign={"center"}>
        <DrawIcon 
          onClick={() => setMode('draw')}
          sx={{ color: (mode === 'draw' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
      </Grid>

      <Grid item xs={3} textAlign={"center"}>
        <EraseIcon
          onClick={() => setMode('erase')}
          sx={{ color: (mode === 'erase' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
      </Grid>

      <Grid item xs={3} textAlign={"center"}>
        <SliceIcon
          onClick={() => setMode('slice')}
          sx={{ color: 'white', width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      sx={{...noSelect}}
      fullWidth={true}
      maxWidth={'xl'}
      open={Boolean(track)}
      onClose={onClose}
    >
      <DialogTitle sx={{position: "relative"}}>
        {track.name} in {activePattern.name} -- {bars} bars

        <Box position="absolute" right="1rem" bottom="0">
          <LeftIcon 
            sx={{
              opacity: (barStart === 0 ? 0.25 : 1),
              cursor: (barStart === 0 ? 'default' : 'pointer'),
            }}
            onClick={() => { setBarStart(Math.max(0, barStart - 1)) }} />
          <RightIcon
            sx={{
              opacity: (barStart >= bars - barRange ? 0.25 : 1),
              cursor: (barStart >= bars - barRange ? 'default' : 'pointer'),
            }}
            onClick={() => { setBarStart(Math.min(bars - barRange, barStart + 1)) }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ overflow: 'hidden' }}>
        <Box width="100%" mb={2} borderRight={1} borderColor="#333" height={`calc(${pitchRange + 1} * ${keyHeight}px)`} position="relative" sx={{ overflow: 'hidden' }}>
          <Box width="5%" display="inline-block" position="absolute" top={0} left={0} height={`calc(${pitchRange + 1} * ${keyHeight}px)`}>
            <UpIcon 
              onClick={() => {
                setPitchStart(Math.max(0, pitchStart - 1));
              }}
              sx={{ 
                width: '.75em',
                fontSize: '2rem',
                cursor: (pitchStart === 0 ? 'default' : 'pointer'),
                position: 'absolute',
                top: 0, 
                left: 0,
                opacity: (pitchStart === 0 ? 0.25 : 1),
              }}
            />
            
            <UpDoubleIcon
              onClick={() => {
                setPitchStart(Math.max(0, pitchStart - 12));
              }}
              sx={{ 
                width: '.75em',
                fontSize: '2rem',
                cursor: (pitchStart === 0 ? 'default' : 'pointer'),
                position: 'absolute',
                top: 0,
                left: '50%',
                opacity: (pitchStart === 0 ? 0.25 : 1),
              }}
            />

            <DownIcon 
              onClick={() => {
                setPitchStart(Math.min(notes.length - pitchRange, pitchStart + 1));
              }}
              sx={{ 
                width: '.75em',
                fontSize: '2rem',
                cursor: (pitchStart >= notes.length - pitchRange ? 'default' : 'pointer'),
                position: 'absolute',
                opacity: (pitchStart >= notes.length - pitchRange ? 0 : 1),
                bottom: 0, 
                left: 0,
              }}
            />
            
            <DownDoubleIcon
              onClick={() => {
                setPitchStart(Math.min(notes.length - pitchRange, pitchStart + 12));
              }}
              sx={{ 
                width: '.75em',
                fontSize: '2rem',
                cursor: (pitchStart >= notes.length - pitchRange ? 'default' : 'pointer'),
                position: 'absolute',
                opacity: (pitchStart >= notes.length - pitchRange ? 0 : 1),
                bottom: 0,
                left: '50%' 
              }}
            />

          </Box>

          <Box width="95%" borderBottom={1} borderColor="#333" height={`calc(100% - ${keyHeight - 1}px)`} display="inline-block" position="relative" left={"5%"}>
            <Box height={keyHeight} p={0} m={0} bgcolor="primary.dark" width="120px">
              <ModeSelector />
            </Box>

            <Box sx={{ zIndex: 5 }} height={keyHeight * pitchRange - 5} top={keyHeight} left={0} display="inline-block" width="120px" position="absolute" bgcolor="#333333" borderLeft={1} borderBottom={1} borderColor={'#333333'} borderRadius={0}> 
              {keys}
            </Box>

            <Box width="calc(100% - 120px)" height={`calc(${keyHeight}px * ${keys.length + 1})`} position="absolute" top={0} left="120px" bgcolor="grey" sx={{ overflowX: 'scroll', overflowY: 'hidden', zIndex: 4 }}>
              <Box height={keyHeight} width={`calc(100%)`} bgcolor="#303030" position="absolute" top={0} left={0}>
                {barDivs}
              </Box>

              <NoteRows />

            </Box>
          </Box>
        </Box>

        <DialogActionButtons
          confirmLabel="Save"
          onConfirm={() => {
            console.log('save these steps', steps);
            dispatch(setPatternTrackSteps({ pattern: activePattern, track, steps, isPiano: true }));
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>    
  );
};

export default PianoRoll;