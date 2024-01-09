// src/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Root } from 'react-dom/client';

export type Filter = {
  filter_type: string;
  frequency: number;
  q: number;
  on: boolean;
  position: number;
};

export type Loc = {
  bar: number;
  beat: number;
  tick: number;
};

export type SampleData = {
  display?: string;
  name?: string;
  filename: string;
  url?: string;
  waveform?: string;
  id?: number;
};

export type Track = {
  name: string;
  sample?: SampleData;
  volume: number;
  pan: number;
  disabled: boolean;
  transpose: number;
  filters?: Filter[];
  position: number;
  rootPitch?: string;
  pitchShift?: number;
  reverse?: boolean;
  normalize?: boolean;
  trim?: boolean;
};

export type Step = {
  on: boolean;
  velocity: number;
  pan?: number;
  filters?: Filter[];
  pitch: string;
  loc: Loc;
  track: Track;
};

export type Pattern = {
  name: string;
  steps: Step[];
  bars: number;
  position: number;
  id?: number;
};

export interface Song {
  title: string;
  author?: string;
  tracks: Track[];
  patterns: Pattern[];
  bpm: number;
  swing: number
  patternSequence: number[];
  id?: number;
};

export interface SongState extends Song {
  loading?: boolean;
  error?: string;
  activePattern?: Pattern;
};

export const simpleTrack = ({ song, name: trackName, sample }:{ song: SongState, name:string, sample:SampleData }) => {
  return {
    name: trackName,
    steps: [],
    volume: -6,
    pan: 0,
    disabled: false,
    transpose: 0,
    sample: sample,
    position: song.tracks.length + 1,
  } as Track
};

export const simplePattern = (position: number) => {
  return {
    name: `Pattern ${position}`,
    steps: [],
    bars: 2,
    position: position,
  } as Pattern;
}

const initPatterns = Array(64).fill(0).map((_, i) => simplePattern(i + 1));

const initialState:SongState = {
  title: 'New Song',
  patterns: initPatterns,
  bpm: 120,
  swing: 0,
  patternSequence: [1],
  activePattern: initPatterns[0],
  tracks: [],
};

initialState.tracks.push(simpleTrack({ song: initialState, name: 'Kick', sample: {
  id: 1,
  filename: '808-Kick1.wav',
  display: '808 Kick 1',
  name: '808 Kick 1',
} }));
initialState.tracks.push(simpleTrack({ song: initialState, name: 'Snare', sample: {
  id: 2,
  filename: '808-Snare1.wav',
  display: '808 Snare 1',
  name: '808 Snare 1',
} }));
initialState.tracks.push(simpleTrack({ song: initialState, name: 'Closed Hat', sample: {
  id: 4,
  filename: '808-ClosedHat1.wav',
  display: '808 Closed Hat 1',
  name: '808 Closed Hat 1',
} }));
initialState.tracks.push(simpleTrack({ song: initialState, name: 'Open Hat', sample: {
  id: 3,
  filename: '808-OpenHat1.wav',
  display: '808 Open Hat 1',
  name: '808 Open Hat 1',
} }));

console.log(initialState);

