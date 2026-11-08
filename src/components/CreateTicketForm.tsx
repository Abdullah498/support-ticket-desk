import { useMemo, useState, type FormEvent } from 'react';
import type { Agent, NewTicket, TicketPriority } from '../types';

interface Props { agents: Agent[]; saving: boolean; onCreate: (ticket: NewTicket) => Promise<boolean>; }
export function CreateTicketForm({ agents, saving, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const errors = useMemo(() => ({
    title: title.trim().length < 5 || title.trim().length > 80 ? 'Title must be 5–80 characters.' : '',
    description: description.trim() ? '' : 'Description is required.',
    priority: priority ? '' : 'Priority is required.',
  }), [title, description, priority]);
  const isValid = !errors.title && !errors.description && !errors.priority;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || saving) return;
    const success = await onCreate({ title: title.trim(), description: description.trim(), priority: priority as TicketPriority, assigneeId: assigneeId || null });
    if (success) {
      setTitle(''); setDescription(''); setPriority(''); setAssigneeId('');
    }
  }

  return (
    <form className="create-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading"><div><span className="eyebrow">NEW REQUEST</span><h2>Create a ticket</h2></div><span className="form-icon">＋</span></div>
      <label className="field"><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="What does the customer need?" aria-invalid={Boolean(errors.title)} />{errors.title && <small className="field-error">{errors.title}</small>}</label>
      <label className="field"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Add useful details…" aria-invalid={Boolean(errors.description)} />{errors.description && <small className="field-error">{errors.description}</small>}</label>
      <div className="form-row">
        <label className="field"><span>Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority | '')} aria-invalid={Boolean(errors.priority)}><option value="">Select priority</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>{errors.priority && <small className="field-error">{errors.priority}</small>}</label>
        <label className="field"><span>Assignee <em>Optional</em></span><select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">Unassigned</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
      </div>
      <button className="primary-button submit-button" type="submit" disabled={!isValid || saving}>{saving ? 'Saving…' : 'Create ticket'} <span>→</span></button>
    </form>
  );
}
