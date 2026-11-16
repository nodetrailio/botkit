#!/usr/bin/env node
/**
 * Local MCP server for the Nodetrail x402 testnet Preview API.
 * Not published. Payments default OFF. Mainnet is refused by the SDK.
 *
 * Claude Desktop / Cursor config example (local path only):
 * {
 *   "mcpServers": {
 *     "nodetrail-preview": {
 *       "command": "node",
 *       "args": ["packages/mcp/src/server.js"],
 *       "env": { "NODETRAIL_BASE_URL": "https://YOUR-TESTNET-PREVIEW-HOST" }
 *     }
 *   }
 * }
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Nodetrail, PREVIEW_PRICES, DEFAULT_BASE_URL } from "../../sdk/src/index.js";

const client = new Nodetrail({
  baseUrl: process.env.NODETRAIL_BASE_URL || DEFAULT_BASE_URL,
  apiKey: process.env.NODETRAIL_API_KEY || "",
  pay: false,
  allowTestnetPayment: false,
});

const NOTICE = "Preview only, testnet only, not a live Nodetrail product. Results from the current x402 Preview may be local naming rules, not live chain reads. Not financial advice. No payment is sent by this server.";

const tools = [
  {
    name: "nodetrail_info",
    description: "Get Nodetrail x402 preview status, prices, and whether testnet payments are being accepted. " + NOTICE,
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "nodetrail_check_token",
    description: `Quick token scan on the Nodetrail x402 Preview (listed preview price $0.01 testnet USDC). ${NOTICE}`,
    inputSchema: {
      type: "object",
      required: ["address"],
      properties: {
        address: { type: "string", description: "Token mint or contract address (Solana base58 or 0x)." },
        chain: { type: "string", description: "Optional chain key, for example solana, base, or ethereum." },
        name: { type: "string" },
        symbol: { type: "string" },
      },
    },
  },
  {
    name: "nodetrail_check_dev",
    description: `Deep / creator scan on the Nodetrail x402 Preview (listed preview price $0.08 testnet USDC). ${NOTICE}`,
    inputSchema: {
      type: "object",
      required: ["address"],
      properties: {
        address: { type: "string", description: "Token mint, contract, or creator address." },
        chain: { type: "string" },
      },
    },
  },
  {
    name: "nodetrail_check_wallet",
    description: `Quick wallet scan on the Nodetrail x402 Preview (listed preview price $0.01 testnet USDC). ${NOTICE}`,
    inputSchema: {
      type: "object",
      required: ["address"],
      properties: {
        address: { type: "string", description: "Wallet address." },
        chain: { type: "string" },
      },
    },
  },
];

function resultText(data) {
  return {
    content: [
      { type: "text", text: NOTICE },
      { type: "text", text: JSON.stringify(data, null, 2) },
    ],
  };
}

const server = new Server(
  { name: "nodetrail-preview", version: "0.1.0-preview" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params?.name;
  const args = req.params?.arguments || {};
  try {
    if (name === "nodetrail_info") return resultText(await client.info());
    if (name === "nodetrail_check_token") return resultText(await client.checkToken(args.address, args));
    if (name === "nodetrail_check_dev") return resultText(await client.checkDev(args.address, args));
    if (name === "nodetrail_check_wallet") return resultText(await client.checkWallet(args.address, args));
    return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    return { content: [{ type: "text", text: String(err && err.message ? err.message : err) }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

// Keep a stderr breadcrumb only; MCP stdio must stay clean.
console.error(`nodetrail-mcp preview listening on stdio. Base: ${client.baseUrl}. Prices: quick $${PREVIEW_PRICES.token.usd}, deep $${PREVIEW_PRICES.dev.usd}. Payments off.`);
