import { Dialog, DialogContent, Grid, Typography, Checkbox, Divider, Select, Box, Button, Tabs, Tab, useTheme } from "@mui/material";
import { FolderTwoTone as BrowseIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { Track, SampleData, updateTrack, setTrackSample } from "../redux/songSlice";
import useControls from "../hooks/useControls";
import useDialogUI from '../theme/useDialogUI';
import { useDispatch } from "react-redux";
import useApi from "../hooks/useApi";
import { arraysEqual } from "../StepSequencer";

import {
	CircularInput,
	CircularProgress,
	CircularThumb,
  CircularTrack,
  useCircularInputContext
} from 'react-circular-input';

const SETTINGS = 0;
const SAMPLES = 1;
const FILTERS = 2;

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
  
  // Filter controls
  const [filter1On, setFilter1On] = useState(track?.filters?.length ? track.filters[0].on : false);
  const [filter1Type, setFilter1Type] = useState(track?.filters?.length ? track.filters[0].filter_type : 'lp');
  const [filter1Q, setFilter1Q] = useState(track?.filters?.length ? track.filters[0].q : 0);
  const [filter1Freq, setFilter1Freq] = useState<number>(track?.filters?.length ? track.filters[0].frequency : 1);

  const [filter2On, setFilter2On] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].on : false);
  const [filter2Type, setFilter2Type] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].filter_type : 'lp');
  const [filter2Q, setFilter2Q] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].q : 0);
  const [filter2Freq, setFilter2Freq] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].frequency : 1);

  const [samples, setSamples] = useState<SampleData[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  const [tab, setTab] = useState<number>(SETTINGS);

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

    // Filter controls
    setFilter1Type(track?.filters?.length ? track.filters[0].filter_type : 'lp');
    setFilter1Q(track?.filters?.length ? track.filters[0].q : 0);
    setFilter1Freq(track?.filters?.length ? track.filters[0].frequency : .80);

    setFilter2Type((track?.filters?.length && track.filters.length > 1) ? track.filters[1].filter_type : 'lp');
    setFilter2Q((track?.filters?.length && track.filters.length > 1) ? track.filters[1].q : 0);
    setFilter2Freq((track?.filters?.length && track.filters.length > 1) ? track.filters[1].frequency : 100);

    setTab(SETTINGS);
  }, [track]);
  
  const handleClose = () => {
    setEditingTrack(null);
  }

  const handleConfirm = () => {
    if (!track) {
      handleClose();
      return;
    }

    let newTrack = {...track as Track, 
      volume, pan, disabled, rootPitch: `${rootNote}${rootOctave}`, 
      pitchShift, transpose, sample: sample || track.sample,
      reverse, trim, normalize,
    };

    newTrack.filters = [];

    newTrack.filters.push({
      on: filter1On,
      filter_type: filter1Type,
      q: filter1Q,
      frequency: filter1Freq,
      position: 1
    });

    newTrack.filters.push({
      on: filter2On,
      filter_type: filter2Type,
      q: filter2Q,
      frequency: filter2Freq,
      position: 2
    });

    dispatch(updateTrack(newTrack));
    handleClose();
  };

  const { VolumeSlider, PanSlider } = useControls();

  useEffect(() => {
    // if (!track) {
      resetDefaults();
    // }
  }, [track, resetDefaults]);

  useEffect(() => {
    if (tab === SAMPLES) {
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
  }, [tab]);

  if (!track) return null;

  const queryString = `?${Object.entries({ reverse, trim, normalize }).map(([key, val]) => `${key}=${val}`).join('&')}`;

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
          {Boolean(sample && sample?.id)
            ? <img src={`${process.env.REACT_APP_API_URL}/sample/${sample?.id}/waveform${queryString}`} style={{ height: '10rem', width: '100%' }} />
            : null}
          <BrowseIcon
            onClick={() => {
              setTab(SAMPLES);
            }}
            sx={{ position: 'absolute', bottom: '.25rem', right: '.25rem', color: 'primary', fontSize: '2rem', cursor: 'pointer' }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography fontWeight={600} variant="caption" component="p" pl={2} color="white">
            {sample ? `${sample.filename}` : 'No Sample Selected'}
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

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
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
        <Typography pl={0} ml={0} mb={2} onClick={() => { setTab(SETTINGS) }} fontWeight={600} variant="caption" component="p" color="blue">&#12298; Return to Track Info</Typography>
        <Typography fontWeight={600} variant="body1" component="p">Samples:</Typography>

        <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={1} sx={{ maxHeight: '250px', overflowY: 'scroll' }}>
          {samples.map((sample) => {
            return (
              <Grid item xs={12} key={`sample-${sample.filename}`} mb={2}>
                <Grid container spacing={0}>
                  <Grid item xs={3}>
                    <Typography fontWeight={600} color="white" variant="body2" component="p">{sample.display || sample.name || sample.filename}</Typography>
                    <Button onClick={() => {
                      setSample(sample);
                      setTab(SETTINGS);
                    }}>
                      Open
                    </Button>
                  </Grid>
                  <Grid item xs={9}>
                    { sample.waveform ? <img src={`${sample.waveform}`} alt={sample.name} style={{ height: '3rem', width: '100%' }} /> : null }
                  </Grid>
                </Grid>
                {/* <Divider sx={{ mx: 'auto', my: 1, bgcolor: 'white' }} /> */}
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </>
  );

    interface TabPanelProps {
      children?: React.ReactNode;
      index: number;
      value: number;
    }
    
    function CustomTabPanel(props: TabPanelProps) {
      const { children, value, index, ...other } = props;
    
      return (
        <Box
          width="100%"
          p={0} m={0}
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && (
            <>
              {children}
            </>
          )}
        </Box>
      );
    }

    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setTab(newValue);
    };
  
    console.log('filter1Freq', filter1Freq);
    
    const Knob = ({ onBlur, initValue }:{ initValue: number; onBlur: (val:number) => void }) => {
      const CustomComponent = ({ value }:{ value:number }) => {
        const { getPointFromValue } = useCircularInputContext();
        const point = getPointFromValue();
        if (!point) return null;
        return (
          <text
            {...point}
            width="2rem"
            textAnchor="middle"
            dy="0.25em"
            fill="rgb(61, 153, 255)"
            // use transform to flip the text upside-down
            style={{ pointerEvents: "none", fontWeight: "600", fontSize: '.7rem', letterSpacing: '.1px' }}
          >
            {Math.round(value * 100)}
          </text>
        );
      }
    
      const [value, setValue] = useState(initValue || 0.5);

      const theme = useTheme();

      const handleBlur = () => {
        onBlur(value);
      };

      return (
        <Box textAlign={"left"} ml={2}>
          <CircularInput value={value} radius={15} onChange={setValue} onChangeEnd={handleBlur}>
            <CircularProgress
              strokeWidth={10}
              stroke={theme.palette.success.light}
              opacity={value}
            />
            <CircularTrack strokeWidth={10} stroke={theme.palette.success.main} opacity={.25} />

            <CircularThumb
              fill="white"
              stroke={theme.palette.success.main}
              strokeWidth="2"
              r={11}
            />
            <CustomComponent value={value} />
          </CircularInput>
        </Box>
      );
    };

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

          <Grid item xs={12} mb={2}>
            <Divider sx={{ mx: 'auto', my: 2 }} />

            <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="Settings" {...a11yProps(SETTINGS)} />
              <Tab label="Browse Samples" {...a11yProps(SAMPLES)} />
              <Tab label="Filters" {...a11yProps(FILTERS)} />
            </Tabs>
          </Grid>

          <CustomTabPanel value={tab} index={SAMPLES}>
            <Grid container spacing={0}>
              <Grid item xs={12} sx={{ height: '314px' }}>
                <Typography pl={0} ml={0} mb={2} onClick={() => { setTab(SETTINGS) }} fontWeight={600} variant="caption" component="p" color="blue">&#12298; Return to Track Info</Typography>
                <Typography fontWeight={600} variant="body1" component="p">Samples:</Typography>

                <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={1} sx={{ maxHeight: '250px', overflowY: 'scroll' }}>
                  {samples.map((sample) => {
                    return (
                      <Grid item xs={12} key={`sample-${sample.filename}`} mb={2}>
                        <Grid container spacing={0}>
                          <Grid item xs={3}>
                            <Typography fontWeight={600} color="white" variant="body2" component="p">{sample.display || sample.name || sample.filename}</Typography>
                            <Button onClick={() => {
                              setSample(sample);
                              setTab(SETTINGS);
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
            </Grid>
          </CustomTabPanel>

          <CustomTabPanel value={tab} index={SETTINGS}>
            <Grid container spacing={0}>
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
                    {Boolean(sample && sample?.id)
                      ? <img src={`${process.env.REACT_APP_API_URL}/sample/${sample?.id}/waveform${queryString}`} style={{ height: '10rem', width: '100%' }} />
                      : null}
                    <BrowseIcon
                      onClick={() => {
                        setTab(SAMPLES);
                      }}
                      sx={{ position: 'absolute', bottom: '.25rem', right: '.25rem', color: 'primary', fontSize: '2rem', cursor: 'pointer' }} />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography fontWeight={600} variant="caption" component="p" pl={2} color="white">
                      {sample ? `${sample.filename}` : 'No Sample Selected'}
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

                        <Grid item xs={12}>
                          <Divider sx={{ mx: 'auto', my: 1, bgcolor: 'white' }} />
                        </Grid>

                      </Grid>
                    }

                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CustomTabPanel>

          <CustomTabPanel value={tab} index={FILTERS}>
            <Grid container spacing={0}>
              {[1, 2].map((filterIdx) => (
                <Grid key={`filter-${filterIdx}`} item xs={12} p={0} m={0} mb={2}>
                  <Box borderRadius={1} borderColor="primary.dark" p={1} m={0} sx={{
                    borderStyle: 'solid',
                    borderWidth: '1px',
                  }}>
                    <Checkbox sx={{ py: 0, display: 'inline-block' }} defaultChecked={filterIdx === 1 ? filter1On : filter2On} onChange={() => {
                      if (filterIdx === 1) {
                        setFilter1On(!filter1On);
                      } else {
                        setFilter2On(!filter2On);
                      }
                    }} />
                    <Typography variant="subtitle1" component="span">
                      Filter {filterIdx}
                    </Typography>

                    <Grid container spacing={0} my={2}>
                      <Grid item xs={4} pt={0}>
                        <Typography variant="caption" component="p" mt={0}>
                          Filter Type
                        </Typography>

                        <Select
                          native
                          value={filterIdx === 1 ? filter1Type : filter2Type}
                          onChange={(e) => {
                            if (filterIdx === 1) {
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
                          {['lp', 'hp', 'bp', 'notch'].map((type) => {
                            return (
                              <option key={type} value={type}>{type.toUpperCase()}</option>
                            );
                          })}
                        </Select>
                      </Grid>

                      <Grid item xs={4}>
                        <Knob initValue={filterIdx === 1 ? filter1Freq : filter2Freq} onBlur={(val:number) => {
                          if (filterIdx === 1) {
                            setFilter1Freq(val);
                          } else {
                            setFilter2Freq(val);
                          }
                        }} />
                      </Grid>

                      <Grid item xs={4}>
                        <Knob initValue={filterIdx === 1 ? filter1Q : filter2Q} onBlur={(val:number) => {
                          if (filterIdx === 1) {
                            setFilter1Q(val);
                          } else {
                            setFilter2Q(val);
                          }
                        }} />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CustomTabPanel>

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