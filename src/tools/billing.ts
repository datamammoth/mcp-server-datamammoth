// ─── Billing Tools ───

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';
import type { DMInvoice, DMBalance } from '../types.js';

function formatInvoicesTable(invoices: DMInvoice[]): string {
  if (!invoices.length) return 'No invoices found.';

  const header = `Invoices (${invoices.length}):\n`;
  const colW = { number: 16, status: 10, total: 14, due: 14, paid: 14 };

  const divTop    = `┌${'─'.repeat(colW.number)}┬${'─'.repeat(colW.status)}┬${'─'.repeat(colW.total)}┬${'─'.repeat(colW.due)}┬${'─'.repeat(colW.paid)}┐`;
  const divMid    = `├${'─'.repeat(colW.number)}┼${'─'.repeat(colW.status)}┼${'─'.repeat(colW.total)}┼${'─'.repeat(colW.due)}┼${'─'.repeat(colW.paid)}┤`;
  const divBottom = `└${'─'.repeat(colW.number)}┴${'─'.repeat(colW.status)}┴${'─'.repeat(colW.total)}┴${'─'.repeat(colW.due)}┴${'─'.repeat(colW.paid)}┘`;

  const pad = (s: string, w: number) => ` ${s.padEnd(w - 2)} `;
  const headerRow = `│${pad('Invoice #', colW.number)}│${pad('Status', colW.status)}│${pad('Total', colW.total)}│${pad('Due Date', colW.due)}│${pad('Paid At', colW.paid)}│`;

  const rows = invoices.map(inv =>
    `│${pad(inv.number, colW.number)}│${pad(inv.status, colW.status)}│${pad(`${inv.currency} ${inv.total.toFixed(2)}`, colW.total)}│${pad(inv.dueDate, colW.due)}│${pad(inv.paidAt ?? '—', colW.paid)}│`
  );

  return header + [divTop, headerRow, divMid, ...rows, divBottom].join('\n');
}

function formatBalance(b: DMBalance): string {
  return [
    `Account Balance`,
    `─────────────────────────────`,
    `  Balance:          ${b.currency} ${b.balance.toFixed(2)}`,
    `  Account Credit:   ${b.currency} ${b.credit.toFixed(2)}`,
    `  Unpaid Invoices:  ${b.unpaidInvoices}`,
  ].join('\n');
}

export function registerBillingTools(server: McpServer): void {

  // 10. dm_list_invoices
  server.tool(
    'dm_list_invoices',
    'List invoices with optional status filter',
    {
      status: z.string().optional().describe('Filter by status: paid, unpaid, overdue, cancelled'),
      limit: z.number().optional().describe('Number of invoices to return (default 20)'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMInvoice[]>('/billing/invoices', {
        'filter[status]': params.status,
        per_page: String(params.limit ?? 20),
      });
      return { content: [{ type: 'text' as const, text: formatInvoicesTable(res.data) }] };
    }
  );

  // 11. dm_get_balance
  server.tool(
    'dm_get_balance',
    'Check current account balance, credit, and unpaid invoice count',
    {},
    async () => {
      const client = getClient();
      const res = await client.get<DMBalance>('/billing/balance');
      return { content: [{ type: 'text' as const, text: formatBalance(res.data) }] };
    }
  );
}
