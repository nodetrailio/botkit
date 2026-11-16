# x402 Bazaar listing draft

Official docs: [Bazaar (Discovery Layer)](https://docs.x402.org/extensions/bazaar).

Nodetrail is **not listed** in the x402 Bazaar yet.

Official docs say listing is free. You add the `bazaar` extension to the route’s payment-required response, then complete at least one successful payment settlement through the facilitator you want to appear in. Nodetrail will list **testnet only** (Base Sepolia and Solana devnet) until mainnet payments ship. Mainnet listing stays off.

The testnet preview already declares a bazaar discovery extension on its 402 responses. A testnet settlement that would let a facilitator index the routes has not been completed.

`/api/x402/v1/info` is free and should not be listed as a payable resource.

See `route-extension.json` for the extension payload shape. Point any listing at a testnet preview host only. Never use a production host until a production x402 ship is separately approved.
