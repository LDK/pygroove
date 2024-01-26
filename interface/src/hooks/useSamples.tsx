import { useState } from "react";
import { SampleData } from "../redux/songSlice";
import useApi from "./useApi";
import { arraysEqual } from "../StepSequencer";
import { Grid, Typography, Button, Divider } from "@mui/material";
import { HeadphonesTwoTone as PlayIcon } from "@mui/icons-material";

const useSamples = () => {

  const [samples, setSamples] = useState<SampleData[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  const { apiGet } = useApi();

  const fetchSamples = async () => {
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
  };

  const playSample = (sample:SampleData) => {
    if (sample.filename) {
      const url = `${process.env.REACT_APP_API_URL}/static/${sample.filename}`.replace('/api/static', '/static');
      const audio = new Audio(url);
      audio.play();
    }
  };

  const SampleBrowser = ({ openCallback }:{ openCallback: (sample:SampleData) => void }) => (
    <Grid container spacing={0}>
      <Grid item xs={12} sx={{ height: '314px' }}>
        <Typography fontWeight={600} variant="body1" component="p">Samples:</Typography>

        <Grid container spacing={0} bgcolor="primary.dark" px={1} pt={2} pb={1} sx={{ maxHeight: '290px', overflowY: 'scroll' }}>
          {samples.map((sample) => {
            return (
              <Grid item xs={12} key={`sample-${sample.filename}`} mb={2}>
                <Grid container spacing={0}>
                  <Grid item xs={3}>
                    <Typography fontWeight={600} color="white" variant="body2" component="p">{sample.display || sample.name || sample.filename}</Typography>
                    <Button variant="contained" onClick={() => {
                      openCallback(sample);
                    }}>
                      Open
                    </Button>

                    <Button>
                      <PlayIcon sx={{ color: 'gold' }} onClick={() => playSample(sample) } />
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
  );
  

  return {
    samples, setSamples, fetchSamples,
    samplesLoading, setSamplesLoading,
    SampleBrowser
  };

};

export default useSamples;