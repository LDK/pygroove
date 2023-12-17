// src/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { active: 'light' },
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.active = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

// getContent selector function
export const getTheme = (state: RootState) => {
  return state.theme.active;
};

export default themeSlice.reducer;