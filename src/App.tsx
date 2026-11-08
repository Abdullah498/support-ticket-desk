import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadInitialData, createTicketThunk, updateTicketThunk, deleteTicketThunk, selectFilteredTickets, selectStatusCounts, selectIsCreating, selectMutationError, selectDeletingIds, clearMutationError } from './features/tickets/ticketsSlice';
import { setAssignee, setPriority, setSearch, setStatus, resetFilters } from './features/filters/filtersSlice';
import { CreateTicketForm } from './components/CreateTicketForm';
import { FiltersBar } from './components/FiltersBar';
import { TicketCard } from './components/TicketCard';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useTheme } from './theme/ThemeContext';
import type { NewTicket, TicketPatch } from './types';

function useSecondsSince(timestamp: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);
  return Math.max(0, Math.floor((now - timestamp) / 1000));
}

export default function App() {
  const dispatch = useAppDispatch();
  const ticketsState = useAppSelector((state) => state.tickets);
  const agents = useAppSelector((state) => state.agents.items);
  const filters = useAppSelector((state) => state.filters);
  const filteredTickets = useAppSelector(selectFilteredTickets);
  const counts = useAppSelector(selectStatusCounts);
  const creating = useAppSelector(selectIsCreating);
  const mutationError = useAppSelector(selectMutationError);
  const deletingIds = useAppSelector(selectDeletingIds);
  const { theme, toggleTheme } = useTheme();
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const secondsSinceSync = useSecondsSince(lastSyncedAt);

  useEffect(() => {
    void dispatch(loadInitialData()).then((result) => {
      if (loadInitialData.fulfilled.match(result)) setLastSyncedAt(Date.now());
    });
  }, [dispatch]);
  useEffect(() => { dispatch(setSearch(debouncedSearch)); }, [debouncedSearch, dispatch]);
  useEffect(() => {
    try { localStorage.setItem('support-ticket-filters', JSON.stringify(filters)); } catch { /* Storage may be unavailable. */ }
  }, [filters]);

  const handleUpdate = useCallback((id: string, patch: TicketPatch) => {
    void dispatch(updateTicketThunk({ id, patch })).then((result) => {
      if (updateTicketThunk.fulfilled.match(result)) setLastSyncedAt(Date.now());
    });
  }, [dispatch]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Delete this ticket? This action cannot be undone.')) {
      void dispatch(deleteTicketThunk(id)).then((result) => {
        if (deleteTicketThunk.fulfilled.match(result)) setLastSyncedAt(Date.now());
      });
    }
  }, [dispatch]);

  const handleCreate = useCallback(async (ticket: NewTicket): Promise<boolean> => {
    const result = await dispatch(createTicketThunk(ticket));
    if (createTicketThunk.fulfilled.match(result)) {
      setLastSyncedAt(Date.now());
      return true;
    }
    return false;
  }, [dispatch]);

  const assigneeNames = useMemo(() => new Map(agents.map((agent) => [agent.id, agent.name])), [agents]);

  if (ticketsState.loadStatus === 'loading' || ticketsState.loadStatus === 'idle') {
    return <main className="state-screen"><div className="state-card"><div className="spinner" /><h1>Loading your workspace</h1><p>Fetching tickets and support agents…</p></div></main>;
  }
  if (ticketsState.loadStatus === 'failed') {
    return <main className="state-screen"><div className="state-card error-state"><div className="state-symbol">!</div><h1>Couldn’t load your workspace</h1><p>{ticketsState.error}</p><button className="primary-button" onClick={() => { dispatch(loadInitialData()); }} type="button">Retry <span>↻</span></button></div></main>;
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">S</span><span>support<span className="brand-light">desk</span></span></a>
        <div className="header-right"><span className="sync-indicator"><i /> Last synced {secondsSinceSync} seconds ago</span><button className="theme-button" onClick={toggleTheme} type="button" aria-label="Toggle theme">{theme === 'light' ? '☾' : '☀'}</button><div className="avatar">AD</div></div>
      </header>

      <section className="welcome">
        <div><span className="eyebrow">SUPPORT OPERATIONS</span><h1>Good afternoon <span>✳</span></h1><p>Here’s what’s happening with your customer support today.</p></div>
        <div className="welcome-date">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</div>
      </section>

      <section className="summary-grid" aria-label="Ticket summary">
        <div className="summary-card"><span className="summary-icon icon-total">▤</span><div><span>Total tickets</span><strong>{counts.open + counts.in_progress + counts.resolved}</strong></div></div>
        <div className="summary-card"><span className="summary-icon icon-open">◷</span><div><span>Open</span><strong>{counts.open}</strong></div><span className="summary-dot dot-open" /></div>
        <div className="summary-card"><span className="summary-icon icon-progress">↗</span><div><span>In progress</span><strong>{counts.in_progress}</strong></div><span className="summary-dot dot-progress" /></div>
        <div className="summary-card"><span className="summary-icon icon-resolved">✓</span><div><span>Resolved</span><strong>{counts.resolved}</strong></div><span className="summary-dot dot-resolved" /></div>
      </section>

      {mutationError && <div className="toast-error" role="alert"><span>⚠ {mutationError}</span><button type="button" onClick={() => dispatch(clearMutationError())} aria-label="Dismiss error">×</button></div>}

      <div className="workspace">
        <div className="ticket-column">
          <FiltersBar status={filters.status} priority={filters.priority} assignee={filters.assignee} search={searchInput}
            agents={agents} onStatus={(value) => dispatch(setStatus(value))} onPriority={(value) => dispatch(setPriority(value))}
            onAssignee={(value) => dispatch(setAssignee(value))} onSearch={setSearchInput} onReset={() => { setSearchInput(''); dispatch(resetFilters()); }} />
          <div className="results-heading"><span>{filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}</span><span>Sorted by newest</span></div>
          <div className="ticket-list">
            {filteredTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} assigneeName={ticket.assigneeId ? assigneeNames.get(ticket.assigneeId) ?? 'Unassigned' : 'Unassigned'} agents={agents} deleting={deletingIds.includes(ticket.id)} onUpdate={handleUpdate} onDelete={handleDelete} />)}
            {filteredTickets.length === 0 && <div className="empty-state"><span>⌕</span><h3>No tickets found</h3><p>Try adjusting your filters or search terms.</p></div>}
          </div>
        </div>
        <aside className="sidebar"><CreateTicketForm agents={agents} saving={creating} onCreate={handleCreate} /><div className="team-card"><span className="eyebrow">YOUR TEAM</span><h3>Support agents</h3><div className="team-list">{agents.map((agent, index) => <div className="team-member" key={agent.id}><span className={`team-avatar team-${index}`}>{agent.name.split(' ').map((part) => part[0]).join('')}</span><span><strong>{agent.name}</strong><small>{agent.team} team</small></span><i /></div>)}</div></div></aside>
      </div>
      <footer>Support Desk <span>·</span> Built for better customer experiences</footer>
    </main>
  );
}
