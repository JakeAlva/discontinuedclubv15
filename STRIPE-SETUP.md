# Discontinued Club direct checkout

The storefront remains static and fast. Netlify Functions securely create Stripe Checkout Sessions, so the browser never controls final prices.

## Before any live products are created

1. Review the 48 direct prices with `npm run stripe:catalog`, then run `npm run price:audit`. The audit must pass before any live sync.
2. Confirm the current dynamic shipping tiers and the free-shipping rule at a $100 item subtotal.
3. Decide whether Stripe Tax should be enabled based on the states where the business is registered to collect sales tax. Set `STRIPE_TAX_REVIEWED=true` only after that review.

## Test-mode setup

Set these values in a local untracked `.env` or in Netlify environment variables. Never put a secret key in HTML, `assets/catalog.js`, or a committed file.

- `STRIPE_SECRET_KEY`: restricted Stripe test key with the minimum Products, Prices, Checkout Sessions, Payment Intents, and Customers permissions needed by this store
- `STRIPE_WEBHOOK_SECRET`: signing secret for the deployed webhook endpoint
- `STRIPE_AUTOMATIC_TAX`: `true` only after Stripe Tax is configured
- `STRIPE_TAX_REVIEWED`: `true` only after the store's registration and collection requirements have been reviewed
- `PUBLIC_SITE_URL`: `https://discontinuedclub.com`

Run `npm run stripe:catalog -- --apply` with a test key to create or update the 48 Stripe Products and one-time Prices. The script identifies products by eBay listing ID, so rerunning it updates the same catalog instead of duplicating products. It does not touch unrelated Stripe products.

Run `npm run dev` to serve the storefront and local checkout functions together at `http://127.0.0.1:4173`. The local server forces return URLs back to the local storefront, refuses hidden files such as `.env`, and must only be used with a test key.

Shipping is calculated by the trusted checkout function from packaged weight and item subtotal. It starts at $7.49, increases for heavier carts below $100, and creates a free shipping option at $100 or more, so no reusable Stripe Shipping Rate is required.

Configure the Stripe webhook endpoint as:

`https://discontinuedclub.com/.netlify/functions/stripe-webhook`

Listen for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

For each paid direct order, the signed webhook subtracts the purchased quantity from the Stripe Product's `dc_stock` metadata. The checkout session ID is saved on the product so a retry of the same Stripe event cannot subtract the same purchase twice. Stripe stock of zero blocks future direct checkout even if the static website has not yet been rebuilt.

The sandbox catalog and checkout flow have been verified with all 48 products. The completed test covered a paid-shipping order, the $100 free-shipping rule, Stripe's hosted payment page, and the storefront confirmation page. No live products or payments were changed.

## Live-mode guard

The sync script refuses live keys unless `--live` is explicitly supplied:

`npm run stripe:catalog -- --apply --live`

Do this only after a complete test checkout, price review, shipping review, and tax configuration.

Run `npm run launch:audit:preview` while testing. Before production, run `npm run launch:audit`; it requires a live Stripe key, live webhook signing secret, canonical production URL, and an acknowledged tax review. The audit prints configuration status but never prints secret values.

## Fee audit assumptions

The current audit starts conservatively with eBay's 13.25% category rate plus $0.40, Stripe's standard domestic-card rate of 2.9% plus $0.30, and Stripe Tax Basic's possible 0.5%. It assumes eBay shipping revenue of $7.49 and the same postage cost on both channels. The verified recent sports sale was charged 13.6%, which leaves more margin than the audit assumes. Actual eBay shipping charges, promoted-listing fees, international cards, disputes, and a different postage label can change the result.

## Inventory warning

Stripe does not automatically reduce an eBay listing's quantity, and an eBay sale does not update Stripe. Until an inventory database and eBay API sync are added, every sale must trigger an immediate manual update on the other channel and a website catalog update when a listing sells out. Direct website payments do reduce Stripe's `dc_stock` through the signed webhook, and Stripe is the final stock check before direct checkout.

The webhook's session marker protects against Stripe retrying the same event. Because stock metadata is not a transactional inventory database, simultaneous purchases in separate sessions remain a low-volume edge case that must be watched in Stripe after launch.
