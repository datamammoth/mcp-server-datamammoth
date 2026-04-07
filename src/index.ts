#!/usr/bin/env node
// ─── DataMammoth MCP Server ───
//
// Model Context Protocol server exposing 16 tools for AI assistants
// to manage DataMammoth infrastructure: servers, products, billing,
// support tickets, zones, health, and profile.
//
// Usage:
//   DM_API_KEY=your-key node dist/index.js
//
// Or configure in Claude Desktop / MCP client:
//   {
//     "mcpServers": {
//       "datamammoth": {
//         "command": "npx",
//         "args": ["-y", "@datamammoth/mcp-server"],
//         "env": { "DM_API_KEY": "your-api-key" }
//       }
//     }
//   }

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerServerTools } from './tools/servers.js';
import { registerProductTools } from './tools/products.js';
import { registerBillingTools } from './tools/billing.js';
import { registerSupportTools } from './tools/support.js';
import { registerZoneTools } from './tools/zones.js';

async function main() {
  const server = new McpServer({
    name: 'datamammoth',
    version: '0.1.0',
  });

  // Register all 16 tools across 5 modules
  registerServerTools(server);   // 8 tools: list, get, create, power, delete, metrics, snapshots (list + create)
  registerProductTools(server);  // 1 tool:  list products
  registerBillingTools(server);  // 2 tools: list invoices, get balance
  registerSupportTools(server);  // 2 tools: list tickets, create ticket
  registerZoneTools(server);     // 3 tools: list zones, health, profile

  // Connect via stdio transport (standard for MCP)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with MCP protocol on stdout
  console.error('DataMammoth MCP server v0.1.0 started (16 tools registered)');
}

main().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});
