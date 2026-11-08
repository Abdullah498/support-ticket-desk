import { describe, expect, it } from 'vitest';
import reducer, { updateTicketThunk } from './ticketsSlice';
import type { Ticket } from '../../types';

const ticket: Ticket = {
  id: 't1', title: 'Test ticket', description: 'Description', status: 'open',
  priority: 'high', assigneeId: null, createdAt: '2026-10-01T00:00:00Z',
};

describe('tickets reducer', () => {
  it('stores tickets after a successful initial load', async () => {
    const action = { type: 'tickets/loadInitialData/fulfilled', payload: { tickets: [ticket], agents: [] } };
    const state = reducer(undefined, action);
    expect(state.entities.t1).toEqual(ticket);
    expect(state.loadStatus).toBe('succeeded');
  });

  it('optimistically updates a ticket and restores it on rejection', () => {
    const loaded = reducer(undefined, { type: 'tickets/loadInitialData/fulfilled', payload: { tickets: [ticket], agents: [] } });
    const pending = reducer(loaded, updateTicketThunk.pending('request-1', { id: 't1', patch: { status: 'resolved' } }));
    expect(pending.entities.t1?.status).toBe('resolved');
    const rolledBack = reducer(pending, updateTicketThunk.rejected(null, 'request-1', { id: 't1', patch: { status: 'resolved' } }, 'Network error'));
    expect(rolledBack.entities.t1).toEqual(ticket);
    expect(rolledBack.mutationError).toBe('Network error');
  });
});
