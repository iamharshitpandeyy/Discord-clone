import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  roomId: null,
  channelId: null,
  voiceChannelId: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    enterServer: (state, action) => {
      state.serverId = action.payload.serverId;
    },
    enterChannel: (state, action) => {
      state.channelId = action.payload.channelId;
    },
    enterVoiceChannel: (state, action) => {
      state.voiceChannelId = action.payload.voiceChannelId;
    },
  },
});

export const { enterServer } = appSlice.actions;
export const { enterChannel } = appSlice.actions;
export const { enterVoiceChannel } = appSlice.actions;
export const selectServerId = (state) => state.app.serverId;
export const selectedChannelId = (state) => state.app.channelId;
export const selectedVoiceChannelId = (state) => state.app.voiceChannelId;
export default appSlice.reducer;
