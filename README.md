# DataMammoth MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that lets AI assistants manage DataMammoth infrastructure through natural language.

> **Status**: Under development. Not yet published to npm.

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
      "args": ["@datamammoth/mcp-server"],
      "env": {
        "DM_API_KEY": "dm_your_key_here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_servers` | List all servers with optional status filter |
| `get_server` | Get details of a specific server |
| `create_server` | Provision a new server |
| `delete_server` | Delete a server |
| `reboot_server` | Reboot a server |
| `list_products` | Browse available VPS plans |
| `list_images` | Browse available OS images |
| `list_invoices` | List billing invoices |
| `get_balance` | Check account balance |
| `list_tickets` | List support tickets |
| `create_ticket` | Open a new support ticket |
| `list_snapshots` | List server snapshots |
| `create_snapshot` | Create a server snapshot |
| `list_ssh_keys` | List SSH keys |
| `add_ssh_key` | Add a new SSH key |

## Example Conversations

> "List my active servers"

> "Create a new Ubuntu 22.04 VPS with the medium plan, hostname api-prod-02"

> "Show me my unpaid invoices"

> "Take a snapshot of server srv_abc123 called pre-migration"

## Documentation

- [API Reference](https://data-mammoth.com/api-docs/reference)
- [MCP Protocol Docs](https://modelcontextprotocol.io/docs)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
