# Nodetrail bot kit

JavaScript SDK, a local MCP server, and draft agent-framework plugins so bots and scripts can call Nodetrail’s x402 pay-per-scan API.

**Scan first. Ape different.™**

The scan API is live on nodetrail.io. Quick token scans cost 1¢, wallet scans 2¢ and deep scans 3¢, and the scan trio (quick + wallet + deep in one payment) costs 5¢, paid in USDC on Base or Solana mainnet. The starter (API-key) product stays off. Packages are not on npm yet — install from this repo. Payments default off in the client in this repo: it shows you the `402 Payment Required` quote and does not pay or sign for you. Use any x402 v2 client to pay.

Facts only. Never a verdict.

## What’s in here

| Path | What it is |
|---|---|
| `packages/sdk` | JavaScript client for the x402 scan API |
| `packages/mcp` | Local MCP server that exposes the same scans as tools |
| `packages/eliza-plugin` | ElizaOS plugin **draft** (not listed in Eliza yet) |
| `packages/solana-agent-kit` | Solana Agent Kit plugin **draft** (not listed in that kit yet) |
| `badges` | “Powered by Nodetrail” SVG badges |
| `bazaar` | x402 Bazaar extension draft. Nodetrail is not listed in the Bazaar yet. |

Docs: [nodetrail.io/developers](https://nodetrail.io/developers/). Product: [nodetrail.io](https://nodetrail.io). Official links: [nodetrail.io/security](https://nodetrail.io/security).

## Where calls go

Point the client at the live API:

```bash
export NODETRAIL_BASE_URL="https://nodetrail.io"
```

- Quick token scan: `GET /api/x402/v1/scan/token?address=...` — 1¢ USDC
- Quick wallet scan: `GET /api/x402/v1/scan/wallet?address=...` — 2¢ USDC
- Deep / dev scan: `GET /api/x402/v1/scan/dev?address=...` — 3¢ USDC
- Scan trio (quick + wallet + deep): `GET /api/x402/v1/scan/trio?address=...&wallet=...` — 5¢ USDC
- Free status: `GET /api/x402/v1/info`

Pass `chain` for anything other than a Solana mint or a Base `0x` address. See [nodetrail.io/developers](https://nodetrail.io/developers/) for the chain list and the full spec at [nodetrail.io/openapi.json](https://nodetrail.io/openapi.json).

The SDK and MCP in this repo default to **not sending a payment**. They will show you a `402 Payment Required` result instead.

## Quick try

```bash
cd packages/sdk
node --input-type=module -e "import { Nodetrail } from './src/index.js'; const nt = new Nodetrail({ baseUrl: process.env.NODETRAIL_BASE_URL }); console.log(await nt.info());"
```

```bash
cd packages/mcp
NODETRAIL_BASE_URL="https://nodetrail.io" node src/server.js
```

## What this is not

- Not an npm package you can install from the public registry yet
- Not a payment signer: this repo’s client does not pay for you
- Not listed in the x402 Bazaar yet
