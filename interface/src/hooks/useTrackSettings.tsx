import { Grid, Typography, Select, Divider, Checkbox, FormControl, NativeSelect, Box } from "@mui/material";
import { FolderTwoTone as BrowseIcon, HeadphonesTwoTone as PlayIcon } from "@mui/icons-material";
import { Track } from "../redux/songSlice";
import useControls from "./useControls";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Range from "../components/Range";
import StartEndRange from "../components/StartEndRange";
import useApi from "./useApi";

type FilterInfo = {
  filter1On: boolean;
  filter1Type: string;
  filter1Order: number;
  filter1Freq: number;
  filter2On: boolean;
  filter2Type: string;
  filter2Order: number;
  filter2Freq: number;
};

const useTrackSettings = ({track, filters}:{track?: Track, filters: FilterInfo}) => {
  const { VolumeSlider, PanSlider } = useControls();
  const [volume, setVolume] = useState(track?.volume || -6);
  const [pan, setPan] = useState(track?.pan || 0);
  const [rootNote, setRootNote] = useState(track?.rootPitch?.replace(/\d/g, '') || 'C');
  const [rootOctave, setRootOctave] = useState(track?.rootPitch?.replace(/\D/g, '') || 3);
  const [pitchShift, setPitchShift] = useState(track?.pitchShift || 0);
  const [transpose, setTranspose] = useState(track?.transpose || 0);
  const [sample, setSample] = useState(track?.sample || null);
  const [trackName, setTrackName] = useState(track?.name || track?.sample?.display || `Track ${track?.position}` || 'Track');

  // Track Sample controls
  const [reverse, setReverse] = useState(track?.disabled || false);
  const [trim, setTrim] = useState(track?.disabled || false);
  const [normalize, setNormalize] = useState(track?.disabled || false);
  const [playMode, setPlayMode] = useState(track?.playMode || 'oneshot');
  const [sampleStart, setSampleStart] = useState(track?.startOffset || 0);
  const [sampleEnd, setSampleEnd] = useState(track?.endOffset || 0);
  const [fadeIn, setFadeIn] = useState(track?.fadeIn || 0);
  const [fadeOut, setFadeOut] = useState(track?.fadeOut || 0);

  // Holds MP3 binary data
  const [trackAudio, setTrackAudio] = useState<HTMLAudioElement | null>(null);

  const frames = useMemo(() => {
    if (!sample) return 0;
    return sample.frames;
  }, [sample]);

  const {
    filter1On, filter1Type, filter1Order, filter1Freq, 
    filter2On, filter2Type, filter2Order, filter2Freq
  } = filters;

  const queryKeyMap = {
    reverse: 'rv',
    trim: 'tr',
    normalize: 'nm',
    pan: 'pn',
    volume: 'vl',
    pitchShift: 'ps',
    transpose: 'ts',
    filter1On: 'f1',
    filter1Freq: 'fq1',
    filter1Order: 'or1',
    filter1Type: 'ft1',
    filter2On: 'f2',
    filter2Freq: 'fq2',
    filter2Order: 'or2',
    filter2Type: 'ft2',
    sampleStart: 'sst',
    sampleEnd: 'sen',
    sampleId: 'sampleId',
    fadeIn: 'fi',
    fadeOut: 'fo',
  };

  const audioQueryString = `?${Object.entries({ 
    reverse, trim, normalize, pan, volume, pitchShift, transpose,
    filter1On, filter1Type, filter1Order, filter1Freq,
    filter2On, filter2Type, filter2Order, filter2Freq,
    fadeIn, fadeOut,
    sampleStart, sampleEnd, sampleId: sample?.id
  }).map(([key, val]) => `${queryKeyMap[key as keyof typeof queryKeyMap]}=${val}`).join('&')}`;

  const StartSlider = () => {
    if (!frames) return null;

    return (
      <StartEndRange 
        min={0} max={frames}
        defaultValue={[sampleStart, frames-sampleEnd]} callback={([start, end]) => {
        setSampleStart(start);
        setSampleEnd(frames - end);
       }} />
    );
  };

  const FadeInSlider = () => {
    return (
      <Range 
        min={0} max={100}
        labelColor="white"
        labelPrefix="Fade In:"
        labelSuffix='%'
        defaultValue={fadeIn} callback={(val) => {
          setFadeIn(val);
       }} />
    );
  }

  const FadeOutSlider = () => {
    return (
      <Range 
        min={0} max={100}
        labelColor="white"
        labelPrefix="Fade Out:"
        labelSuffix='%'
        defaultValue={fadeOut} callback={(val) => {
          setFadeOut(val);
        }} />
    );
  }

  const { apiGet } = useApi();

  useEffect(() => {
    setTrackAudio(null);
    if (sample) {
      const audio = new Audio(`${process.env.REACT_APP_API_URL}/sample/${sample.id}/preview${audioQueryString}`);

      if (audio) {
        setTrackAudio(audio);
      }

      apiGet({
        uri: `/track/sample${audioQueryString}`,
        onSuccess: (data) => {
          console.log('sample info data', data);
        },
        onError: (err) => {
          console.error('Error getting sample data:', err);
        }
      });

    }
  }, [audioQueryString, sample]);

  const imageQueryString = `?${Object.entries({ reverse, trim, normalize }).map(([key, val]) => `${queryKeyMap[key as keyof typeof queryKeyMap]}=${val}`).join('&')}`;

  const TrackSettings = ({ browseCallback }:{ browseCallback:() => void, }) => {
    if (!track) return null;

    const playModes = {
      oneshot: 'One Shot',
      hold: 'Hold',
      loop: 'Loop',
      pingpong: 'Ping Pong',
    };

    const RangeOverlay = () => {
      if (!sample?.frames) return null;

      return (
        <Box p={0} m={0} bgcolor="rgba(50,200,0,.3)" position="absolute" top={0}
          height="100%" 
          left={`${(sampleStart / sample.frames) * 100}%`}
          width={`${(1 - (sampleStart / sample.frames) - (sampleEnd / sample.frames)) * 100}%`}
        />
      );
    };

    return (
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
          <input type="number" step={1} min={-36} max={36} defaultValue={transpose} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
            setTranspose(parseInt(e.target.value) || 0);
          } } />
        </Grid>

        <Grid item xs={12} md={2} lg={2}>
          <Typography fontWeight={600} pb={1} variant="caption" component="p">Pitch Shift:</Typography>
          <input type="number" step={1} min={-200} max={200} defaultValue={pitchShift} style={{ width: '3rem', height: '3rem', padding: "2px" }} onChange={(e) => {
            setPitchShift(parseInt(e.target.value) || 0);
          } } />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mx: 'auto', my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={6}>
            <Grid item xs={12} md={8} position={"relative"}>
              <RangeOverlay />

              {Boolean(sample && sample?.id)
                ? <img alt={sample?.name || ''} src={`${process.env.REACT_APP_API_URL}/sample/${sample?.id}/waveform${imageQueryString}`} style={{ height: '10rem', width: '100%' }} />
                : null}

              <PlayIcon
                onClick={() => {
                  if (sample && trackAudio) {
                    trackAudio.play();
                  }
                } }
                sx={{ position: 'absolute', bottom: '.25rem', right: '2.5rem', color: 'primary', fontSize: '2rem', cursor: 'pointer' }} />
              
              <BrowseIcon
                onClick={browseCallback}
                sx={{ position: 'absolute', bottom: '.25rem', right: '.25rem', color: 'primary', fontSize: '2rem', cursor: 'pointer' }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={600} variant="caption" component="p" pl={2} color="white">
                {sample ? `${sample.filename}` : 'No Sample Selected'}
              </Typography>

              {!sample ? <></> : 
                <Grid container spacing={1} pl={2}>
                  <Grid item xs={12}>
                    <Divider sx={{ mx: 'auto', my: 1, bgcolor: 'white' }} />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'left', paddingTop: '0 !important' }}>
                    <Typography color="white" variant="caption" fontWeight={600} component="span">Reverse</Typography>

                    <Checkbox sx={{ py: 0 }} defaultChecked={reverse} onChange={() => {
                      setReverse(!reverse);
                      if (frames) {
                        console.log('frames', frames);
                        console.log('sampleStart', sampleStart);
                        console.log('sampleEnd', sampleEnd);
                        const newStart = sampleEnd;
                        const newEnd = sampleStart;
                        setSampleEnd(newEnd);
                        setSampleStart(newStart);
                      }
                    }} />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'left', paddingTop: '0 !important' }}>
                    <Typography color="white" variant="caption" fontWeight={600} component="span">Normalize</Typography>

                    <Checkbox sx={{ py: 0 }} defaultChecked={normalize} onChange={() => {
                      setNormalize(!normalize);
                    }} />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'left', paddingTop: '0 !important' }}>
                    <Typography color="white" variant="caption" fontWeight={600} component="span">Trim</Typography>

                    <Checkbox sx={{ py: 0 }} defaultChecked={trim} onChange={() => {
                      setTrim(!trim);
                    }} />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'left' }}>
                    <FormControl>
                      <Typography color="white" variant="caption" fontWeight={600} component="span">Play Mode</Typography>  
                      <NativeSelect
                        defaultValue={playMode}
                        onChange={(e:ChangeEvent<HTMLSelectElement>) => {
                          setPlayMode(e.target.value as keyof typeof playModes);
                        }}
                        inputProps={{
                          style: {backgroundColor: 'white', paddingLeft: 8, paddingTop: 1, paddingBottom: 1, height: 22, fontSize: '.8rem'},
                          name: 'track-playMode',
                          id: 'track-playMode-native',
                        }}
                      >
                        {Object.keys(playModes).map(key => {
                          return (
                            <option value={key}>{playModes[key as keyof typeof playModes]}</option>
                          );
                        })}
                      </NativeSelect>
                    </FormControl>
  
                  </Grid>

                </Grid>
              }

            </Grid>

            <Grid item xs={12} md={8} px={0} py={1}>
              <StartSlider />
            </Grid>

            <Grid item xs={12} md={8} px={0} py={0}>
              <Box p={0} m={0} display="inline-block" width="48%" pr={"2%"}>
                <FadeInSlider />
              </Box>

              <Box p={0} m={0} display="inline-block" width="48%" pl={"2%"}>
                <FadeOutSlider />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return {
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
    startOffset: sampleStart, setSampleStart,
    endOffset: sampleEnd, setSampleEnd,
    fadeIn, setFadeIn,
    fadeOut, setFadeOut,
    TrackSettings
  };
};

export default useTrackSettings;