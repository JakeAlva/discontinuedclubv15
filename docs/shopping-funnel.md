# Shopping funnel

Started November 19, 2026. This uses Netlify Functions and Blobs, not Supabase or an advertising platform.

- `/funnel-admin.html` uses the existing `REVIEWS_ADMIN_KEY`. The key stays in page memory and is sent only to the authenticated report endpoint. Do not put it in a URL, source file or chat.
- Visitor analytics require an explicit opt-in. Do Not Track / Global Privacy Control disable collection. The privacy page can change the choice. No form values, addresses, names, emails, IP addresses, query strings or raw referrers enter the analytics store.
- One random tab session expires after 30 minutes idle or 24 hours total. This is a session measure, not a person count. Records are grouped by session-start UTC day; today's sessions can still progress. Article attribution is the first article seen in that session.
- Client events are constrained to known product IDs, article routes and event types. `checkout_opened` comes from successful live Checkout Session creation; it is not proof Stripe rendered on the customer's screen. `purchase` comes only from a signature-verified live, paid Stripe webhook. Free, unpaid and test transactions are excluded. Refunds are not subtracted from this gross paid figure.
- Session records use conditional writes and hashed Checkout Session IDs to deduplicate retries. A webhook analytics failure requests a retry after the existing inventory-idempotent processing. Checkout creation remains available if analytics storage fails.
- Production and preview namespaces are separate. The daily cleanup removes records older than approximately 90 days. Reports paginate storage, cap at 10,000 sessions, and ask for a shorter date range rather than silently returning partial totals.
- Counts are opt-in observations, not all traffic. Ad blockers, bots, cleared storage, different devices/tabs and failed event delivery affect coverage. Do not divide total Stripe sales by these sessions as an all-visitor conversion rate. Older sales are not retroactively attributed.

## Recommendation placement

`scripts/blog-commerce.mjs` contains nine curated article/product mappings based on November 18 traffic. Build-time markup retains real links and product images. Browser code reveals only products whose live inventory is confirmed positive. It hides sold-out or unverifiable recommendations and labels different-product alternatives honestly. Price uses the existing direct-discount calculation.

## Verification

Run `npm run build`, `node --test tests/*.test.mjs`, and `npm run price:audit`.

Local browser QA: `FUNNEL_PREVIEW=1 PREVIEW_BUILD=1 PORT=4175 npm run dev`. This uses synthetic inventory, isolated in-memory analytics, and disabled payment endpoints. It prints a local-only key. Do not treat preview activity as real sales. Production verification must not create live charges or test purchases.
