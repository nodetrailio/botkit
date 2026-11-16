# Nodetrail bot kit

JavaScript SDK, a local MCP server, and draft agent-framework plugins so bots and scripts can call Nodetrail’s testnet x402 scan API.

**On-chain sight, security tight.**

x402 runs on testnet for now (Base Sepolia and Solana devnet). Mainnet payments are coming soon. The starter (API-key) product stays off. Packages are not on npm yet — install from this repo. Payments default off in the client, and mainnet payments are refused.

Preview scans may be produced by local naming rules. They are not live chain reads. Facts only. No score, no verdict.

## What’s in here

| Path | What it is |
|---|---|
| `packages/sdk` | JavaScript client for the testnet x402 preview API |
| `packages/mcp` | Local MCP server that exposes the same preview scans as tools |
| `packages/eliza-plugin` | ElizaOS plugin **draft** (not listed in Eliza yet) |
| `packages/solana-agent-kit` | Solana Agent Kit plugin **draft** (not listed in that kit yet) |
| `badges` | “Powered by Nodetrail” SVG badges |
| `bazaar` | x402 Bazaar extension draft. Nodetrail is not listed in the Bazaar yet. |

Docs: [nodetrail.io/developers](https://nodetrail.io/developers/). Product: [nodetrail.io](https://nodetrail.io). Official links: [nodetrail.io/security](https://nodetrail.io/security).

## Where calls go

Set the preview host yourself. The scan routes are not on nodetrail.io yet.

```bash
export NODETRAIL_BASE_URL="https://YOUR-TESTNET-PREVIEW-HOST"
```

- Quick token scan: `GET /api/x402/v1/scan/token?address=...` — $0.01 testnet USDC
- Deep / dev scan: `GET /api/x402/v1/scan/dev?address=...` — $0.08 testnet USDC
- Quick wallet scan: `GET /api/x402/v1/scan/wallet?address=...` — $0.01 testnet USDC
- Free status: `GET /api/x402/v1/info`

A Vercel login may be required to reach the current preview. Do not send mainnet funds.

The SDK and MCP default to **not sending a payment**. They will show you a `402 Payment Required` result instead. Paying is opt-in and testnet-only.

## Quick try

```bash
cd packages/sdk
node --input-type=module -e "import { Nodetrail } from './src/index.js'; const nt = new Nodetrail({ baseUrl: process.env.NODETRAIL_BASE_URL }); console.log(await nt.info());"
```

```bash
cd packages/mcp
NODETRAIL_BASE_URL="https://YOUR-TESTNET-PREVIEW-HOST" node src/server.js
```

## What this is not

- Not a live pay-per-scan product on nodetrail.io
- Not an npm package you can install from the public registry yet
- Not a mainnet payment product
- Not listed in the x402 Bazaar yet
