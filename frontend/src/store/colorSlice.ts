import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gradientIndex: 0,
};

const colorSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    setGradientIndex: (state, action) => {
      state.gradientIndex = action.payload;
    },
  },
});

export const { setGradientIndex } = colorSlice.actions;

export default colorSlice.reducer;