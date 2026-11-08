import { memo, useCallback } from 'react';
import type { Agent, Ticket, TicketPatch, TicketStatus } from '../types';

interface TicketCardProps {
  ticket: Ticket;
  assigneeName: string;
  agents: Agent[];
  deleting: boolean;
  onUpdate: (id: string, patch: TicketPatch) => void;
  onDelete: (id: string) => void;
}
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function TicketCardComponent({ ticket, assigneeName, agents, deleting, onUpdate, onDelete }: TicketCardProps) {
  const handleStatus = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(ticket.id, { status: event.target.value as TicketStatus });
  }, [onUpdate, ticket.id]);
  const handleAssignee = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(ticket.id, { assigneeId: event.target.value || null });
  }, [onUpdate, ticket.id]);

  return (
    <article className="ticket-card">
      <div className="ticket-main">
        <div className="ticket-title-row">
          <h3>{ticket.title}</h3>
          <span className={`priority priority-${ticket.priority}`}>{ticket.priority}</span>
        </div>
        <p className="ticket-description">{ticket.description}</p>
        <div className="ticket-meta">
          <span><span className="meta-label">Assignee</span>{assigneeName}</span>
          <span><span className="meta-label">Created</span>{dateFormatter.format(new Date(ticket.createdAt))}</span>
        </div>
      </div>
      <div className="ticket-controls">
        <label className="compact-field">
          <span>Status</span>
          <select value={ticket.status} onChange={handleStatus}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <label className="compact-field">
          <span>Assignee</span>
          <select value={ticket.assigneeId ?? ''} onChange={handleAssignee}>
            <option value="">Unassigned</option>
            {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </select>
        </label>
        <button className="delete-button" type="button" disabled={deleting} onClick={() => onDelete(ticket.id)}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
export const TicketCard = memo(TicketCardComponent);
