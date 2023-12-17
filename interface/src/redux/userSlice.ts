// src/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export type AppUser = {
  id: number | null;
  username: string | null;
  email: string | null;
};

export type UserState = AppUser & {
  token: string | null;
};

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.token = action.payload.token;
      if (action.payload.email) {
        state.email = action.payload.email;
      }
    },
    clearUser: (state) => {
      state.id = null;
      state.username = null;
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

// getUser selector function
export const getActiveUser = (state: RootState) => {
  return state.user;
};

export default userSlice.reducer;