import { Box, Checkbox, Dialog, DialogContent, DialogTitle, FormControl, Grid, NativeSelect, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { Step, Track, setPatternTrackSteps } from "../redux/songSlice";
import { StepSettings } from "../StepSequencer";
import { ChangeEvent, useState } from "react";
import { noSelect } from "./SongArranger";
import useDialogUI from "../theme/useDialogUI";
import PanSlider from "./PanSlider";
import ModeSelector from "./PianoModeSelector";
import usePianoRoll from "../hooks/usePianoRoll";
import PitchScroller from "./PitchScroller";
import BeatMarkers from "./PianoBeatMarkers";
import BarScroller from "./BarScroller";
import TickCell from "./TickCell";

const VerticalLine = ({ display }:{ display?: any }) => (
  <Box display={display || "inline-block"} height={24} bgcolor="secondary.light" width={"1px"} mx={2} pt={0}>

  </Box>
);

export type PianoRollProps = {
  track?: Track;
  stepSettings: StepSettings;
  onClose: () => void;
};

const PianoRoll = ({ track, stepSettings, onClose }:PianoRollProps) => {
  const dispatch = useDispatch();

  const { barDiv, beatDiv } = stepSettings;
  
  const { 
    notes, keys, tickDivs, steps, 
    pitchStart, setPitchStart, pitchRange, barStart, setBarStart, barRange, keyHeight,
    removeStep, updateStep, addStep, moveStep, sizeStep, splitStep,
    selected, setSelected, dragging, setDragging, dragStart, setDragStart,
    erasing, setErasing, setDrawing, sizing, setSizing,
    patternName, bars
  }
    = usePianoRoll({ track, stepSettings, onClose });

  const [focus, setFocus] = useState<'velocity' | 'pan' | false>(false);
  
  const [mode, setMode] = useState<'select' | 'draw' | 'erase' | 'slice'>('select');

  const { DialogActionButtons } = useDialogUI();

  if (!track) {
    console.log('no track', track);
    return null;
  }
  
  const beatWidth = `calc((100%  / ${barDiv}) - 1px)`;
  const stepWidth = `calc((100% / ${beatDiv}) - 1px)`;

  const BarDivCells = ({ bar, note, disabled }:{ bar:number, note:string, disabled?:boolean }) => {
    const beats = [];

    for (let i = 0; i < barDiv; i++) {
      const ticks = [];
      for (let j = 0; j < beatDiv; j++) {
        ticks.push(
          <TickCell tick={tickDivs[j]} beat={i+1} track={track} 
          {...{
            setDragging, setDragStart, setDrawing, setErasing, setSelected, setSizing,
            dragging, dragStart, erasing, selected, sizing, mode, stepSettings,
            keyHeight, stepWidth, bar, note, disabled, steps,
            addStep, updateStep, removeStep, moveStep, sizeStep, splitStep,
          }}
          />
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

  const SelectedStepEditor = ({ step }:{ step?:Step }) => {
    const [velocity, setVelocity] = useState(step?.velocity || 0);
    const [reverse] = useState(step?.reverse || false);
    const [on] = useState(step?.on || false);
    const [retrigger, setRetrigger] = useState(step?.retrigger ||0);

    const retriggerLabels = {
      "0": 'Off',
      "1": 'Each Beat',
      "2": 'Each 1/2 Beat',
      "3": 'Each 1/3 Beat',
      "4": 'Each 1/4 Beat',
      "6": 'Each 1/6 Beat',
      "8": 'Each 1/8 Beat',
    };

    const CheckBox =({ checked, onChange, label }:{ checked: boolean, label: string, onChange: (e:React.ChangeEvent<HTMLInputElement>) => void }) => {
      return (
        <>
          <Checkbox
            sx={{ color: 'white', pt: 0 }}
            {...{ checked, onChange }}
          />

          <Typography color="white" variant="caption" pt={0} position="relative" top={-4}>
            { label }
          </Typography>
        </>
      );
    };

    if (!step) {
      return null;
    }

    return (
      <Grid container spacing={0}>
        <Grid item xs={12} textAlign={"left"}>
          <Box display={{ xs: 'none', lg: 'inline' }} pt={0} pl={0} position="relative" top={-8}>
            <Typography color="white" variant="caption" pl={2} display="inline-block" width={192}>
              <Typography variant="caption" pl={2} display={{ xs: 'none', xl: 'inline' }}>Selected </Typography>
              Step: 
              <Typography variant="caption" fontWeight="bold"> {step.pitch} </Typography>
              at 
              <Typography variant="caption" fontWeight="bold"> {`${step.loc.bar}.${step.loc.beat}.${step.loc.tick}`}
              </Typography>
            </Typography>
          </Box>

          <VerticalLine display={{ xs: 'none', lg: 'inline-block' }} />

          <Box display={{ xs: 'none', lg: 'inline' }} pt={0} pl={0} position="relative" top={-8}>
            <Typography color="white" display="inline-block" width={56} variant="caption" pr={0}>Beats: {step.duration}</Typography>
          </Box>

          <VerticalLine display={{ xs: 'none', lg: 'inline-block' }} />

          <Box display="inline" pt={0} pl={0} position="relative" top={-4}>
            <CheckBox label="On" checked={on} onChange={(e) => { updateStep({...step, on: e.target.checked }); }} />
          </Box>

          <Box display="inline" pt={0} pl={0} position="relative" top={-4}>
            <CheckBox label="Rev." checked={reverse} onChange={(e) => { updateStep({...step, reverse: e.target.checked }); }} />
          </Box>

          <VerticalLine />

          <Box display="inline-block" pt={0} pl={0} position="relative" top={-8}>
            <Typography color="white" variant="caption" pr={2}>Vel:</Typography>
            <input name="velocity"
              style={{ width: 36 }}
              type="number"
              max={127}
              min={1}
              autoFocus={focus === 'velocity'}
              onKeyUp={() => {
                if (velocity !== selected?.velocity) {
                  setFocus('velocity');
                  updateStep({...step, velocity: velocity });
                }
              }}
              onMouseDown={() => {
                setFocus('velocity');
              }}
              onMouseEnter={() => {
                setFocus('velocity');
              }}
              onMouseLeave={() => {
                setFocus(false);
              }}
              onMouseUp={() => {
                if (velocity !== selected?.velocity) {
                  updateStep({...step, velocity: velocity });
                }
              }}
              onFocus={() => { setFocus('velocity'); }}
              onBlur={() => { setFocus(false); }}
              value={velocity}
              onChange={(e) => { setVelocity(parseInt(e.target.value)); }}
            />
          </Box>

          <VerticalLine />

          <Typography color="white" variant="caption" pr={2} position="relative" top={-8}>Pan:</Typography>

          <Box display="inline-block" pt={0} pl={0} position="absolute" top={-4}>
            <PanSlider
              inputProps={
                {
                  style: {
                    height: '5px',
                    position: 'relative',
                    top: '2px',
                    width: '50%'
                  },
                  autoFocus: focus === 'pan',
                  onMouseEnter: () => { setFocus('pan'); },
                  onFocus: () => { setFocus('pan'); },
                  onKeyDown: () => { setFocus('pan'); },
                  onMouseLeave: (e:React.MouseEvent<HTMLInputElement>) => {
                    if (e.target instanceof HTMLInputElement) {
                      const val = parseInt(e.target.value);

                      if (val !== step.pan) {
                        setFocus(false);
                        updateStep({...step, pan: val });
                      } 
                    }
                  },
                  onBlur: (e:React.FocusEvent<HTMLInputElement>) => {
                    if (e.target instanceof HTMLInputElement) {
                      const val = parseInt(e.target.value);

                      if (val !== step.pan) {
                        setFocus(false);
                        updateStep({...step, pan: val });
                      } 
                    }
                },
                  onKeyUp: (e:React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.target instanceof HTMLInputElement) {
                      const val = parseInt(e.target.value);
                      if (val !== step.pan) {
                        setFocus('pan');
                        updateStep({...step, pan: val });
                      } 
                    }
                  }
                }
              }
              hideLabel={true}
              target={step}
              defaultValue={step.pan || 0}
              callback={(val:number) => {
                updateStep({...step, pan: val });
              }}
              width="90%" />

            <Typography color="white" variant="caption" position="relative" left={"calc(50% + 16px)"} top={-15}>
              {step.pan! > 0 ? `${step.pan!}R` : (step.pan! < 0 ? `${step.pan! * -1}L` : 'C')}
            </Typography>
          </Box>

          <Box p={0} m={0} display="inline-block" position="absolute" right={8} top={8}>
            <VerticalLine />

            <Typography variant="caption" color="white" position="relative" top={-8} pl={0} pr={1}>Retrigger: </Typography>

            <FormControl>
              <NativeSelect
                defaultValue={retrigger}
                onChange={(e:ChangeEvent<HTMLSelectElement>) => {
                  const val = parseInt(e.target.value);
                  setRetrigger(val);
                  updateStep({...step, retrigger: val });
                }}
                inputProps={{
                  style: {backgroundColor: 'white', paddingLeft: 8, paddingTop: 1, paddingBottom: 1, height: 22, fontSize: '.8rem'},
                  name: 'retrigger',
                  id: 'retrigger-native',
                }}
              >
                {Object.keys(retriggerLabels).map(key => {
                  return (
                    <option value={key}>{retriggerLabels[key as keyof typeof retriggerLabels]}</option>
                  );
                })}
              </NativeSelect>
            </FormControl>
              
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog
      sx={{...noSelect}}
      fullWidth={true}
      maxWidth={'xl'}
      open={Boolean(track)}
      onClose={onClose}
    >
      <DialogTitle sx={{position: "relative"}}>
        {track.name} in {patternName} -- {bars} bars
        <BarScroller {...{ barStart, setBarStart, barRange, bars }} />
      </DialogTitle>

      <DialogContent sx={{ overflow: 'hidden' }}>
        <Box width="100%" mb={0} borderRight={1} borderColor="#333" height={`calc(${pitchRange + 1} * ${keyHeight}px)`} position="relative" sx={{ overflow: 'hidden' }}>
          <PitchScroller {...{ pitchStart, setPitchStart, pitchRange, keyHeight, notes }} />

          <Box width="97.5%" borderBottom={1} borderColor="#333" height={`calc(100% - ${keyHeight - 1}px)`} display="inline-block" position="relative" left={"2.5%"}>
            <Box height={keyHeight} p={0} m={0} bgcolor="primary.dark" width="120px">
              <ModeSelector {...{ mode, setMode }} />
            </Box>

            <Box sx={{ zIndex: 5 }} height={keyHeight * pitchRange} top={keyHeight} left={0} display="inline-block" width="120px" position="absolute" bgcolor="#333333" borderLeft={1} borderBottom={1} borderColor={'#333333'} borderRadius={0}> 
              {keys}
            </Box>

            <Box width="calc(100% - 120px)" height={`calc(${keyHeight}px * ${keys.length + 1})`} position="absolute" top={0} left="120px" bgcolor="grey" sx={{ overflowX: 'scroll', overflowY: 'hidden', zIndex: 4 }}>
              <Box height={keyHeight} width={`calc(100%)`} bgcolor="#303030" position="absolute" top={0} left={0}>
                <BeatMarkers {...{ barDiv, barRange, barStart, keyHeight, beatWidth, bars }} />
              </Box>

              <NoteRows />

            </Box>
          </Box>
        </Box>

        <Box width="100%" mb={2} borderTop={1} borderRight={1} pt={1} borderColor="#333" height={32} position="relative" bgcolor="secondary.dark">
          {Boolean(selected) && <SelectedStepEditor step={selected} />}
        </Box>
        
        <DialogActionButtons
          confirmLabel="Save"
          onConfirm={() => {
            console.log('save these steps', steps);
            dispatch(setPatternTrackSteps({ track, steps, isPiano: true }));
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>    
  );
};

export default PianoRoll;