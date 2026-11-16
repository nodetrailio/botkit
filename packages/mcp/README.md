# @nodetrail/mcp

Local Model Context Protocol server. It wraps `@nodetrail/sdk` and talks to the Nodetrail x402 testnet preview API.

Payments stay off. Mainnet stays off. This package is not on npm yet, and it is not listed in any MCP directory.

```bash
# from this folder, after a local npm install
NODETRAIL_BASE_URL="https://YOUR-TESTNET-PREVIEW-HOST" node src/server.js
```

Example Cursor / Claude Desktop config:

```json
{
  "mcpServers": {
    "nodetrail-preview": {
      "command": "node",
      "args": ["packages/mcp/src/server.js"],
      "env": { "NODETRAIL_BASE_URL": "https://YOUR-TESTNET-PREVIEW-HOST" }
    }
  }
}
```
