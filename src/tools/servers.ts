// ─── Server Management Tools ───

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';
import type { DMServer, DMMetrics, DMSnapshot } from '../types.js';

// ── Format Helpers ──

function formatServersTable(servers: DMServer[]): string {
  if (!servers.length) return 'No servers found.';

  const header = `Server List (${servers.length} server${servers.length === 1 ? '' : 's'}):\n`;
  const colW = { host: 20, ip: 16, status: 14, region: 12, os: 16 };

  const divTop    = `┌${'─'.repeat(colW.host)}┬${'─'.repeat(colW.ip)}┬${'─'.repeat(colW.status)}┬${'─'.repeat(colW.region)}┬${'─'.repeat(colW.os)}┐`;
  const divMid    = `├${'─'.repeat(colW.host)}┼${'─'.repeat(colW.ip)}┼${'─'.repeat(colW.status)}┼${'─'.repeat(colW.region)}┼${'─'.repeat(colW.os)}┤`;
  const divBottom = `└${'─'.repeat(colW.host)}┴${'─'.repeat(colW.ip)}┴${'─'.repeat(colW.status)}┴${'─'.repeat(colW.region)}┴${'─'.repeat(colW.os)}┘`;

  const pad = (s: string, w: number) => ` ${s.padEnd(w - 2)} `;
  const headerRow = `│${pad('Hostname', colW.host)}│${pad('IP Address', colW.ip)}│${pad('Status', colW.status)}│${pad('Region', colW.region)}│${pad('OS', colW.os)}│`;

  const rows = servers.map(s =>
    `│${pad(s.hostname, colW.host)}│${pad(s.ipAddress, colW.ip)}│${pad(s.status, colW.status)}│${pad(s.region, colW.region)}│${pad(s.os, colW.os)}│`
  );

  return header + [divTop, headerRow, divMid, ...rows, divBottom].join('\n');
}

function formatServerDetail(s: DMServer): string {
  return [
    `Server: ${s.hostname} (${s.id})`,
    `─────────────────────────────────`,
    `  Status:     ${s.status}`,
    `  IP:         ${s.ipAddress}`,
    `  Region:     ${s.region}`,
    `  Product:    ${s.productName}`,
    `  OS:         ${s.os}`,
    `  CPU:        ${s.cpu} vCPU`,
    `  RAM:        ${s.ram} MB`,
    `  Disk:       ${s.disk} GB`,
    `  Created:    ${s.createdAt}`,
  ].join('\n');
}

function formatMetrics(m: DMMetrics): string {
  return [
    `Metrics for server ${m.serverId} (${m.period}):`,
    `─────────────────────────────────`,
    `  CPU:     avg ${m.cpu.avg}% / max ${m.cpu.max}%`,
    `  RAM:     ${m.ram.used} / ${m.ram.total} ${m.ram.unit}`,
    `  Disk:    ${m.disk.used} / ${m.disk.total} ${m.disk.unit}`,
    `  Net In:  ${m.network.inbound} ${m.network.unit}`,
    `  Net Out: ${m.network.outbound} ${m.network.unit}`,
  ].join('\n');
}

function formatSnapshots(snapshots: DMSnapshot[]): string {
  if (!snapshots.length) return 'No snapshots found.';

  const header = `Snapshots (${snapshots.length}):\n`;
  const colW = { name: 24, size: 10, status: 12, created: 22 };

  const divTop    = `┌${'─'.repeat(colW.name)}┬${'─'.repeat(colW.size)}┬${'─'.repeat(colW.status)}┬${'─'.repeat(colW.created)}┐`;
  const divMid    = `├${'─'.repeat(colW.name)}┼${'─'.repeat(colW.size)}┼${'─'.repeat(colW.status)}┼${'─'.repeat(colW.created)}┤`;
  const divBottom = `└${'─'.repeat(colW.name)}┴${'─'.repeat(colW.size)}┴${'─'.repeat(colW.status)}┴${'─'.repeat(colW.created)}┘`;

  const pad = (s: string, w: number) => ` ${s.padEnd(w - 2)} `;
  const headerRow = `│${pad('Name', colW.name)}│${pad('Size (GB)', colW.size)}│${pad('Status', colW.status)}│${pad('Created', colW.created)}│`;

  const rows = snapshots.map(snap =>
    `│${pad(snap.name, colW.name)}│${pad(String(snap.size), colW.size)}│${pad(snap.status, colW.status)}│${pad(snap.createdAt, colW.created)}│`
  );

  return header + [divTop, headerRow, divMid, ...rows, divBottom].join('\n');
}

