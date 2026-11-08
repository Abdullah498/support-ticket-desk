import { describe, expect, it } from 'vitest';
import { selectFilteredTickets } from './ticketsSlice';
import type { RootState } from '../../app/store';
import type { Ticket } from '../../types';

const ticket: Ticket = {
  id: 't1', title: 'Cannot log in', description: 'Password reset token invalid',
  status: 'open', priority: 'urgent', assigneeId: 'a2', createdAt: '2026-10-01T00:00:00Z',
};

describe('selectFilteredTickets', () => {
  it('filters by status, priority, assignee and text', () => {
    const state = {
      tickets: { ids: ['t1'], entities: { t1: ticket }, loadStatus: 'succeeded', error: null, optimisticSnapshots: {}, mutationError: null, creating: false, deletingIds: [] },
      agents: { items: [] },
      filters: { status: 'open', priority: 'urgent', assignee: 'a2', search: 'TOKEN' },
    } as RootState;
    expect(selectFilteredTickets(state)).toEqual([ticket]);
    const noMatch = { ...state, filters: { ...state.filters, search: 'billing' } };
    expect(selectFilteredTickets(noMatch)).toEqual([]);
  });
});
