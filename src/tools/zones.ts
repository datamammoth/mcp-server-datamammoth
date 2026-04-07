// ─── Zone / Datacenter Tools ───

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';
import type { DMZone, DMHealthStatus, DMProfile } from '../types.js';

function formatZonesTable(zones: DMZone[]): string {
  if (!zones.length) return 'No zones found.';

  const header = `Datacenters / Zones (${zones.length}):\n`;
  const colW = { name: 20, slug: 14, city: 14, country: 10, avail: 12 };

  const divTop    = `┌${'─'.repeat(colW.name)}┬${'─'.repeat(colW.slug)}┬${'─'.repeat(colW.city)}┬${'─'.repeat(colW.country)}┬${'─'.repeat(colW.avail)}┐`;
  const divMid    = `├${'─'.repeat(colW.name)}┼${'─'.repeat(colW.slug)}┼${'─'.repeat(colW.city)}┼${'─'.repeat(colW.country)}┼${'─'.repeat(colW.avail)}┤`;
  const divBottom = `└${'─'.repeat(colW.name)}┴${'─'.repeat(colW.slug)}┴${'─'.repeat(colW.city)}┴${'─'.repeat(colW.country)}┴${'─'.repeat(colW.avail)}┘`;

  const pad = (s: string, w: number) => ` ${s.padEnd(w - 2)} `;
  const headerRow = `│${pad('Name', colW.name)}│${pad('Slug', colW.slug)}│${pad('City', colW.city)}│${pad('Country', colW.country)}│${pad('Available', colW.avail)}│`;

  const rows = zones.map(z =>
    `│${pad(z.name, colW.name)}│${pad(z.slug, colW.slug)}│${pad(z.city, colW.city)}│${pad(z.country, colW.country)}│${pad(z.available ? 'Yes' : 'No', colW.avail)}│`
  );

  return header + [divTop, headerRow, divMid, ...rows, divBottom].join('\n');
}

function formatHealth(h: DMHealthStatus): string {
  const svcLines = Object.entries(h.services)
    .map(([name, status]) => `    ${name.padEnd(16)} ${status}`)
    .join('\n');

  return [
    `API Health Check`,
    `─────────────────────────────`,
    `  Overall:  ${h.status}`,
    `  Version:  ${h.version}`,
    `  Uptime:   ${Math.floor(h.uptime / 3600)}h ${Math.floor((h.uptime % 3600) / 60)}m`,
    `  Services:`,
    svcLines,
  ].join('\n');
}

function formatProfile(p: DMProfile): string {
  return [
    `Account Profile`,
    `─────────────────────────────`,
    `  Name:       ${p.name}`,
    `  Email:      ${p.email}`,
    `  Company:    ${p.company ?? '—'}`,
    `  Role:       ${p.role}`,
    `  Tenant:     ${p.tenantName} (${p.tenantId})`,
    `  Member since: ${p.createdAt}`,
  ].join('\n');
}

export function registerZoneTools(server: McpServer): void {

  // 14. dm_list_zones
  server.tool(
    'dm_list_zones',
    'List available datacenters/zones',
    {
      country: z.string().optional().describe('Filter by country code (e.g. US, DE, SG)'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMZone[]>('/zones', {
        'filter[country]': params.country,
      });
      return { content: [{ type: 'text' as const, text: formatZonesTable(res.data) }] };
    }
  );

  // 15. dm_health
  server.tool(
    'dm_health',
    'Check DataMammoth API health status and service availability',
    {},
    async () => {
      const client = getClient();
      const res = await client.get<DMHealthStatus>('/health');
      return { content: [{ type: 'text' as const, text: formatHealth(res.data) }] };
    }
  );

  // 16. dm_get_profile
  server.tool(
    'dm_get_profile',
    'Get your DataMammoth account profile information',
    {},
    async () => {
      const client = getClient();
      const res = await client.get<DMProfile>('/me');
      return { content: [{ type: 'text' as const, text: formatProfile(res.data) }] };
    }
  );
}
