// ─── Support Ticket Tools ───

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';
import type { DMTicket } from '../types.js';

function formatTicketsTable(tickets: DMTicket[]): string {
  if (!tickets.length) return 'No support tickets found.';

  const header = `Support Tickets (${tickets.length}):\n`;
  const colW = { id: 10, subject: 32, status: 16, priority: 10, updated: 14 };

  const divTop    = `┌${'─'.repeat(colW.id)}┬${'─'.repeat(colW.subject)}┬${'─'.repeat(colW.status)}┬${'─'.repeat(colW.priority)}┬${'─'.repeat(colW.updated)}┐`;
  const divMid    = `├${'─'.repeat(colW.id)}┼${'─'.repeat(colW.subject)}┼${'─'.repeat(colW.status)}┼${'─'.repeat(colW.priority)}┼${'─'.repeat(colW.updated)}┤`;
  const divBottom = `└${'─'.repeat(colW.id)}┴${'─'.repeat(colW.subject)}┴${'─'.repeat(colW.status)}┴${'─'.repeat(colW.priority)}┴${'─'.repeat(colW.updated)}┘`;

  const pad = (s: string, w: number) => ` ${s.padEnd(w - 2)} `;
  const headerRow = `│${pad('ID', colW.id)}│${pad('Subject', colW.subject)}│${pad('Status', colW.status)}│${pad('Priority', colW.priority)}│${pad('Updated', colW.updated)}│`;

  const rows = tickets.map(t =>
    `│${pad(t.id, colW.id)}│${pad(t.subject.slice(0, 30), colW.subject)}│${pad(t.status, colW.status)}│${pad(t.priority, colW.priority)}│${pad(t.updatedAt, colW.updated)}│`
  );

  return header + [divTop, headerRow, divMid, ...rows, divBottom].join('\n');
}

export function registerSupportTools(server: McpServer): void {

  // 12. dm_list_tickets
  server.tool(
    'dm_list_tickets',
    'List support tickets with optional status filter',
    {
      status: z.string().optional().describe('Filter by status: open, answered, customer-reply, closed'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMTicket[]>('/support/tickets', {
        'filter[status]': params.status,
      });
      return { content: [{ type: 'text' as const, text: formatTicketsTable(res.data) }] };
    }
  );

  // 13. dm_create_ticket
  server.tool(
    'dm_create_ticket',
    'Open a new support ticket',
    {
      subject: z.string().describe('Ticket subject line'),
      message: z.string().describe('Ticket body/message describing the issue'),
      department: z.string().optional().describe('Department: general, billing, technical (default: general)'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().describe('Ticket priority (default: medium)'),
      serverId: z.string().optional().describe('Related server ID if applicable'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.post<DMTicket>('/support/tickets', {
        subject: params.subject,
        message: params.message,
        department: params.department ?? 'general',
        priority: params.priority ?? 'medium',
        serverId: params.serverId,
      });
      return {
        content: [{
          type: 'text' as const,
          text: `Ticket created successfully!\n  ID:         ${res.data.id}\n  Subject:    ${res.data.subject}\n  Status:     ${res.data.status}\n  Priority:   ${res.data.priority}\n  Department: ${res.data.department}`,
        }],
      };
    }
  );
}
