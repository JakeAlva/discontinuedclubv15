# Pear Scare preorder batch

Approved November 19, 2026: 12 individual 12 fl oz cans, $7.99 each, payment at checkout, expected shipment November 30 subject to incoming delivery. No eBay listing or additional direct discount.

## Stock authority

Production claims live in the site-wide Netlify Blobs store `dc-preorders-v1-production`, under `bloom-pear-scare/2026-11-30/unit-0` through `unit-11`. Each can uses a conditional create/update. Paid claims remain sold; expired unpaid sessions become available again. Inventory reads reconcile Stripe session state even if an expiration webhook is missed. Regular items retain their existing Stripe inventory path.

`dc_stock=12` on the Stripe product is the batch ceiling/readiness marker, not the remaining preorder count. Do not infer remaining stock from that field or reset claims during catalog sync. Deploys share the production ledger; previews use a separate store.

A network failure with an uncertain Stripe outcome deliberately retains its claims. Before manually releasing a held claim without a session ID, locate the session using its reservation metadata and verify it is expired and unpaid (or establish that creation definitively failed). Never free a potentially payable or paid claim. Duplicate payment notifications cannot decrement twice.

## Arrival and fulfillment

The listing stops accepting preorders at midnight America/Chicago on November 30. It does not automatically declare the cans on hand. Confirm arrival, condition, best-by dates and remaining uncommitted quantity before converting to a regular listing. Preserve this batch ledger for paid orders and late webhook retries.

The 32 oz per-can shipping weight is a conservative packaged estimate consistent with existing 12 oz listings, not a measurement. Check actual packed weights before fulfillment. Notify affected customers promptly if the expected shipment date changes and provide cancellation/refund options. Refunds and fulfillment remain manual; neither is automatically performed by this feature.

Public share link: `/pear-scare`.
