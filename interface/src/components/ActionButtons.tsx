import { PlayArrowTwoTone } from "@mui/icons-material";
import { Box, Grid, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Filter, Track, Step, getActiveSong, setSongId } from "../redux/songSlice";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { Song } from "../redux/songSlice";
import { ApiCallProps } from "../hooks/useApi";
import { UserState } from "../redux/userSlice";

interface RenderPayload {
  title: string;
  bpm: number;
  id?: number;
  author: string;
  patternSequence: number[];
  tracks: Track[];
  swing?: number;
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

interface ActionButtonsProps {
  user: UserState;
  apiCall: (props:ApiCallProps) => Promise<any>;
}

const ActionButtons = ({ user, apiCall }:ActionButtonsProps) => {
  const activeSong = useSelector(getActiveSong);
  const [song, setSong] = useState(activeSong);

  useEffect(() => {
    setSong(activeSong);
  }, [activeSong]);

  const dispatch = useDispatch();

  const prepareRenderPayload = () => {
    // Take the songState and mutate it into RenderPayload format
    // Only include steps that are on
  
    const { title, bpm, id: songId, author, patternSequence, tracks, patterns, swing } = song;
  
    const renderPayload:RenderPayload = {
      title, bpm, swing, id: songId, author: author || '', patternSequence, tracks, patterns: [],
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

  const handleSave = async () => {
    if (!user?.token) {
      return;
    }
    const {activePattern: ap, loading: songLoading, error: songError, ...songData } = { ...song };

    await apiCall({
      uri: `/song/${songData.id ? songData.id + '/' : ''}`,
      method: songData.id ? 'put' : 'post',
      payload: {...songData} as Song,
      onSuccess: (res:AxiosResponse) => {
        if (res.data?.id) {
          dispatch(setSongId(res.data.id));
        }
      },
      onError: (error:any) => {
        console.error('Error during save:', error);
      },
    });
  };

  const handleRender = async () => {
    if (!user?.token) {
      return;
    }

    const payload = prepareRenderPayload();

    await apiCall({
      uri: '/render/',
      method: 'post',
      payload,
      onSuccess: (res:AxiosResponse) => {
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
      },
      onError: (error:any) => {
        console.error('Error during render:', error);
      },
    });
  };
  
  return (
    <Box textAlign="center" position="absolute" bottom={0} zIndex={2} left={0} right={0} bgcolor="primary.dark" color="primary.contrastText" p={0}>
      <Grid container>
        <Grid item xs={4}>
          <Button variant="contained" color="primary" sx={{ float: 'right', my: 1, mr: 1 }}>
            <PlayArrowTwoTone sx={{ mr: 1 }} />
            Play
          </Button>
        </Grid>

        <Grid item xs={4}>
          <Button onClick={handleRender} variant="contained" color="primary" sx={{ float: 'left', my: 1, ml: 1 }}>
            Render to MP3
          </Button>
        </Grid>

        { Boolean(user?.token) &&
          <Grid item xs={4}>
            <Button onClick={handleSave} variant="contained" color="primary" sx={{ float: 'right', my: 1, mr: 1 }}>
              Save Song
            </Button>
          </Grid>
        }
      </Grid>
      
    </Box>
  );
}

export default ActionButtons;