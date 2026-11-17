# Customer reviews

This feature uses the existing Netlify host, Netlify Functions, and Netlify Blobs.
It does not use Supabase, share another project's database, or send email.

## Data flow

- An administrator supplies a Stripe payment-intent reference on `/review-admin.html`.
- The server reads Stripe and requires a successful live payment, a paid completed
  Checkout session, and website source metadata. No payment or inventory is changed.
- The server generates a private random invitation, valid for 45 days. Only its hash
  is stored. The URL fragment keeps the token out of ordinary HTTP request URLs.
- The buyer submits product ratings and/or a separate company rating, with public
  display-name and publication consent. One conditional write accepts at most one
  submission per payment. Retrying or reissuing an invitation cannot bypass this.
- New submissions are private. Only approved, consented reviews are returned by
  the public endpoint. Counts and averages are calculated from those reviews.
- Moderation publishes or hides the original text. Critical reviews follow the same
  rules as positive ones. Hiding requires a reason unrelated to the star rating.

## Local testing

Run `REVIEW_PREVIEW=1 PORT=4174 npm run dev`. It uses a local-only disk adapter
inside ignored `.netlify/review-preview/`. The terminal
prints a sample invitation and local-only administrator key. Each server start
uses a separate demo store; refreshing the browser does not reset saved reviews.
No `.env` is loaded in this mode. Payment routes are disabled, inventory is local
sample data, and the sample invitation is explicitly labeled. Real payment
references cannot create local invitations.

Local tests cover persistence and the production SDK's HTTP contract with mocked
responses. The hosted storage check described below also passed on November 17,
2026; rerun it after storage-related changes. The v11.1.9 local Blobs emulator returned missing read ETags and
incomplete listings in this environment, so it is not used as a substitute for
that hosted test. The service fails closed when a read has no version/ETag.

Run `npm run build` followed by `npm test`. `node --test tests/reviews*.test.mjs`
runs focused security, privacy, purchase-verification, storage, and workflow tests.

## Production activation

1. Confirm the build and function runtime support Node 22.12 or newer (the installed
   Blobs SDK requirement), then deploy through the existing Netlify project. Functions receive Blobs credentials
   automatically; no new storage account or browser-side service key is needed.
2. Set `REVIEWS_ADMIN_KEY` to a cryptographically random value (at least 32 characters)
   in Netlify, scoped to Functions and production only. Keep it in a password manager.
   Never commit it or put it in a URL. Missing configuration fails closed.
   Redeploy after saving or changing the value so production functions receive it.
3. Ensure `PUBLIC_SITE_URL=https://discontinuedclub.com` and live Stripe read access
   are configured. Store isolation uses Netlify's trusted `context.deploy` object.
   Unlock `/review-admin.html` with that same key, not the Netlify account password,
   and run its storage check before issuing an invitation.
   It tests eight behaviors against hosted storage in a separate, randomly named
   `dc-reviews-check-v1-*` store. It never reads or changes customer review records
   or Stripe. Its clearly labeled synthetic record is retained hidden in that
   diagnostic store, not returned by any public review endpoint.
4. Open `/review-admin.html`, unlock it, and create an invitation for a verified paid
   website order only when the buyer is ready to review. This does not send email.
5. Send that private link to its buyer, not publicly. Reissuing invalidates the old
   link. Published reviews appear without a site rebuild.

The administrator key is held only in page memory and is cleared by Lock or reload.
Rate limits apply to the public and private functions. Preview deployments use a
different store and cannot issue live-order invitations. Do not use production
storage to test fabricated testimonials.

## Storage and limitations

Site-wide production store: `dc-reviews-v1-production`. New deploys preserve it.
Each payment has a hashed-key record containing private verification data, product
snapshots, hashed invitation, review, and moderation state. Conditional writes and
strong reads protect submissions and moderation against conflicting updates.
Public responses are explicitly projected and never include payment IDs, tokens,
emails, addresses, or pending/hidden reviews. No customer account is required.

This small-store implementation scans the records to calculate published totals.
Move to a dedicated Netlify database if review volume or reporting requires indexed
queries; Supabase is not required. Product reviews follow exact listing identities,
with explicit aliases for the known Winter Wonderland and Arctic Berry relistings.
Add deliberate aliases when equivalent products are relisted; do not merge reviews
across different flavors or formulations automatically.

Invitations expire after 45 days; stored records are not automatically deleted on
expiry. Removal/correction requests go to the store email. Hiding removes a review
from public responses immediately; permanent record removal remains a separate
authorized privacy operation in Netlify. There is no automatic review incentive,
email scheduler, or delivery-status assumption in this implementation.

## Verification (November 17, 2026)

The isolated browser test covered a buyer submission, the pending/public boundary,
publishing, separate 2-star product and 5-star company averages, persistence on
refresh, duplicate prevention, hiding, administrator lock, and a missing invitation.
The review form was checked at 1280px, 390px, and 320px widths without horizontal
overflow; the product image loaded. The automated suite passed 303 tests.

Commit `6800b9d` was deployed to production on Netlify's Node 22.23.5 runtime.
Deployment `6afcc4feda60a6a4796a9566` applied the production-only Functions admin
key. Unauthenticated admin requests returned 401; invalid invitations returned
404. No key values were committed or included in a URL.

The authenticated production storage check passed all eight checks: private
invitation, duplicate protection, saved submission, pending-review privacy,
moderation queue, separate ratings, public-data privacy, and hiding. Its synthetic
record stayed in the separate diagnostic store. The public endpoint returned zero
published reviews afterward.

A real paid website order was verified read-only through Stripe, and its private
invitation opened the purchased Voodoo Vanilla product, loaded the product image,
and displayed separate flavor and company review fields. The live form had no
horizontal overflow at 1280px. No customer review was submitted, no email was sent,
and no payments, inventory, or fulfillment records were changed. Private invitation
URLs and payment references are deliberately omitted from this document.
