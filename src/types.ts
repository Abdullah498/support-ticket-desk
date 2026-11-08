export type TicketStatus = 'open' | 'in_progress' | 'resolved'; 
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'; 
export interface Agent { 
    id: string; 
    name: string; 
    team: 'billing' | 'technical' | 'general'; 
}
export interface Ticket { 
    id: string; 
    title: string; 
    description: string; 
    status: TicketStatus; 
    priority: TicketPriority; 
    assigneeId: string | null; 
    createdAt: string; // ISO 8601
}

export type NewTicket = Omit<Ticket, 'id' | 'status' | 'createdAt'>;
export type TicketPatch = Partial<Pick<Ticket, 'status' | 'assigneeId'>>;