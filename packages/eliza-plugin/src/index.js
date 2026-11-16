/**
 * DRAFT ElizaOS plugin for Nodetrail.
 *
 * This follows a common Eliza plugin shape (name, description, actions).
 * Confirm the current ElizaOS plugin interface before any public PR.
 * Not published. Payments off. Mainnet off. Preview API only.
 */
import { Nodetrail } from "../../sdk/src/index.js";

const NOTICE = "Nodetrail preview only. Not a live product, not a live chain read, not financial advice. No payment is sent.";

function makeClient() {
  return new Nodetrail({ pay: false, allowTestnetPayment: false });
}

async function runScan(kind, address, extras = {}) {
  const nt = makeClient();
  if (kind === "dev") return nt.checkDev(address, extras);
  if (kind === "wallet") return nt.checkWallet(address, extras);
  return nt.checkToken(address, extras);
}

const checkTokenAction = {
  name: "NODETRAIL_CHECK_TOKEN",
  similes: ["RUG_CHECK", "TOKEN_SCAN", "NODETRAIL_SCAN"],
  description: "Run a quick Nodetrail preview token scan (testnet preview, $0.01 listed price, payment off in this draft).",
  validate: async (_runtime, message) => Boolean(String(message?.content?.text || "").trim()),
  handler: async (_runtime, message, _state, _opts, callback) => {
    const text = String(message?.content?.text || "");
    const address = (text.match(/0x[a-fA-F0-9]{40}/) || text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/) || [])[0];
    if (!address) {
      const msg = "Please paste a token address. " + NOTICE;
      if (callback) await callback({ text: msg });
      return;
    }
    const result = await runScan("token", address);
    const msg = `${NOTICE}\n\n${JSON.stringify(result, null, 2)}`;
    if (callback) await callback({ text: msg });
    return result;
  },
  examples: [
    [
      { user: "{{user1}}", content: { text: "Is this token worth a closer look? So11111111111111111111111111111111111111112" } },
      { user: "{{agent}}", content: { text: "I can run a Nodetrail preview scan. It is not a verdict and not financial advice.", action: "NODETRAIL_CHECK_TOKEN" } },
    ],
  ],
};

export const nodetrailPlugin = {
  name: "@nodetrail/plugin-eliza",
  description: "DRAFT. Nodetrail preview token, dev, and wallet scans for Eliza agents. Not live, not published.",
  actions: [checkTokenAction],
  evaluators: [],
  providers: [],
};

export default nodetrailPlugin;
