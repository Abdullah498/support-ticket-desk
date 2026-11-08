import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '../../app/store';
import type { NewTicket, Ticket, TicketPatch, TicketPriority, TicketStatus } from '../../types';
import { createTicket as apiCreateTicket, deleteTicket as apiDeleteTicket, fetchAgents, fetchTickets, updateTicket as apiUpdateTicket } from '../../api/mockApi';
import { setAgents } from '../agents/agentsSlice';
import { selectFilters } from '../filters/filtersSlice';

type LoadStatus = 'idle' | 'loading' | 'failed' | 'succeeded';
const ticketsAdapter = createEntityAdapter<Ticket>();
interface TicketsExtraState {
  loadStatus: LoadStatus;
  error: string | null;
  optimisticSnapshots: Record<string, Ticket | undefined>;
  mutationError: string | null;
  creating: boolean;
  deletingIds: string[];
}
const initialState = ticketsAdapter.getInitialState<TicketsExtraState>({
  loadStatus: 'idle', error: null, optimisticSnapshots: {}, mutationError: null, creating: false, deletingIds: [],
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export const loadInitialData = createAsyncThunk<
  { tickets: Ticket[]; agents: Awaited<ReturnType<typeof fetchAgents>> },
  void,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('tickets/loadInitialData', async (_, { dispatch, rejectWithValue }) => {
  try {
    const [tickets, agents] = await Promise.all([fetchTickets(), fetchAgents()]);
    dispatch(setAgents(agents));
    return { tickets, agents };
  } catch (error) { return rejectWithValue(errorMessage(error)); }
}, {
  condition: (_, { getState }) => getState().tickets.loadStatus !== 'loading',
});

export const createTicketThunk = createAsyncThunk<Ticket, NewTicket, { rejectValue: string }>(
  'tickets/create', async (input, { rejectWithValue }) => {
    try { return await apiCreateTicket(input); } catch (error) { return rejectWithValue(errorMessage(error)); }
  },
);
export const updateTicketThunk = createAsyncThunk<Ticket, { id: string; patch: TicketPatch }, { state: RootState; rejectValue: string }>(
  'tickets/update', async ({ id, patch }, { rejectWithValue }) => {
    try { return await apiUpdateTicket(id, patch); } catch (error) { return rejectWithValue(errorMessage(error)); }
  },
);
export const deleteTicketThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'tickets/delete', async (id, { rejectWithValue }) => {
    try { await apiDeleteTicket(id); return id; } catch (error) { return rejectWithValue(errorMessage(error)); }
  },
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearMutationError(state) { state.mutationError = null; },
    setMutationError(state, action: PayloadAction<string>) { state.mutationError = action.payload; },
  },
  extraReducers(builder) {
    builder
      .addCase(loadInitialData.pending, (state) => { state.loadStatus = 'loading'; state.error = null; })
      .addCase(loadInitialData.fulfilled, (state, action) => {
        ticketsAdapter.setAll(state, action.payload.tickets);
        state.loadStatus = 'succeeded';
        state.error = null;
      })
      .addCase(loadInitialData.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.loadStatus = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Unable to load data.';
      })
      .addCase(createTicketThunk.pending, (state) => { state.creating = true; state.mutationError = null; })
      .addCase(createTicketThunk.fulfilled, (state, action) => { state.creating = false; ticketsAdapter.addOne(state, action.payload); })
      .addCase(createTicketThunk.rejected, (state, action) => { state.creating = false; state.mutationError = action.payload ?? 'Could not create ticket.'; })
      .addCase(updateTicketThunk.pending, (state, action) => {
        const { id, patch } = action.meta.arg;
        const current = state.entities[id];
        if (current) {
          state.optimisticSnapshots[id] = { ...current };
          ticketsAdapter.updateOne(state, { id, changes: patch });
        }
        state.mutationError = null;
      })
      .addCase(updateTicketThunk.fulfilled, (state, action) => {
        ticketsAdapter.setOne(state, action.payload);
        delete state.optimisticSnapshots[action.meta.arg.id];
      })
      .addCase(updateTicketThunk.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const previous = state.optimisticSnapshots[id];
        if (previous) ticketsAdapter.setOne(state, previous);
        delete state.optimisticSnapshots[id];
        state.mutationError = action.payload ?? 'Update failed. The previous values were restored.';
      })
      .addCase(deleteTicketThunk.pending, (state, action) => { state.deletingIds.push(action.meta.arg); state.mutationError = null; })
      .addCase(deleteTicketThunk.fulfilled, (state, action) => {
        ticketsAdapter.removeOne(state, action.payload);
        state.deletingIds = state.deletingIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteTicketThunk.rejected, (state, action) => {
        state.deletingIds = state.deletingIds.filter((id) => id !== action.meta.arg);
        state.mutationError = action.payload ?? 'Could not delete ticket.';
      });
  },
});
export const { clearMutationError, setMutationError } = ticketsSlice.actions;
export default ticketsSlice.reducer;

const adapterSelectors = ticketsAdapter.getSelectors<RootState>((state) => state.tickets);
export const selectAllTickets = adapterSelectors.selectAll;
export const selectTicketEntities = adapterSelectors.selectEntities;
export const selectTicketById = adapterSelectors.selectById;

export const selectFilteredTickets = createSelector(
  [selectAllTickets, selectFilters],
  (tickets, filters) => {
    const query = filters.search.trim().toLocaleLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
      const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
      const matchesAssignee = filters.assignee === 'all' || ticket.assigneeId === filters.assignee;
      const matchesSearch = !query || ticket.title.toLocaleLowerCase().includes(query) || ticket.description.toLocaleLowerCase().includes(query);
      return matchesStatus && matchesPriority && matchesAssignee && matchesSearch;
    });
  },
);

export const selectStatusCounts = createSelector([selectAllTickets], (tickets) => {
  const counts: Record<TicketStatus, number> = { open: 0, in_progress: 0, resolved: 0 };
  for (const ticket of tickets) counts[ticket.status] += 1;
  return counts;
});
export const selectIsCreating = (state: RootState): boolean => state.tickets.creating;
export const selectMutationError = (state: RootState): string | null => state.tickets.mutationError;
export const selectDeletingIds = (state: RootState): string[] => state.tickets.deletingIds;
export type { TicketPriority };