// ── Tool Registration ──

export function registerServerTools(server: McpServer): void {

  // 1. dm_list_servers
  server.tool(
    'dm_list_servers',
    'List your DataMammoth servers with optional filters',
    {
      status: z.string().optional().describe('Filter by status: active, suspended, terminated, provisioning'),
      search: z.string().optional().describe('Search by hostname or IP address'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMServer[]>('/servers', {
        'filter[status]': params.status,
        search: params.search,
      });
      return { content: [{ type: 'text' as const, text: formatServersTable(res.data) }] };
    }
  );

  // 2. dm_get_server
  server.tool(
    'dm_get_server',
    'Get detailed information about a specific server including live status',
    {
      serverId: z.string().describe('The server ID'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMServer>(`/servers/${params.serverId}`);
      return { content: [{ type: 'text' as const, text: formatServerDetail(res.data) }] };
    }
  );

  // 3. dm_create_server
  server.tool(
    'dm_create_server',
    'Provision a new server. Returns the new server details once provisioning begins.',
    {
      hostname: z.string().describe('Server hostname (e.g. web-01)'),
      productId: z.string().describe('Product/plan ID from dm_list_products'),
      zoneId: z.string().describe('Datacenter zone ID from dm_list_zones'),
      osId: z.string().describe('Operating system image ID'),
      sshKeyIds: z.array(z.string()).optional().describe('SSH key IDs to install'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.post<DMServer>('/servers', {
        hostname: params.hostname,
        productId: params.productId,
        zoneId: params.zoneId,
        osId: params.osId,
        sshKeyIds: params.sshKeyIds ?? [],
      });
      return {
        content: [{
          type: 'text' as const,
          text: `Server provisioning started!\n\n${formatServerDetail(res.data)}`,
        }],
      };
    }
  );

  // 4. dm_server_power
  server.tool(
    'dm_server_power',
    'Control server power state: start, stop, reboot, or graceful shutdown',
    {
      serverId: z.string().describe('The server ID'),
      action: z.enum(['start', 'stop', 'reboot', 'shutdown']).describe('Power action to perform'),
    },
    async (params) => {
      const client = getClient();
      await client.post(`/servers/${params.serverId}/power`, { action: params.action });
      return {
        content: [{
          type: 'text' as const,
          text: `Power action '${params.action}' sent to server ${params.serverId}. The action may take a few moments to complete.`,
        }],
      };
    }
  );

  // 5. dm_delete_server
  server.tool(
    'dm_delete_server',
    'Terminate and delete a server. This action is irreversible.',
    {
      serverId: z.string().describe('The server ID to delete'),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
    async (params) => {
      if (!params.confirm) {
        return {
          content: [{
            type: 'text' as const,
            text: 'Deletion not confirmed. Set confirm=true to proceed with server termination.',
          }],
        };
      }
      const client = getClient();
      await client.delete(`/servers/${params.serverId}`);
      return {
        content: [{
          type: 'text' as const,
          text: `Server ${params.serverId} has been terminated and scheduled for deletion.`,
        }],
      };
    }
  );

  // 6. dm_server_metrics
  server.tool(
    'dm_server_metrics',
    'Get CPU, RAM, disk, and network metrics for a server',
    {
      serverId: z.string().describe('The server ID'),
      period: z.enum(['1h', '6h', '24h', '7d', '30d']).optional().describe('Time period for metrics (default: 24h)'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMMetrics>(`/servers/${params.serverId}/metrics`, {
        period: params.period ?? '24h',
      });
      return { content: [{ type: 'text' as const, text: formatMetrics(res.data) }] };
    }
  );

  // 7. dm_list_snapshots
  server.tool(
    'dm_list_snapshots',
    'List snapshots for a server',
    {
      serverId: z.string().describe('The server ID'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.get<DMSnapshot[]>(`/servers/${params.serverId}/snapshots`);
      return { content: [{ type: 'text' as const, text: formatSnapshots(res.data) }] };
    }
  );

  // 8. dm_create_snapshot
  server.tool(
    'dm_create_snapshot',
    'Create a snapshot of a server',
    {
      serverId: z.string().describe('The server ID'),
      name: z.string().describe('Snapshot name/label'),
    },
    async (params) => {
      const client = getClient();
      const res = await client.post<DMSnapshot>(`/servers/${params.serverId}/snapshots`, {
        name: params.name,
      });
      return {
        content: [{
          type: 'text' as const,
          text: `Snapshot '${res.data.name}' creation started (ID: ${res.data.id}). Status: ${res.data.status}`,
        }],
      };
    }
  );
}
