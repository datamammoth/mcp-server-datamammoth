# DataMammoth MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that lets AI assistants manage DataMammoth infrastructure through natural language.

> **Status**: v0.1.0 — 16 tools implemented.

## Installation

```bash
npm install -g @datamammoth/mcp-server
```

## Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "datamammoth": {
      "command": "npx",
      "args": ["-y", "@datamammoth/mcp-server"],
      "env": {
        "DM_API_KEY": "dm_your_key_here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DM_API_KEY` | Yes | — | Your DataMammoth API key |
| `DM_BASE_URL` | No | `https://app.datamammoth.com/api/v2` | API base URL override |

## Available Tools (16)

### Server Management (8)
| Tool | Description |
|------|-------------|
| `dm_list_servers` | List servers with optional status/search filters |
| `dm_get_server` | Get server details and live status |
| `dm_create_server` | Provision a new server |
| `dm_server_power` | Power on/off/reboot/shutdown a server |
| `dm_delete_server` | Terminate a server (requires confirmation) |
| `dm_server_metrics` | Get CPU/RAM/disk/network metrics |
| `dm_list_snapshots` | List server snapshots |
| `dm_create_snapshot` | Create a server snapshot |

### Products (1)
| Tool | Description |
|------|-------------|
| `dm_list_products` | Browse product catalog with category/region filters |

### Billing (2)
| Tool | Description |
|------|-------------|
| `dm_list_invoices` | List invoices with optional status filter |
| `dm_get_balance` | Check account balance and credit |

### Support (2)
| Tool | Description |
|------|-------------|
| `dm_list_tickets` | List support tickets |
| `dm_create_ticket` | Open a new support ticket |

### Infrastructure (3)
| Tool | Description |
|------|-------------|
| `dm_list_zones` | List available datacenters |
| `dm_health` | Check API health and service status |
| `dm_get_profile` | Get account profile information |

## Example Conversations

> "List my active servers"

> "Create a new Ubuntu 22.04 VPS with the medium plan, hostname api-prod-02"

> "Show me my unpaid invoices"

> "Take a snapshot of server srv_abc123 called pre-migration"

> "What's the API health status?"

> "Open a ticket about high CPU usage on my web-01 server"

## Development

```bash
npm install
npm run build
DM_API_KEY=test npm start
```

## Documentation

- [API Reference](https://data-mammoth.com/api-docs/reference)
- [MCP Protocol Docs](https://modelcontextprotocol.io/docs)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT -- see [LICENSE](LICENSE).
