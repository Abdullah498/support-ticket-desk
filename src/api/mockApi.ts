import type { Agent, NewTicket, Ticket, TicketPatch } from '../types';

const LATENCY_MS = 600;
const FAILURE_RATE = 0.2;

const agents: Agent[] = [
  { id: 'a1', name: 'Mona Adel', team: 'billing' },
  { id: 'a2', name: 'Karim Fathy', team: 'technical' },
  { id: 'a3', name: 'Salma Nabil', team: 'technical' },
  { id: 'a4', name: 'Youssef Hany', team: 'general' },
];

let tickets: Ticket[] = [
  {
    id: 't1',
    title: 'Cannot log in after password reset',
    description: 'User gets an invalid token error.',
    status: 'open',
    priority: 'urgent',
    assigneeId: 'a2',
    createdAt: '2026-10-01T09:15:00Z'
  },
  {
    id: 't2',
    title: 'Double charge on October invoice',
    description: 'Customer was billed twice for one plan.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'a1',
    createdAt: '2026-10-02T11:40:00Z'
  },
  {
    id: 't3',
    title: 'Export to CSV is missing columns',
    description: 'The date and owner columns are empty.',
    status: 'open',
    priority: 'medium',
    assigneeId: null,
    createdAt: '2026-10-03T14:05:00Z'
  },
  {
    id: 't4',
    title: 'Request to change account email',
    description: 'Customer wants to switch to a work email.',
    status: 'resolved',
    priority: 'low',
    assigneeId: 'a4',
    createdAt: '2026-10-04T08:30:00Z'
  },
  {
    id: 't5',
    title: 'Dashboard loads slowly',
    description: 'Takes over 10 seconds on mobile data.',
    status: 'open',
    priority: 'high',
    assigneeId: 'a3',
    createdAt: '2026-10-05T16:20:00Z'
  },
  {
    id: 't6',
    title: 'Refund not received',
    description: 'Refund approved 10 days ago, not in the bank yet.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'a1',
    createdAt: '2026-10-06T10:00:00Z'
  },
];

function simulate<T>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Network error: please try again.'));
        return;
      }

      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, LATENCY_MS);
  });
}

export function fetchTickets(): Promise<Ticket[]> {
  return simulate(() => tickets.map((t) => ({ ...t })));
}

export function fetchAgents(): Promise<Agent[]> {
  return simulate(() => agents.map((a) => ({ ...a })));
}

export function createTicket(input: NewTicket): Promise<Ticket> {
  return simulate(() => {
    const ticket: Ticket = {
      ...input,
      id: crypto.randomUUID(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    tickets = [ticket, ...tickets];

    return { ...ticket };
  });
}

export function updateTicket(
  id: string,
  patch: TicketPatch
): Promise<Ticket> {
  return simulate(() => {
    const existing = tickets.find((t) => t.id === id);

    if (!existing) throw new Error(`Ticket ${id} not found`);

    const updated: Ticket = { ...existing, ...patch };

    tickets = tickets.map((t) => (t.id === id ? updated : t));

    return { ...updated };
  });
}

export function deleteTicket(id: string): Promise<void> {
  return simulate(() => {
    tickets = tickets.filter((t) => t.id !== id);
  });
}