import { AxiosResponse } from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getActiveSong, Song, setSongId, Filter, PatternEntry, Step, Track } from "../redux/songSlice";
import { getActiveUser, setUserSongs } from "../redux/userSlice";
import useApi from "./useApi";

const useSong = () => {
  const user = useSelector(getActiveUser);
  const activeSong = useSelector(getActiveSong);
  const { apiCall, apiGet } = useApi();
  const dispatch = useDispatch();

  interface RenderPayload {
    title: string;
    bpm: number;
    id?: number;
    author: string;
    patternSequence: PatternEntry[];
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
        filters?: Filter[];
        pan?: number;
       }[]; 
      };
    }[];
  };
  
  
  const getUserSongs = async () => {
    await apiGet({
      uri: '/user/songs',
      onSuccess: (res) => {
        dispatch(setUserSongs(res.data));
      },
      onError: (err) => {
        console.error('Error getting user data:', err);
      }
    });
  };

  const handleSave = async () => {
    if (!user?.token || !activeSong) {
      return;
    }

    const allPatterns = activeSong.patterns;

    const patterns = allPatterns.filter((pattern) => {
      return Boolean(pattern.steps.length) || Boolean(pattern.name !== `Pattern ${pattern.position}`);
    });

    const {activePattern, loading, error, ...songData } = { ...activeSong, patterns };

    const payloadPatterns = patterns.map((pattern) => {
      const { id, position, name, bars, steps, pianoIndex } = pattern;

      const payloadPattern = {
        id, position, pianoIndex, name, bars, steps: [] as Step[],
      };

      if (!payloadPattern.pianoIndex) {
        payloadPattern.pianoIndex = {};
      }

      let trackStepCount:{ [position:string]: number } = {};

      steps.forEach((step:Step) => {
        const { loc, pitch, velocity, filters, pan, duration, reverse, track, retrigger } = step;

        if (!step.on) return;

        const position = `${track.position}`;

        if (!trackStepCount[position]) {
          trackStepCount[position] = 0;
        }

        trackStepCount[position]++;

        payloadPattern.steps.push({...{
          loc,
          pitch,
          velocity,
          filters,
          pan,
          duration,
          track,
          on: true,
          retrigger: retrigger || 0,
          reverse: reverse || false,
          index: trackStepCount[position],
        }});
      });

      return payloadPattern;
    });

    const payload = {...songData, patterns: payloadPatterns};

    await apiCall({
      uri: `/song/${songData.id ? songData.id + '/' : ''}`,
      method: songData.id ? 'put' : 'post',
      payload: payload,
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

  const handleDuplicate = async (title:string) => {
    if (!user?.token) {
      return;
    }

    const allPatterns = activeSong.patterns;

    const patterns = allPatterns.filter((pattern) => {
      return Boolean(pattern.steps.length) || Boolean(pattern.name !== `Pattern ${pattern.position}`);
    });

    const {activePattern, loading, error, id, ...songData } = { ...activeSong, patterns, title };

    await apiCall({
      uri: `/song/`,
      method: 'post',
      payload: {...songData} as Song,
      onSuccess: (res:AxiosResponse) => {
        getUserSongs();
      },
      onError: (error:any) => {
        console.error('Error during save:', error);
      },
    });
  };

  const prepareRenderPayload = () => {
    // Take the songState and mutate it into RenderPayload format
    // Only include steps that are on
  
    const { title, bpm, id: songId, author, patternSequence, tracks, patterns, swing } = activeSong;
  
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
  
        if (!renderPattern.steps[step.track.name]) {
          renderPattern.steps[step.track.name] = [];
        }
  
        renderPattern.steps[step.track.name].push({
          loc: `${loc.bar}.${loc.beat}.${loc.tick}`,
          pitch,
          velocity,
          filters,
          pan,
        });
      });
  
      renderPayload.patterns.push(renderPattern);
  
    });

    return renderPayload;
  };

  const handleRender = async (filename?:string) => {
    if (!user?.token) {
      return;
    }

    const payload = prepareRenderPayload();

    await apiCall({
      uri: '/render/',
      method: 'post',
      payload,
      config: { responseType: 'blob' }, // Set responseType to 'blob'
      onSuccess: (res:AxiosResponse) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'audio/mpeg' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `${activeSong.title}.mp3`);
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
  
  return { handleSave, handleDuplicate, handleRender, getUserSongs };
};

export default useSong;