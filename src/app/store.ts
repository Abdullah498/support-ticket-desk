import { configureStore } from '@reduxjs/toolkit';
import ticketsReducer from '../features/tickets/ticketsSlice';
import agentsReducer from '../features/agents/agentsSlice';
import filtersReducer from '../features/filters/filtersSlice';

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    agents: agentsReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
