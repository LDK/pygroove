import { Dialog, DialogContent, Grid, Typography, Checkbox, Divider, Tabs, Tab, TextField, Box, FormControl, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { SampleData, Track, updateTrack } from "../redux/songSlice";
import useDialogUI from '../theme/useDialogUI';
import { useDispatch } from "react-redux";
import { EditTwoTone } from "@mui/icons-material";

import TabPanel from "../components/TabPanel";
import useFilters from "../hooks/useFilters";
import useSamples from "../hooks/useSamples";
import useTrackSettings from "../hooks/useTrackSettings";

const SETTINGS = 0;
const SAMPLES = 1;
const FILTERS = 2;

const TrackEditDialog = ({ track, setEditingTrack }:{ track?:Track, setEditingTrack: (arg?:Track) => void }) => {
  const [disabled, setDisabled] = useState((track?.disabled || track?.disabled === false) ? track.disabled : false);

  const [tab, setTab] = useState<number>(SETTINGS);
  const [renaming, setRenaming] = useState(false);

  const dispatch = useDispatch();

  const { DialogActionButtons } = useDialogUI();

  const { 
    filter1On, setFilter1On, filter1Type, setFilter1Type,
    filter1Order, setFilter1Order, filter1Freq, setFilter1Freq,
    filter2On, setFilter2On, filter2Type, setFilter2Type,
    filter2Order, setFilter2Order, filter2Freq, setFilter2Freq,
    TrackFilters
  } = useFilters({ track, changeCallback: (filters) => { console.log('FILTORZ', filters); }});

  const {
    volume, setVolume,
    pan, setPan,
    rootNote, setRootNote,
    rootOctave, setRootOctave,
    pitchShift, setPitchShift,
    transpose, setTranspose,
    sample, setSample,
    reverse, setReverse,
    trim, setTrim,
    normalize, setNormalize,
    trackName, setTrackName,
    playMode, setPlayMode,
    startOffset, setSampleStart, endOffset, setSampleEnd,
    fadeIn, setFadeIn, fadeOut, setFadeOut,
    TrackSettings
  } = useTrackSettings({ track, filters: {
    filter1On, filter1Type, filter1Order, filter1Freq,
    filter2On, filter2Type, filter2Order, filter2Freq,
  } });

  const { SampleBrowser, fetchSamples } = useSamples();

  const resetDefaults = useCallback(() => {
    setTrackName(track?.name || track?.sample?.display || `Track ${track?.position}` || 'Track');
    setVolume(track?.volume || -6);
    setPan(track?.pan || 0);
    setDisabled((track?.disabled || track?.disabled === false) ? track.disabled : false);
    setRootNote(track?.rootPitch?.replace(/\d/g, '') || 'C');
    setRootOctave(track?.rootPitch?.replace(/\D/g, '') || 3);
    setPitchShift(track?.pitchShift || 0);
    setTranspose(track?.transpose || 0);
    setSample(track?.sample || null);
    setPlayMode(track?.playMode || 'oneshot');

    // Sample controls
    setReverse(track?.reverse || false);
    setTrim(track?.trim || false);
    setNormalize(track?.normalize || false);
    setSampleStart(track?.startOffset || 0);
    setSampleEnd(track?.endOffset || 0);
    setFadeIn(track?.fadeIn || 0);
    setFadeOut(track?.fadeOut || 0);

    // Filter controls
    setFilter1Type(track?.filters?.length ? track.filters[0].filter_type : 'lp');
    setFilter1Order(track?.filters?.length ? track.filters[0].order : 0);
    setFilter1Freq(track?.filters?.length ? track.filters[0].frequency : .80);
    setFilter1On(track?.filters?.length ? track.filters[0].on : false);

    setFilter2Type((track?.filters?.length && track.filters.length > 1) ? track.filters[1].filter_type : 'lp');
    setFilter2Order((track?.filters?.length && track.filters.length > 1) ? track.filters[1].order : 0);
    setFilter2Freq((track?.filters?.length && track.filters.length > 1) ? track.filters[1].frequency : 100);
    setFilter2On((track?.filters?.length && track.filters.length > 1) ? track.filters[1].on : false);

    setTab(SETTINGS);
  }, [track, setVolume, setPan, setDisabled, setRootNote, setRootOctave, setPitchShift, setTranspose, setSample, setReverse, setTrim, setNormalize, setFilter1Type, setFilter1Order, setFilter1Freq, setFilter1On, setFilter2Type, setFilter2Order, setFilter2Freq, setFilter2On, setPlayMode, setSampleStart, setSampleEnd, setFadeIn, setFadeOut, setTrackName]);
  
  const handleClose = () => {
    setEditingTrack(undefined);
  }

  useEffect(() => {
    if (tab === SAMPLES) {
      fetchSamples();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleConfirm = () => {
    if (!track) {
      handleClose();
      return;
    }

    let newTrack = {...track as Track, 
      volume, pan, disabled, rootPitch: `${rootNote}${rootOctave}`, 
      pitchShift, transpose, sample: sample || track.sample,
      reverse, trim, normalize, name: trackName || track.name,
      playMode, startOffset, endOffset, fadeIn, fadeOut
    } as Track;

    newTrack.filters = [];

    newTrack.filters.push({
      on: filter1On,
      filter_type: filter1Type,
      order: filter1Order,
      frequency: filter1Freq,
      position: 1
    });

    newTrack.filters.push({
      on: filter2On,
      filter_type: filter2Type,
      order: filter2Order,
      frequency: filter2Freq,
      position: 2
    });

    dispatch(updateTrack(newTrack));
    handleClose();
  };

  useEffect(() => {
    resetDefaults();
    if (track) {
      fetchSamples();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, resetDefaults]);

  if (!track) return null;

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  
  return (
    <Dialog open={true} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Grid container py={0}>

          {/* Track Edit Header: allows enabling/disabling/renaming track */}

          <Grid item xs={4}>
            { (!renaming) && 
              <Box p={0} m={0} display="inline-block">
                <Typography fontWeight={600} component="span">Track: </Typography>
                <Typography fontWeight={400} component="span">{trackName}</Typography>
                <EditTwoTone sx={{ pl: 1, fontSize: '1rem', verticalAlign: 'middle', cursor: 'pointer' }} onClick={() => {
                  setRenaming(true);
                }} />
              </Box>
            }
            {
              (renaming) &&
                <Box p={0} m={0} display="inline-block">
                  <Grid container spacing={0}>
                    <Grid item xs={9}>
                      <TextField
                        id="trackName"
                        autoFocus={true}
                        label="Track Name"
                        defaultValue={trackName}
                        value={trackName}
                        variant="standard"
                        sx={{ width: '100%', mb: 2, display: "inline-block" }}
                        onKeyDown={(e) => {
                          // If enter is pressed, set editing to false
                          if (e.key === 'Enter') {
                            setRenaming(false);
                          }
                        }}
                        onChange={(e) => {
                          setTrackName(e.target.value);
                        }}
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <Button variant="outlined" sx={{ display: 'inline', height: '50%', top: '25%', ml: 2 }}
                        onClick={() => {
                          setRenaming(false);
                        }}>
                          Done
                      </Button>
                    </Grid>
                  </Grid> 
                </Box>
            }
          </Grid>

          <Grid item xs={4} sx={{ textAlign: 'center' }}>

          </Grid>

          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Typography fontWeight={600} component="span">Active: </Typography>
            <Checkbox sx={{ py: 0 }} defaultChecked={!track.disabled} onChange={() => {
              setDisabled(!disabled);
            }} />
          </Grid>

          {/* Tab Selector */}

          <Grid item xs={12} mb={2}>
            <Divider sx={{ mx: 'auto', my: 2 }} />

            <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="Settings" {...a11yProps(SETTINGS)} />
              <Tab label="Browse Samples" {...a11yProps(SAMPLES)} />
              <Tab label="Filters" {...a11yProps(FILTERS)} />
            </Tabs>
          </Grid>

          {/* Settings Tab */}

          <TabPanel value={tab} index={SETTINGS}>
            <TrackSettings
              browseCallback={() => { setTab(SAMPLES) }}
            />
          </TabPanel>

          {/* Sample Tab */}

          <TabPanel value={tab} index={SAMPLES}>
            <SampleBrowser openCallback={(sample:SampleData) => {
              setSample(sample);
              setTrackName(sample.display || sample.filename);
              setTab(SETTINGS);
            }} />
          </TabPanel>

          {/* Filters Tab */}

          <TabPanel value={tab} index={FILTERS}>
            <TrackFilters />
          </TabPanel>

          {/* This divider provides space beneath, for the action buttons */}
          <Grid item xs={12}>
            <Divider sx={{ mx: 'auto', mt: 2, mb: 4 }} />
          </Grid>

        </Grid>

        {/* 
          Cancel: Close window, revert changes
          Confirm: Close window, update Track in redux
         */}

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