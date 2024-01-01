import { Dialog, DialogContent, Grid, Typography, Checkbox, Divider, Select, Box, Button } from "@mui/material";
import { FolderTwoTone as BrowseIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { Track, SampleData, updateTrack, setTrackSample } from "../redux/songSlice";
import useControls from "../hooks/useControls";
import useDialogUI from '../theme/useDialogUI';
import { useDispatch } from "react-redux";
import { set } from "react-hook-form";
import useApi from "../hooks/useApi";
import { arraysEqual } from "../StepSequencer";

const TrackEditDialog = ({ track, setEditingTrack }:{ track:Track | null, setEditingTrack: (arg:Track | null) => void }) => {
  const [volume, setVolume] = useState(track?.volume || -6);
  const [pan, setPan] = useState(track?.pan || 0);
  const [disabled, setDisabled] = useState((track?.disabled || track?.disabled === false) ? track.disabled : false);
  const [rootNote, setRootNote] = useState(track?.rootPitch?.replace(/\d/g, '') || 'C');
  const [rootOctave, setRootOctave] = useState(track?.rootPitch?.replace(/\D/g, '') || 3);
  const [pitchShift, setPitchShift] = useState(track?.pitchShift || 0);
  const [transpose, setTranspose] = useState(track?.transpose || 0);
  const [sample, setSample] = useState(track?.sample || null);

  // Sample controls
  const [reverse, setReverse] = useState(track?.disabled || false);
  const [trim, setTrim] = useState(track?.disabled || false);
  const [normalize, setNormalize] = useState(track?.disabled || false);
  
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  const [view, setView] = useState<'settings' | 'samples'>('settings');

  const dispatch = useDispatch();

  const { DialogActionButtons } = useDialogUI();
  const { apiGet } = useApi();

  const resetDefaults = useCallback(() => {
    setVolume(track?.volume || -6);
    setPan(track?.pan || 0);
    setDisabled((track?.disabled || track?.disabled === false) ? track.disabled : false);
    setRootNote(track?.rootPitch?.replace(/\d/g, '') || 'C');
    setRootOctave(track?.rootPitch?.replace(/\D/g, '') || 3);
    setPitchShift(track?.pitchShift || 0);
    setTranspose(track?.transpose || 0);
    setSample(track?.sample || null);

    // Sample controls
    setReverse(track?.reverse || false);
    setTrim(track?.trim || false);
    setNormalize(track?.normalize || false);

    setView('settings');
  }, [track]);
  
  const handleClose = () => {
    setEditingTrack(null);
  }

  const handleConfirm = () => {
    if (!track) {
      handleClose();
      return;
    }
    dispatch(updateTrack({...track as Track, 
      volume, pan, disabled, rootPitch: `${rootNote}${rootOctave}`, 
      pitchShift, transpose, sample: sample || track.sample,
      reverse, trim, normalize,
    }));
    handleClose();
  };

  const { VolumeSlider, PanSlider } = useControls();

  useEffect(() => {
    // if (!track) {
      resetDefaults();
    // }
  }, [track, resetDefaults]);

  useEffect(() => {
    if (view === 'samples') {
      setSamplesLoading(true);
      apiGet({
        uri: '/samples',
        onSuccess: (res) => {
          if (!arraysEqual(res.data, samples)) {
            setSamples(res.data);
          }
          setSamplesLoading(false);
        },
        onError: (err) => {
          console.error('Error getting samples:', err);
        }
      });
    }
  }, [view]);

  if (!track) return null;

  const SettingsView = () => <>
    <Grid item xs={12} md={2}>
      <Typography fontWeight={600} variant="caption" component="p">Volume:</Typography>
      <VolumeSlider
        callback={(val: number) => { setVolume(val); } }
        target={track}
        model="Track"
        useLabel
        defaultValue={volume || -6} />
    </Grid>

    <Grid item xs={12} md={2} pr={3}>
      <Typography fontWeight={600} variant="caption" component="p">Pan:</Typography>
      <PanSlider
        width="100%"
        callback={(val: number) => { setPan(val); } }
        target={track}
        model="Track"
        useLabel
        defaultValue={pan || 0} />
    </Grid>

    <Grid item xs={12} md={4}>
      <Typography fontWeight={600} pb={1} variant="caption" component="p">Root Pitch:</Typography>
      <Select
        native
        value={rootNote}
        onChange={(e) => {
          setRootNote(e.target.value);
        } }
        inputProps={{
          name: 'rootPitch',
          id: 'rootPitch',
        }}
      >
        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((pitch) => {
          return (
            <option key={pitch} value={pitch}>{pitch}</option>
          );
        })}
      </Select>

      <Select
        native
        value={rootOctave}
        onChange={(e) => {
          setRootOctave(parseInt(`${e.target.value}`));
        } }
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
      } } />
    </Grid>

    <Grid item xs={12} md={2} lg={2}>
      <Typography fontWeight={600} pb={1} variant="caption" component="p">Pitch Shift:</Typography>
      <input type="number" step={1} min={-200} max={200} defaultValue={pitchShift} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
        setPitchShift(parseInt(e.target.value) || pitchShift);
      } } />
    </Grid>

    <Grid item xs={12}>
      <Divider sx={{ mx: 'auto', my: 2 }} />
    </Grid>

    <Grid item xs={12}>
      <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={1}>
        <Grid item xs={12} md={8} position={"relative"}>
          {Boolean(sample)
            ? <img src={`${process.env.REACT_APP_API_URL}/static/${sample?.replace('.wav', '')}.png`.replace('/api','')} alt={track.name} style={{ height: '10rem', width: '100%' }} />
            : null}
          <BrowseIcon
            onClick={() => {
              setView('samples');
            }}
            sx={{ position: 'absolute', bottom: '.25rem', right: '.25rem', color: 'primary', fontSize: '2rem', cursor: 'pointer' }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography fontWeight={600} variant="caption" component="p" pl={2} color="white">
            {sample ? `${sample}` : 'No Sample Selected'}
          </Typography>

          {!sample ? <></> : 
            <Grid container spacing={1} pl={2}>
              <Grid item xs={4} sx={{ textAlign: 'center' }}>
                <Typography color="white" variant="caption" fontWeight={600} component="span">Reverse</Typography>

                <Checkbox sx={{ py: 0 }} defaultChecked={reverse} onChange={() => {
                  setReverse(!reverse);
                }} />
              </Grid>

              <Grid item xs={4} sx={{ textAlign: 'center' }}>
                <Typography color="white" variant="caption" fontWeight={600} component="span">Normalize</Typography>

                <Checkbox sx={{ py: 0 }} defaultChecked={normalize} onChange={() => {
                  setNormalize(!normalize);
                }} />
              </Grid>

              <Grid item xs={4} sx={{ textAlign: 'center' }}>
                <Typography color="white" variant="caption" fontWeight={600} component="span">Trim</Typography>

                <Checkbox sx={{ py: 0 }} defaultChecked={trim} onChange={() => {
                  setTrim(!trim);
                }} />
              </Grid>

            </Grid>
          }

        </Grid>
      </Grid>
    </Grid>
  </>;

  const SamplesView = () => (
    <>
      <Grid item xs={12} sx={{ height: '314px' }}>
        <Typography pl={0} ml={0} mb={2} onClick={() => { setView('settings') }} fontWeight={600} variant="caption" component="p" color="blue">&#12298; Return to Track Info</Typography>
        <Typography fontWeight={600} variant="body1" component="p">Samples:</Typography>

        <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={1} sx={{ maxHeight: '250px', overflowY: 'scroll' }}>
          {samples.map((sample) => {
            return (
              <Grid item xs={12} key={`sample-${sample.filename}`} mb={2}>
                <Grid container spacing={0}>
                  <Grid item xs={3}>
                    <Typography fontWeight={600} color="white" variant="body2" component="p">{sample.display || sample.name || sample.filename}</Typography>
                    <Button onClick={() => {
                      setSample(sample.filename);
                      setView('settings');
                    }}>
                      Open
                    </Button>
                  </Grid>
                  <Grid item xs={9}>
                    { sample.waveform ? <img src={`${sample.waveform}`} alt={sample.name} style={{ height: '3rem', width: '100%' }} /> : null }
                  </Grid>
                </Grid>
                <Divider sx={{ mx: 'auto', my: 1, bgcolor: 'white' }} />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </>
  );

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
            <Checkbox sx={{ py: 0 }} defaultChecked={!track.disabled} onChange={() => {
              setDisabled(!disabled);
            }} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mx: 'auto', my: 2 }} />
          </Grid>

          { view === 'settings' ? <SettingsView /> : <SamplesView /> }
          
          {/* This divider provides space beneath, for the action buttons */}

          <Grid item xs={12}>
            <Divider sx={{ mx: 'auto', mt: 2, mb: 4 }} />
          </Grid>

        </Grid>

        <DialogActionButtons
            internal
            padding
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />

      </DialogContent>
    </Dialog>
  );
};

export default TrackEditDialog;