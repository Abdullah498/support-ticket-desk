import type { Agent, TicketPriority, TicketStatus } from '../types';

interface Props {
  status: TicketStatus | 'all'; priority: TicketPriority | 'all'; assignee: string; search: string;
  agents: Agent[];
  onStatus: (value: TicketStatus | 'all') => void; onPriority: (value: TicketPriority | 'all') => void;
  onAssignee: (value: string) => void; onSearch: (value: string) => void; onReset: () => void;
}
export function FiltersBar(props: Props) {
  return (
    <section className="filters-panel">
      <div className="filters-top"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>All tickets</h2></div><button className="text-button" onClick={props.onReset} type="button">Reset filters ↺</button></div>
      <div className="filters-grid">
        <label className="search-field"><span>Search tickets</span><div className="search-input"><span>⌕</span><input value={props.search} onChange={(event) => props.onSearch(event.target.value)} placeholder="Search title or description…" /></div></label>
        <label className="field"><span>Status</span><select value={props.status} onChange={(event) => props.onStatus(event.target.value as TicketStatus | 'all')}><option value="all">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label>
        <label className="field"><span>Priority</span><select value={props.priority} onChange={(event) => props.onPriority(event.target.value as TicketPriority | 'all')}><option value="all">All priorities</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
        <label className="field"><span>Assignee</span><select value={props.assignee} onChange={(event) => props.onAssignee(event.target.value)}><option value="all">Anyone</option>{props.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
      </div>
    </section>
  );
}