const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    clearSong: (state) => {
      Object.assign(state, initialState);
    },
    toggleTrack: (state, action: PayloadAction<number>) => {
      const track = state.tracks.find((trk) => trk.position === action.payload);
      if (!track) return;
      track.disabled = !track.disabled;
    },
    setSong: (state, action: PayloadAction<Song>) => {
      state = action.payload;
    },
    setStep: (state, action: PayloadAction<Step>) => {
      const { loc, track } = action.payload;

      console.log('setStep', action.payload);

      if (!track) return;

      const step = state.activePattern?.steps.find((step) => {
        return step.loc.bar === loc.bar && step.loc.beat === loc.beat && step.loc.tick === loc.tick && step.track.position === track.position;
      });

      const pattern = state.activePattern;

      console.log('setStep pattern', pattern);

      if (!pattern) return;

      if (step) {
        step.on = (action.payload.on || action.payload.on === false ? action.payload.on : step.on) || false;
        step.velocity = (action.payload.velocity || action.payload.velocity === 0 ? action.payload.velocity : (step.velocity || step.velocity === 0 ? step.velocity : 100));
        step.pan = (action.payload.pan || action.payload.pan === 0 ? action.payload.pan : step.pan || 0);
        step.pitch = action.payload.pitch || step.pitch || 'C3';
        step.filters = action.payload.filters || step.filters || [];

        const stepIndex = pattern?.steps.findIndex((stp) => stp.loc === step.loc && stp.track.position === track.position);
        pattern?.steps.splice(stepIndex!, 1, step);
      } else {
        pattern?.steps.push({
          on: action.payload.on || false,
          velocity: action.payload.velocity || 100,
          pitch: action.payload.pitch || 'C3',
          pan: action.payload.pan || 0,
          filters: action.payload.filters || [],
          loc: loc,
          track: track,
        });
      }

      console.log('state patterns', state.patterns);
      console.log('pattern steps', pattern.steps);

      let rootPattern = state.patterns.find((ptrn) => ptrn.position === pattern.position);

      if (!rootPattern) return;

      rootPattern = { ...rootPattern, steps: pattern.steps };
      state.patterns.splice(patternIndex(state, pattern), 1, rootPattern);
    },
    setSongId: (state, action: PayloadAction<number>) => {
      state.id = action.payload;
    },
    setSongTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setAuthor: (state, action: PayloadAction<string>) => {
      state.author = action.payload;
    },
    setBpm: (state, action: PayloadAction<number>) => {
      state.bpm = action.payload;
    },
    setSwing: (state, action: PayloadAction<number>) => {
      state.swing = action.payload;
    },
    setPatternSequence: (state, action: PayloadAction<number[]>) => {
      state.patternSequence = action.payload;
    },
    addPattern: (state, action: PayloadAction<Pattern>) => {
      state.patterns.push(action.payload);
    },
    addTrack: (state, action: PayloadAction<Track>) => {
      state.tracks.push(action.payload);
    },
    removeTrack: (state, action: PayloadAction<number>) => {
      state.tracks.splice(action.payload, 1);
    },
    renamePattern: (state, action: PayloadAction<{ position: number, name: string }>) => {
      const patternIndex = state.patterns.findIndex((ptrn) => ptrn.position === action.payload.position);
      if (patternIndex === undefined) return;
      state.patterns[patternIndex].name = action.payload.name;
    },
    renameTrack: (state, action: PayloadAction<{index: number, name: string}>) => {
      state.tracks[action.payload.index].name = action.payload.name;
    },
    clearPattern: (state, action: PayloadAction<number>) => {
      const pattern = state.patterns.find((ptrn) => ptrn.position === action.payload);
      const patternIndex = state.patterns.findIndex((ptrn) => ptrn.position === action.payload);
      if (!pattern || patternIndex === undefined) return;

      const init = simplePattern(pattern.position);

      pattern.name = init.name;
      pattern.steps = [];
      pattern.bars = init.bars;

      state.activePattern = pattern;

      state.patterns.splice(patternIndex, 1, pattern);
    },
    copyPattern: (state, action: PayloadAction<{from: number, to: number}>) => {
      const fromIndex = state.patterns.findIndex((ptrn) => ptrn.position === action.payload.from);
      const toIndex = state.patterns.findIndex((ptrn) => ptrn.position === action.payload.to);
      const fromPattern = state.patterns[fromIndex];
      const toPattern = state.patterns[toIndex];

      if (!fromPattern || !toPattern) return;
      if (fromIndex === toIndex) return;

      if ((fromPattern.name !== toPattern.name) && (fromPattern.name !== `Pattern ${fromPattern.position}`)) {
        toPattern.name = fromPattern.name;
      }

      toPattern.steps = fromPattern.steps;
      toPattern.bars = fromPattern.bars;

      state.patterns.splice(toIndex, 1, toPattern);
    },
    duplicateTrack: (state, action: PayloadAction<number>) => {
      const track = state.tracks[action.payload];
      state.tracks.push({ ...track, name: `${track.name} (copy)` });
    },
    setTrackVolume: (state, action: PayloadAction<{position: number, value: number}>) => {
      const track = state.tracks.find((track) => track.position === action.payload.position);
      console.log('setTrackVolume', track, action.payload);
      if (!track) return;

      track.volume = action.payload.value;
    },
    setTrackSample: (state, action: PayloadAction<{position: number, sample: SampleData}>) => {
      console.log('setTrackSample', action.payload);
      const track = state.tracks.find((track) => track.position === action.payload.position);
      if (!track) return;
      track.sample = action.payload.sample;
    },
    setTrackPan: (state, action: PayloadAction<{position: number, value: number}>) => {
      const track = state.tracks.find((track) => track.position === action.payload.position);
      if (!track) return;
      track.pan = action.payload.value;
    },
    toggleStep: (state, action: PayloadAction<{loc: Loc, track: Track}>) => {
      const { loc, track } = action.payload;

      const step = state.activePattern?.steps.find((step) => {
        return step.loc.bar === loc.bar && step.loc.beat === loc.beat && step.loc.tick === loc.tick && step.track.position === track.position;
      });

      const pattern = state.activePattern;

      if (!pattern) return;

      if (step) {
        step.on = !step.on;
        const stepIndex = pattern?.steps.findIndex((stp) => stp.loc === step.loc && stp.track.position === track.position);
        pattern?.steps.splice(stepIndex!, 1, step);
      } else {
        pattern?.steps.push({
          on: true,
          velocity: 100,
          pitch: 'C3',
          loc: loc,
          track: track,
        });
      }

      let rootPattern = state.patterns.find((ptrn) => ptrn.position === pattern.position);

      console.log('toggleStep pattern', pattern);
      console.log('toggleStep state patterns', state.patterns);
      console.log('toggleStep rootPattern', rootPattern);
      console.log('PATTERN INDEX', patternIndex(state, pattern));

      if (!rootPattern) return;

      rootPattern = { ...rootPattern, steps: pattern.steps };

      console.log('updated pattern', rootPattern);

      state.patterns.splice(patternIndex(state, pattern), 1, rootPattern);
    },
    setActivePattern: (state, action: PayloadAction<number>) => {
      console.log('setActivePattern', action.payload, state);
      console.log('song patterns', state.patterns);
      const pattern = state.patterns.find((ptrn) => ptrn.position === action.payload);
      console.log('setting ActivePattern', pattern?.position, pattern);
      if (!pattern) return;
      state.activePattern = pattern;
    },
    updateTrack: (state, action: PayloadAction<Track>) => {
      const track = state.tracks.find((trk) => trk.position === action.payload.position);
      if (!track) return;
      Object.assign(track, action.payload);
    }
  },
});

