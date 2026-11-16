import { test } from "node:test";
import assert from "node:assert/strict";
import { Nodetrail } from "../src/index.js";
const TEST_BASE = "https://preview.test.example";

test("refuses to call without an address", async () => {
  const nt = new Nodetrail({ fetch: async () => { throw new Error("should not fetch"); } });
  const out = await nt.checkToken("");
  assert.equal(out.ok, false);
  assert.equal(out.error.code, "missing_address");
});

test("returns info JSON from a mock preview", async () => {
  const nt = new Nodetrail({
    baseUrl: TEST_BASE,
    fetch: async (url) => {
      assert.equal(String(url).startsWith(TEST_BASE), true);
      assert.equal(String(url).includes("/api/x402/v1/info"), true);
      return new Response(JSON.stringify({ ok: true, preview: true, testnetOnly: true, live: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  const out = await nt.info();
  assert.equal(out.ok, true);
  assert.equal(out.preview, true);
  assert.equal(out.live, false);
});

test("does not pay on HTTP 402 when pay is off", async () => {
  let paid = false;
  const nt = new Nodetrail({
    baseUrl: TEST_BASE,
    pay: false,
    allowTestnetPayment: false,
    payHandler: async () => { paid = true; throw new Error("should not pay"); },
    fetch: async () => new Response(JSON.stringify({ ok: false, error: { code: "payment_required" } }), {
      status: 402,
      headers: { "PAYMENT-REQUIRED": "testnet-demo", "Content-Type": "application/json" },
    }),
  });
  const out = await nt.checkToken("So11111111111111111111111111111111111111112");
  assert.equal(out.paymentRequired, true);
  assert.equal(paid, false);
  assert.equal(out.price.usd, 0.01);
});

test("refuses a 402 that looks like mainnet even if pay is on", async () => {
  let paid = false;
  const nt = new Nodetrail({
    baseUrl: TEST_BASE,
    pay: true,
    allowTestnetPayment: true,
    payHandler: async () => { paid = true; return new Response("{}"); },
    fetch: async () => new Response(JSON.stringify({ network: "eip155:8453" }), {
      status: 402,
      headers: { "PAYMENT-REQUIRED": "eip155:8453", "Content-Type": "application/json" },
    }),
  });
  const out = await nt.checkDev("So11111111111111111111111111111111111111112");
  assert.equal(out.error.code, "mainnet_refused");
  assert.equal(paid, false);
});
