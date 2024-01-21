import { Box, Typography } from "@mui/material";
import { getOverallStep, getLoc, getTicks } from "../hooks/useSteps";
import { Loc, Step, Track } from "../redux/songSlice";
import { StepSettings } from "../StepSequencer";

type TickCellProps = {
  steps: Step[];
  track?: Track;
  tick: number;
  beat: number;
  bar: number;
  note: string;
  children?: any;
  stepWidth: string;
  dragging: Step | false;
  dragStart: number | false;
  stepSettings: StepSettings;
  setSelected: (step?: Step) => void;
  setDragging: (step: Step | false) => void;
  setDragStart: (step: number | false) => void;
  setErasing: (erasing: boolean) => void;
  setDrawing: (drawing: boolean) => void;
  addStep: (step: Step) => Step;
  removeStep: (step: Step) => void;
  splitStep: (step: Step, split: number) => void;
  moveStep: (step: Step, loc: Loc, pitch?: string, duration?: number, drop?: boolean) => void;
  setSizing: (step: Step | false) => void;
  sizing: Step | false;
  mode: 'draw' | 'erase' | 'select' | 'slice';
  sizeStep: (step: Step, duration: number) => void;
  erasing: boolean;
  selected?: Step;
  keyHeight: number;
};

const doStepsMatch = (compare: Step[], ignorePitch:boolean = false) => {
  if (!compare || compare.length !== 2) return false;

  const [step1, step2] = compare;

  if (`${step1.loc.bar}-${step1.loc.beat}-${step1.loc.tick}` !== `${step2.loc.bar}-${step2.loc.beat}-${step2.loc.tick}`) {
    return false;
  }

  if (!ignorePitch && step1.pitch !== step2.pitch) {
    return false;
  }
  
  return true;
};

const TickCell = ({ setSelected, setDragging, setErasing, setDrawing, setSizing, setDragStart, sizing, erasing, selected, sizeStep, addStep, removeStep, moveStep, splitStep, keyHeight, mode, tick, stepWidth, track, beat, bar, note, steps, dragging, dragStart, stepSettings }:TickCellProps) => {

  if (!track) { console.log('no track', track); return null; }

  const NoteMarker = ({ step, height }:{ step:Step, height: number }) => {
    const overall = getOverallStep(step.loc, tickDivs, barDiv, beatStep);

    const isDragging = dragging && dragging.index === step.index;
    const isSizing = sizing && sizing.index === step.index;
    const isSelected = selected && selected.index === step.index;

    const bgColor = (Boolean(step.on)) ? `${(isDragging || isSizing || isSelected) ? 'secondary.light' : 'warning.main'}` : '#CCC';

    return (
      <Box 
        borderColor="#333" borderRight={1} 
        zIndex={(isDragging || isSizing) ? 6 : 4} position="absolute" top={0} left={0}
        bgcolor={bgColor}
        pl={0}
        sx={{
          opacity: step.on ? 1 : .8,
        }}
        height={`${height}px`} width={`calc(100% * ${step.duration} + ${step.duration - 1}px + ${Math.floor(step.duration / 4)}px)`}
        onMouseDown={(e) => {
          if (mode === 'draw') {
            e.stopPropagation();
            setSizing(step);
          }
        }}
        onMouseEnter={() => {
          console.log('note marker mouse enter', erasing);
          if (erasing) {
            removeStep(step);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();

          if (mode === 'erase') {
            removeStep(step);
          }

          if (mode === 'select') {
            setSelected(step);
          }
        }}
      >
        <Typography color={(isDragging || isSelected || isSizing) ? 'white' : undefined} pl={".25rem"} variant="caption" fontWeight={600} pt={".25rem"} display="block">
          {step.pitch}
        </Typography>

        <Box width="100%" position="absolute" top={0} left={0} height="100%">
          {[...Array(step.duration)].map((_, i) => {
            return (
              <Box 
                onMouseDown={(e) => {
                  if (mode === 'select') {
                    e.stopPropagation();
                    setSelected(step);
                    setDragging(step);
                    setDragStart(overall + i);
                  }

                  if (mode === 'slice') {
                    e.stopPropagation();
                    if (step.duration > 1) {
                      splitStep(step, Math.max(i, 1));
                    }
                  }
                }}
                onMouseEnter={() => {
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

  const { barDiv, beatStep, defaultVelocity } = stepSettings;

  const tickDivs = getTicks(beatStep);
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
    retrigger: 0,
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

          setSelected(dragging);

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

        console.log('turning off erasing');
        setErasing(false);
        setDrawing(false);
        setSizing(false);
      }}
      onMouseMove={() => {
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
        console.log('mouse down', mode);
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

        if (mode === 'select') {
          setSelected(step);
        }
      }}
    >
      {step && step.pitch ? 
        <NoteMarker step={step} height={keyHeight - 1} /> :
        null}

    </Box>
  );
}

export default TickCell;