export const {
  clearSong,
  setSong,
  setSwing,
  setPatternSequence,
  addPattern,
  addTrack,
  removeTrack,
  renamePattern,
  renameTrack,
  copyPattern,
  duplicateTrack,
  clearPattern,
  setActivePattern,
  toggleStep,
  setTrackVolume,
  setTrackPan,
  setTrackSample,
  setSongTitle,
  setAuthor,
  setBpm,
  setSongId,
  setStep,
  updateTrack,
  toggleTrack
} = songSlice.actions;

// getActiveSong selector function
export const getActiveSong = (state: RootState) => {
  return state.song;
};

// getActivePattern selector function
export const getActivePattern = (state: RootState) => {
  return state.song.activePattern;
}

export const firstEmptyPattern = (state: RootState):number => {
  const pattern = state.song.patterns.find((ptrn) => ptrn.steps.length === 0);
  return pattern?.position || 0;
}

export const trackIndex = (state: RootState, track: Track) => {
  return state.song.tracks.findIndex((trk) => trk === track);
}

export const patternIndex = (state: SongState, pattern: Pattern) => {
  return state.patterns.findIndex((ptrn) => ptrn.position === pattern.position);
}

export const findPatternStepByBeat = (pattern: Pattern, bar: number, beat: number, track: Track) => {
  const step = pattern.steps.find((step) => {
    return step.loc.bar === bar && step.loc.beat === beat && step.track.position === track.position;
  });
  return step;
}

export const findTrackByPosition = (state: SongState, position: number) => {
  const track = state.tracks.find((track) => {
    return track.position === position;
  });
  return track;
}

export const getTrackSteps = (pattern: Pattern, track: Track) => {
  const steps = pattern.steps.filter((step) => {
    return step.track.position === track.position;
  });
  return steps;
};

export default songSlice.reducer;