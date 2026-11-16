/**
 * DRAFT Solana Agent Kit plugin for Nodetrail.
 *
 * Solana Agent Kit plugins are usually registered with kit.use(plugin).
 * Confirm the current SendAI / Solana Agent Kit plugin interface before any public PR.
 * Not published. Payments off. Mainnet off.
 */
import { Nodetrail } from "../../sdk/src/index.js";

const NOTICE = "Nodetrail preview only. Not a live product, not a live chain read, not financial advice.";

function client() {
  return new Nodetrail({ pay: false, allowTestnetPayment: false });
}

export const nodetrailSolanaAgentKitPlugin = {
  name: "nodetrail",
  methods: {
    async checkToken(address, extra = {}) {
      return client().checkToken(address, extra);
    },
    async checkDev(address, extra = {}) {
      return client().checkDev(address, extra);
    },
    async checkWallet(address, extra = {}) {
      return client().checkWallet(address, extra);
    },
    async info() {
      return client().info();
    },
  },
  actions: [
    {
      name: "NODETRAIL_CHECK_TOKEN",
      description: `Quick Nodetrail preview token scan. ${NOTICE}`,
      similes: ["scan token", "rug check", "nodetrail scan"],
      examples: ["Check this mint with Nodetrail: So11111111111111111111111111111111111111112"],
    },
  ],
  notice: NOTICE,
};

export default nodetrailSolanaAgentKitPlugin;
