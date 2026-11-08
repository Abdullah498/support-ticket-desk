import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Agent } from '../../types';

interface AgentsState { items: Agent[]; }
const initialState: AgentsState = { items: [] };

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents(state, action: PayloadAction<Agent[]>) { state.items = action.payload; },
  },
});
export const { setAgents } = agentsSlice.actions;
export default agentsSlice.reducer;
