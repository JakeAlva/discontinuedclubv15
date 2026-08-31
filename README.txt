Discontinued Club storefront

This is a catalog-driven storefront for the current Discontinued Club eBay inventory. It includes:

- 48 current products across drinks, apparel, collectibles, and personal care
- lower direct prices with a matching eBay option on every listing
- a multi-item cart and Stripe-hosted Checkout
- $7.49 USPS Ground Advantage below $100 and free shipping at $100+
- a sold archive and journal content for search visibility
- Netlify Functions that validate products, quantities, and prices on the server
- signed Stripe webhooks that reduce direct inventory once per paid checkout session
- shipping, returns, privacy, and purchase-term pages

Local development

1. Install dependencies with `npm install`.
2. Add the test-only Stripe settings described in `STRIPE-SETUP.md` to an untracked `.env` file.
3. Run `npm run dev`.
4. Open http://127.0.0.1:4173/out-now.html.

The local server is bound to this computer only, refuses hidden files such as `.env`, and routes checkout through Stripe sandbox mode. The browser never receives the Stripe secret key.

Verification

- `npm test`
- `npm run price:audit`
- `npm run build`
- `npm run launch:audit:preview`

Run `npm run launch:audit` for the stricter production configuration check.

Do not use a live Stripe key until prices, shipping, tax obligations, deployment variables, and the webhook have all been reviewed.
