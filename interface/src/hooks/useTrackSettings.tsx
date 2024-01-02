import { Grid, Typography, Select, Divider, Checkbox } from "@mui/material";
import { FolderTwoTone as BrowseIcon } from "@mui/icons-material";
import { Track } from "../redux/songSlice";
import useControls from "./useControls";
import { useState } from "react";

const useTrackSettings = ({track}:{track?: Track}) => {
  const { VolumeSlider, PanSlider } = useControls();
  const [volume, setVolume] = useState(track?.volume || -6);
  const [pan, setPan] = useState(track?.pan || 0);
  const [rootNote, setRootNote] = useState(track?.rootPitch?.replace(/\d/g, '') || 'C');
  const [rootOctave, setRootOctave] = useState(track?.rootPitch?.replace(/\D/g, '') || 3);
  const [pitchShift, setPitchShift] = useState(track?.pitchShift || 0);
  const [transpose, setTranspose] = useState(track?.transpose || 0);
  const [sample, setSample] = useState(track?.sample || null);

  // Track Sample controls
  const [reverse, setReverse] = useState(track?.disabled || false);
  const [trim, setTrim] = useState(track?.disabled || false);
  const [normalize, setNormalize] = useState(track?.disabled || false);
  
  const queryString = `?${Object.entries({ reverse, trim, normalize }).map(([key, val]) => `${key}=${val}`).join('&')}`;

  const TrackSettings = ({ browseCallback }:{ browseCallback:() => void }) => {
    if (!track) return null;

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
                ? <img alt={sample?.name || ''} src={`${process.env.REACT_APP_API_URL}/sample/${sample?.id}/waveform${queryString}`} style={{ height: '10rem', width: '100%' }} />
                : null}
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
                  <Grid item xs={12} sx={{ textAlign: 'left' }}>
                    <Typography color="white" variant="caption" fontWeight={600} component="span">Reverse</Typography>

                    <Checkbox sx={{ py: 0 }} defaultChecked={reverse} onChange={() => {
                      setReverse(!reverse);
                    }} />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'left' }}>
                    <Typography color="white" variant="caption" fontWeight={600} component="span">Normalize</Typography>

                    <Checkbox sx={{ py: 0 }} defaultChecked={normalize} onChange={() => {
                      setNormalize(!normalize);
                    }} />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'left' }}>
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
    TrackSettings
  };
};

export default useTrackSettings;