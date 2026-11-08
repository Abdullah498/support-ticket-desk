import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { TicketPriority, TicketStatus } from '../../types';

export interface TicketFilters {
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  assignee: string | 'all';
  search: string;
}
const DEFAULT_FILTERS: TicketFilters = { status: 'all', priority: 'all', assignee: 'all', search: '' };

function readFilters(): TicketFilters {
  try {
    const raw = localStorage.getItem('support-ticket-filters');
    if (!raw) return DEFAULT_FILTERS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_FILTERS;
    const value = parsed as Record<string, unknown>;
    const statuses = ['all', 'open', 'in_progress', 'resolved'];
    const priorities = ['all', 'low', 'medium', 'high', 'urgent'];
    return {
      status: statuses.includes(String(value.status)) ? value.status as TicketFilters['status'] : 'all',
      priority: priorities.includes(String(value.priority)) ? value.priority as TicketFilters['priority'] : 'all',
      assignee: typeof value.assignee === 'string' ? value.assignee : 'all',
      search: typeof value.search === 'string' ? value.search : '',
    };
  } catch { return DEFAULT_FILTERS; }
}
const filtersSlice = createSlice({
  name: 'filters',
  initialState: readFilters(),
  reducers: {
    setStatus(state, action: PayloadAction<TicketFilters['status']>) { state.status = action.payload; },
    setPriority(state, action: PayloadAction<TicketFilters['priority']>) { state.priority = action.payload; },
    setAssignee(state, action: PayloadAction<string>) { state.assignee = action.payload; },
    setSearch(state, action: PayloadAction<string>) { state.search = action.payload; },
    resetFilters() { return DEFAULT_FILTERS; },
  },
});
export const { setStatus, setPriority, setAssignee, setSearch, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

export const selectFilters = (state: RootState): TicketFilters => state.filters;
export const selectStatusFilter = createSelector([selectFilters], (filters) => filters.status);
