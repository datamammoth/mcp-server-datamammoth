// ─── Product Listing Tools ───

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';
import type { DMProduct } from '../types.js';

function formatProductsTable(products: DMProduct[]): string {
  if (!products.length) return 'No products found.';

  const header = `Product Catalog (${products.length} product${products.length === 1 ? '' : 's'}):\n`;
  const colW = { name: 28, category: 14, price: 14, cpu: 6, ram: 8, disk: 8 };

  const divTop    = `┌${'─'.repeat(colW.name)}┬${'─'.repeat(colW.category)}┬${'─'.repeat(colW.price)}┬${'─'.repeat(colW.cpu)}┬${'─'.repeat(colW.ram)}┬${'─'.repeat(colW.disk)}┐`;
  const divMid    = `├${'─'.repeat(colW.name)}┼${'─'.repeat(colW.category)}┼${'─'.repeat(colW.price)}┼${'─'.repeat(colW.cpu)}┼${'─'.repeat(colW.ram)}┼${'─'.repeat(colW.disk)}┤`;
  const divBottom = `└${'─'.repeat(colW.name)}┴${'─'.repeat(colW.category)}┴${'─'.repeat(colW.price)}┴${'─'.repeat(colW.cpu)}┴${'─'.repeat(colW.ram)}┴${'─'.repeat(colW.disk)}┘`;

  const pad = (s: string, w: number) => ` ${s.padEnd(w - 2)} `;
  const headerRow = `│${pad('Name', colW.name)}│${pad('Category', colW.category)}│${pad('Price', colW.price)}│${pad('CPU', colW.cpu)}│${pad('RAM', colW.ram)}│${pad('Disk', colW.disk)}│`;

  const rows = products.map(p =>
    `│${pad(p.name, colW.name)}│${pad(p.category, colW.category)}│${pad(`${p.currency} ${p.price}/${p.billingCycle}`, colW.price)}│${pad(`${p.cpu}`, colW.cpu)}│${pad(`${p.ram}MB`, colW.ram)}│${pad(`${p.disk}GB`, colW.disk)}│`
  );

  return header + [divTop, headerRow, divMid, ...rows, divBottom].join('\n');
}

export function registerProductTools(server: McpServer): void {

  // 9. dm_list_products
  server.tool(
    'dm_list_products',
    'Browse the product catalog with optional category/region filters',
    {
      category: z.string().optional().describe('Filter by category: vps, dedicated, cloud, storage'),
      region: z.string().optional().describe('Filter by region/zone slug'),
      search: z.string().optional().describe('Search products by name'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMProduct[]>('/products', {
        'filter[category]': params.category,
        'filter[region]': params.region,
        search: params.search,
      });
      return { content: [{ type: 'text' as const, text: formatProductsTable(res.data) }] };
    }
  );
}
