import { PlayArrowTwoTone } from "@mui/icons-material";
import { Box, Grid, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { Filter, Track, Step, getActiveSong } from "../redux/songSlice";
import axios from "axios";
import { useEffect, useState } from "react";

interface RenderPayload {
  title: string;
  bpm: number;
  id?: number;
  author: string;
  patternSequence: number[];
  tracks: Track[];
  patterns: {
    id?: number;
    position: number;
    name: string;
    bars: number;
    steps: {
     [trackName:string]: {
      loc: string;
      pitch: string;
      velocity: number;
      filter?: Filter;
      pan?: number;
     }[]; 
    };
  }[];
};


const ActionButtons = () => {
  const activeSong = useSelector(getActiveSong);
  const [song, setSong] = useState(activeSong);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setSong(activeSong);
  }, [activeSong]);

  const prepareRenderPayload = () => {
    // Take the songState and mutate it into RenderPayload format
    // Only include steps that are on
  
    const { title, bpm, id, author, patternSequence, tracks, patterns } = song;
  
    const renderPayload:RenderPayload = {
      title, bpm, id, author: author || '', patternSequence, tracks, patterns: [],
    };
  
    // Iterate through the patterns and build the renderPayload.patterns array
    patterns.forEach((pattern, i) => {
      const { id, position, name, bars, steps } = pattern;
  
      const renderPattern:RenderPayload['patterns'][0] = {
        id, position, name, bars, steps: {},
      };
  
      // Iterate through the steps and build the renderPattern.steps object
      steps.forEach((step:Step) => {
        // Each step will contain a reference to a track
        // We need to key the pattern.steps array by track name and include the step's loc, pitch, and velocity
        const { loc, pitch, velocity, filters, pan } = step;
  
        if (!step.on) return;
  
        console.log('step', step);

        if (!renderPattern.steps[step.track.name]) {
          renderPattern.steps[step.track.name] = [];
        }
  
        renderPattern.steps[step.track.name].push({
          loc: `${loc.bar}.${loc.beat}.${loc.tick}`,
          pitch,
          velocity,
          filter: filters ? filters[0] : undefined,
          pan,
        });
      });
  
      renderPayload.patterns.push(renderPattern);
  
    });

    return renderPayload;
  };

  const handleRender = () => {
    const payload = prepareRenderPayload();
  
    console.log('payload', payload);
  
    axios.post(`${apiUrl}/render/`, payload, { responseType: 'blob' }) // Set responseType to 'blob'
      .then(res => {
        console.log('res', res);
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'audio/mpeg' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${song.title}.mp3`);
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up
        window.URL.revokeObjectURL(url); // Release memory
      })
      .catch(error => {
        console.error('Error during render:', error);
      });
  };
  
  return (
    <Box textAlign="center" position="absolute" bottom={0} left={0} right={0} bgcolor="primary.dark" color="primary.contrastText" p={0}>
      <Grid container>
        <Grid item xs={6}>
          <Button variant="contained" color="primary" sx={{ float: 'right', my: 1, mr: 1 }}>
            <PlayArrowTwoTone sx={{ mr: 1 }} />
            Play
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Button onClick={handleRender} variant="contained" color="primary" sx={{ float: 'left', my: 1, ml: 1 }}>
            Render to MP3
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ActionButtons;