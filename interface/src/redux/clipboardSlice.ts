// src/clipboardSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { AppUser } from './userSlice';
import { Step, Track } from './songSlice';

export type Clipboard = {
  pianoRoll: Step[];
  stepSequencer: Step[];
  stepSequenceIsPiano: boolean;
};

const initialState: Clipboard = {
  pianoRoll: [],
  stepSequencer: [],
  stepSequenceIsPiano: false,
};

const clipboardSlice = createSlice({
  name: 'clipboard',
  initialState,
  reducers: {
    copyPiano(state, action: PayloadAction<Step[]>) {
      state.pianoRoll = action.payload;
    },
    copyStepSequencer(state, action: PayloadAction<{ steps: Step[], isPiano?: boolean }>) {
      state.stepSequencer = action.payload.steps;
      state.stepSequenceIsPiano = action.payload.isPiano || false;
    },
    clearPianoClipboard(state) {
      state.pianoRoll = [];
    },
    clearStepSequencerClipboard(state) {
      state.stepSequencer = [];
    },
  },
});

export const { copyPiano, copyStepSequencer } = clipboardSlice.actions;

export const getPianoRollClipboard = (state: RootState) => state.clipboard.pianoRoll;
export const getStepSequencerClipboard = (state: RootState) => {
  return {
    steps: state.clipboard.stepSequencer,
    isPiano: state.clipboard.stepSequenceIsPiano,
  }
};

export default clipboardSlice.reducer;