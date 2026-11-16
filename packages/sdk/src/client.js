/**
 * Nodetrail preview client.
 *
 * Default target: process.env.NODETRAIL_BASE_URL or opts.baseUrl (testnet preview only).
 * Payments are OFF unless you pass pay: true AND allowTestnetPayment: true.
 * Mainnet payments are refused. This is not a live Nodetrail product.
 */
export const DEFAULT_BASE_URL = process.env.NODETRAIL_BASE_URL || "";

export const SCAN_PATHS = Object.freeze({
  token: "/api/x402/v1/scan/token",
  dev: "/api/x402/v1/scan/dev",
  wallet: "/api/x402/v1/scan/wallet",
  info: "/api/x402/v1/info",
});

export const PREVIEW_PRICES = Object.freeze({
  token: { usd: 0.01, bucket: "quick" },
  wallet: { usd: 0.01, bucket: "quick" },
  dev: { usd: 0.08, bucket: "deep" },
});

const MAINNET_HINTS = [
  "eip155:8453",
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  "base-mainnet",
  "mainnet",
];

function joinUrl(base, path, query) {
  const u = new URL(path, base.replace(/\/+$/, "/") );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null && v !== "") u.searchParams.set(k, String(v));
    }
  }
  return u;
}

function looksMainnet(value) {
  const s = String(value || "").toLowerCase();
  if (!s) return false;
  if (s.includes("sepolia") || s.includes("devnet") || s.includes("testnet")) return false;
  return MAINNET_HINTS.some((h) => s.includes(h.toLowerCase()));
}

export class Nodetrail {
  /**
   * @param {object} [opts]
   * @param {string} [opts.baseUrl] Preview API origin. Set NODETRAIL_BASE_URL or pass baseUrl.
   * @param {typeof fetch} [opts.fetch] Injected fetch, for tests.
   * @param {boolean} [opts.pay] If true, attempt a payment only when allowTestnetPayment is also true.
   * @param {boolean} [opts.allowTestnetPayment] Required extra switch before any payment is attempted.
   * @param {Function} [opts.payHandler] Optional function(req, paymentRequired) => Promise<Response>.
   *        If omitted, a 402 is returned to the caller and no payment is sent.
   * @param {string} [opts.apiKey] Optional starter-API key (x-api-key). The starter API is built but off; this is unused unless that API is turned on later.
   */
  constructor(opts = {}) {
    this.baseUrl = String(opts.baseUrl || process.env.NODETRAIL_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetch = opts.fetch || globalThis.fetch;
    this.pay = Boolean(opts.pay);
    this.allowTestnetPayment = Boolean(opts.allowTestnetPayment);
    this.payHandler = opts.payHandler || null;
    this.apiKey = opts.apiKey || process.env.NODETRAIL_API_KEY || "";
  }

  async info() {
    return this.#get(SCAN_PATHS.info);
  }

  /** Quick token scan, preview price $0.01 testnet USDC. */
  async checkToken(address, extra = {}) {
    return this.#scan("token", { address, ...extra });
  }

  /** Deep / creator scan, preview price $0.08 testnet USDC. */
  async checkDev(address, extra = {}) {
    return this.#scan("dev", { address, ...extra });
  }

  /** Quick wallet scan, preview price $0.01 testnet USDC. */
  async checkWallet(address, extra = {}) {
    return this.#scan("wallet", { address, wallet: address, ...extra });
  }

  async #scan(kind, input) {
    const { address, mint, wallet, chain, name, symbol, description } = input || {};
    const target = address || mint || wallet;
    if (!target) {
      return {
        ok: false,
        preview: true,
        error: { code: "missing_address", message: "Pass a token mint, contract, or wallet address." },
      };
    }
    return this.#get(SCAN_PATHS[kind], {
      address: target,
      mint: mint || "",
      wallet: wallet || "",
      chain: chain || "",
      name: name || "",
      symbol: symbol || "",
      description: description || "",
    }, kind);
  }

  async #get(path, query, kind) {
    if (typeof this.fetch !== "function") {
      return {
        ok: false,
        preview: true,
        error: { code: "no_fetch", message: "No fetch function is available in this environment." },
      };
    }
    if (!this.baseUrl) {
      return {
        ok: false,
        preview: true,
        error: { code: "missing_base_url", message: "Set NODETRAIL_BASE_URL or pass baseUrl to the current testnet preview host." },
      };
    }
    const url = joinUrl(this.baseUrl, path, query);
    const headers = { Accept: "application/json" };
    if (this.apiKey) headers["x-api-key"] = this.apiKey;
    let res;
    try {
      res = await this.fetch(url, { method: "GET", headers });
    } catch (err) {
      return {
        ok: false,
        preview: true,
        error: {
          code: "network",
          message: "Could not reach the preview API. The x402 Preview may require a Vercel login, or the network may be blocked.",
          detail: String(err && err.message ? err.message : err),
        },
      };
    }
    const body = await this.#readBody(res);
    if (res.status === 402) {
      return this.#handle402(url, headers, body, res, kind);
    }
    if (!res.ok) {
      return {
        ok: false,
        preview: true,
        status: res.status,
        error: (body && body.error) || { code: "http_error", message: `Preview API returned HTTP ${res.status}.` },
        body,
      };
    }
    return body;
  }

  async #handle402(url, headers, body, res, kind) {
    const paymentRequired = res.headers.get("PAYMENT-REQUIRED") || res.headers.get("Payment-Required") || "";
    const base = {
      ok: false,
      preview: true,
      testnetOnly: true,
      paymentRequired: true,
      kind,
      price: kind ? PREVIEW_PRICES[kind] : undefined,
      error: (body && body.error) || {
        code: "payment_required",
        message: "This preview scan asks for testnet USDC. No payment was sent.",
      },
      paymentRequiredHeader: paymentRequired,
      body,
    };
    if (looksMainnet(paymentRequired) || looksMainnet(JSON.stringify(body || {}))) {
      return { ...base, error: { code: "mainnet_refused", message: "A mainnet payment was advertised. This client will not pay on mainnet." } };
    }
    const canPay = this.pay && this.allowTestnetPayment && typeof this.payHandler === "function";
    if (!canPay) {
      return {
        ...base,
        note: "Payment is off in this client. Set pay: true, allowTestnetPayment: true, and a testnet-only payHandler if you want to retry with x402 on testnet. Mainnet stays off.",
      };
    }
    try {
      const paid = await this.payHandler({ url: url.toString(), headers, kind }, paymentRequired);
      const paidBody = await this.#readBody(paid);
      return paidBody;
    } catch (err) {
      return { ...base, error: { code: "payment_failed", message: String(err && err.message ? err.message : err) } };
    }
  }

  async #readBody(res) {
    if (!res) return null;
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return { raw: text }; }
  }
}
