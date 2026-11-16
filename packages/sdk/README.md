# @nodetrail/sdk

JavaScript client for the Nodetrail x402 **testnet preview** API.

- Not published to the public npm registry yet. Install from this repo.
- Payments default OFF.
- Mainnet payments are refused.
- Preview scans are not live chain reads.

```js
import { Nodetrail } from "@nodetrail/sdk";

const nt = new Nodetrail({ baseUrl: process.env.NODETRAIL_BASE_URL });
const info = await nt.info();
const token = await nt.checkToken("So11111111111111111111111111111111111111112");
// If the preview asks for payment, `token.paymentRequired` is true and no money is sent.
```

Optional testnet payment is opt-in only:

```js
const nt = new Nodetrail({
  baseUrl: process.env.NODETRAIL_BASE_URL,
  pay: true,
  allowTestnetPayment: true,
  payHandler: async (req, paymentRequiredHeader) => {
    // Your x402 testnet client goes here. Do not use mainnet keys or funds.
    throw new Error("not wired");
  },
});
```
