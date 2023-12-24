import { Dialog, DialogContent, Grid, Typography, Checkbox, Divider, Select, Box } from "@mui/material";
import { FolderTwoTone as BrowseIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Track } from "../redux/songSlice";
import Range from "./Range";
import PanSlider from "./PanSlider";

const TrackEditDialog = ({ track, setEditingTrack }:{ track:Track | null, setEditingTrack: (arg:Track | null) => void }) => {
  const dispatch = useDispatch();

  const [volume, setVolume] = useState(track?.volume || -6);
  const [pan, setPan] = useState(track?.pan || 0);
  const [disabled, setDisabled] = useState((track?.disabled || track?.disabled === false) ? track.disabled : false);
  const [rootNote, setRootNote] = useState(track?.rootPitch?.replace(/\d/g, '') || 'C');
  const [rootOctave, setRootOctave] = useState(track?.rootPitch?.replace(/\D/g, '') || 3);
  const [pitchShift, setPitchShift] = useState(track?.pitchShift || 0);
  const [transpose, setTranspose] = useState(track?.transpose || 0);

  const [view, setView] = useState<'settings' | 'samples'>('settings');

  // A vertical slider for volume with db labels beneath
  const VolumeSlider = ({ callback, width }:{ callback:(val:number) => void, width?: string }) => {
    const [workingValue, setWorkingValue] = useState(track?.volume || -6);
    
    if (!track) return null;

    return (
      <Box pt={0} px={0} position="relative">
        <Range
          orientation="vertical"
          defaultValue={track.volume || -6}
          callback={callback}
          onChange={(e) => {
            setWorkingValue(parseInt(e.target.value) || -6);
          }}
          height="3rem"
          width={width || "auto"}
          min={-36}
          max={12}
          step={.1}
        />

        <Typography mx="auto" variant="caption" textAlign="left" component="p">{ `${workingValue || ''}dB` }</Typography>
      </Box>
    );
  };

  const resetDefaults = () => {
    setVolume(track?.volume || -6);
    setPan(track?.pan || 0);
  };
  const handleClose = () => {
    setEditingTrack(null);
  }

  useEffect(() => {
    if (!track) {
      resetDefaults();
    }
  }, [track]);

  if (!track) return null;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Grid container py={0}>
          <Grid item xs={4}>
            <Typography fontWeight={600} component="span">Track: </Typography>
            <Typography fontWeight={400} component="span">{track.name}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>

          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Typography fontWeight={600} component="span">Active: </Typography>
            <Checkbox sx={{ py: 0 }} defaultChecked={track.disabled} onChange={() => {
              setDisabled(!disabled);
            }} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mx: 'auto', my: 2 }} />
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography fontWeight={600} variant="caption" component="p">Volume:</Typography>
            <VolumeSlider callback={(val:number) => { setVolume(val); }} width="1rem" />
          </Grid>

          <Grid item xs={12} md={2} pr={3}>
            <Typography fontWeight={600} variant="caption" component="p">Pan:</Typography>
            <PanSlider width="100%" callback={(val:number) => { setPan(val); }} target={track} defaultValue={track.pan || 0} />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography fontWeight={600} pb={1} variant="caption" component="p">Root Pitch:</Typography>
            <Select
              native
              value={rootNote}
              onChange={(e) => {
                setRootNote(e.target.value);
              }}
              inputProps={{
                name: 'rootPitch',
                id: 'rootPitch',
              }}
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A','A#', 'B'].map((pitch) => {
                return (
                  <option key={pitch} value={pitch}>{pitch}</option>
                );
              })
              }
            </Select>

            <Select
              native
              value={rootOctave}
              onChange={(e) => {
                setRootOctave(parseInt(`${e.target.value}`));
              }}
              inputProps={{
                name: 'rootOctave',
                id: 'rootOctave',
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((oct) => {
                return (
                  <option key={oct} value={oct}>{oct}</option>
                );
              })}
            </Select>
          </Grid>

          <Grid item xs={12} md={2} lg={2}>
            <Typography fontWeight={600} pb={1} variant="caption" component="p">Transpose:</Typography>
            <input type="number" step={1} min={-12} max={12} defaultValue={transpose} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
              setTranspose(parseInt(e.target.value) || transpose);
            }} />
          </Grid>

          <Grid item xs={12} md={2} lg={2}>
            <Typography fontWeight={600} pb={1} variant="caption" component="p">Pitch Shift:</Typography>
            <input type="number" step={1} min={-200} max={200} defaultValue={pitchShift} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
              setPitchShift(parseInt(e.target.value) || pitchShift);
            }} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mx: 'auto', my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={1}>
              <Grid item xs={12} md={8} position={"relative"}>
                { Boolean(track.sample)
                  ? <img src={`${process.env.PUBLIC_URL}/img/waveform/default/${track.sample?.replace('.wav','')}.png`} alt={track.name} style={{ height: '10rem', width: '100%' }} /> 
                  : null
                }
                <BrowseIcon 
                  sx={{ position: 'absolute', bottom: '.25rem', right: '.25rem', color: 'primary', fontSize: '2rem', cursor: 'pointer' }} 
                />
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TrackEditDialog;