// src/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export type Filter = {
  type: string;
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

export type Track = {
  name: string;
  sample?: string;
  volume: number;
  pan: number;
  disabled: boolean;
  transpose: number;
  filters?: Filter[];
  position: number;
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

export type Song = {
  title: string;
  author?: string;
  tracks: Track[];
  patterns: Pattern[];
  bpm: number;
  swing: number
  patternSequence: number[];
  id?: number;
};

export type SongState = Song & {
  loading?: boolean;
  error?: string;
  activePattern?: Pattern;
};

export const simpleTrack = ({ song, name: trackName, sample }:{ song: SongState, name:string, sample:string }) => {
  return {
    name: trackName,
    steps: [],
    volume: -6,
    pan: 0,
    disabled: false,
    transpose: 0,
    sample,
    position: song.tracks.length + 1,
  } as Track
};

const initPattern = {
  name: 'Pattern 1',
  steps: [],
  bars: 2,
  position: 1,
};

const initialState:SongState = {
  title: 'New Song',
  patterns: [initPattern],
  bpm: 120,
  swing: 0,
  patternSequence: [1],
  activePattern: initPattern,
  tracks: [],
};

initialState.tracks.push(simpleTrack({ song: initialState, name: 'Kick', sample: '808-Kick1.wav' }));
initialState.tracks.push(simpleTrack({ song: initialState, name: 'Snare', sample: '808-Snare1.wav' }));
initialState.tracks.push(simpleTrack({ song: initialState, name: 'Closed Hat', sample: '808-ClosedHat1.wav' }));
initialState.tracks.push(simpleTrack({ song: initialState, name: 'Open Hat', sample: '808-OpenHat1.wav' }));

console.log(initialState);

const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    clearSong: (state) => {
      Object.assign(state, initialState);
    },
    setSong: (state, action: PayloadAction<Song>) => {
      state = action.payload;
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
    removePattern: (state, action: PayloadAction<number>) => {
      state.patterns.splice(action.payload, 1);
    },
    renamePattern: (state, action: PayloadAction<{index: number, name: string}>) => {
      state.patterns[action.payload.index].name = action.payload.name;
    },
    renameTrack: (state, action: PayloadAction<{index: number, name: string}>) => {
      state.tracks[action.payload.index].name = action.payload.name;
    },
    duplicatePattern: (state, action: PayloadAction<number>) => {
      const pattern = state.patterns[action.payload];
      state.patterns.push({ ...pattern, name: `${pattern.name} (copy)` });
    },
    duplicateTrack: (state, action: PayloadAction<number>) => {
      const track = state.tracks[action.payload];
      state.tracks.push({ ...track, name: `${track.name} (copy)` });
    },
    setTrackVolume: (state, action: PayloadAction<{position: number, volume: number}>) => {
      const track = state.tracks.find((track) => track.position === action.payload.position);
      if (!track) return;
      track.volume = action.payload.volume;
    },
    setTrackPan: (state, action: PayloadAction<{position: number, pan: number}>) => {
      const track = state.tracks.find((track) => track.position === action.payload.position);
      if (!track) return;
      track.pan = action.payload.pan;
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

      if (!rootPattern) return;

      rootPattern = { ...rootPattern, steps: pattern.steps };
      state.patterns.splice(patternIndex(state, pattern), 1, rootPattern);
    },
    setActivePattern: (state, action: PayloadAction<Pattern>) => {
      state.activePattern = action.payload;
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
  removePattern,
  renamePattern,
  renameTrack,
  duplicatePattern,
  duplicateTrack,
  setActivePattern,
  toggleStep,
  setTrackVolume,
  setTrackPan,
  setSongTitle,
  setAuthor,
  setBpm
} = songSlice.actions;

// getActiveSong selector function
export const getActiveSong = (state: RootState) => {
  return state.song;
};

// getActivePattern selector function
export const getActivePattern = (state: RootState) => {
  return state.song.activePattern;
}

export const trackIndex = (state: RootState, track: Track) => {
  return state.song.tracks.findIndex((trk) => trk === track);
}

export const patternIndex = (state: SongState, pattern: Pattern) => {
  return state.patterns.findIndex((ptrn) => ptrn === pattern);
}

export const findPatternStepByBeat = (pattern: Pattern, bar: number, beat: number, track: Track) => {
  const step = pattern.steps.find((step) => {
    return step.loc.bar === bar && step.loc.beat === beat && step.track.position === track.position;
  });
  return step;
}

export const getTrackSteps = (pattern: Pattern, track: Track) => {
  const steps = pattern.steps.filter((step) => {
    return step.track.position === track.position;
  });
  return steps;
};

export default songSlice.reducer;