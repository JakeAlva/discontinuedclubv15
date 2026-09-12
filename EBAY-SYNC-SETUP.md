# Automated eBay Storefront Sync

The storefront includes a private eBay seller-sync engine. Production scheduling should be enabled only after its first dry run is reviewed.

## What the sync does

- Reads every active fixed-price listing from the authorized eBay seller account.
- Holds supported new listings for review. Approving specific IDs creates clean storefront and Google Merchant images from each listing's first eBay photo.
- Updates listing prices and shared quantities.
- Ends the matching eBay listing with the official `NotAvailable` reason when a direct sale uses the final unit.
- Removes ended or out-of-stock listings from the live catalog and Google Merchant feed.
- Rebuilds product pages, related-product links, the Merchant Center feed, and all product sitemaps.
- Preserves local categories, editorial descriptions, featured choices, shipping weights, tax codes, and custom artwork for existing products.
- Holds auctions, variation listings, non-USD listings, and listings without a usable photo for manual review instead of guessing.
- Refuses production changes if eBay returns zero active listings, more than five products would disappear at once, or an individual price would move more than 25 percent.

## Shared inventory behavior

Stripe metadata is the direct-store inventory ledger. The sync compares that ledger with eBay's previous and current available quantities so sales on either channel reduce the same shared stock. Once the eBay credentials are present in Netlify, the paid-order webhook immediately mirrors direct website sales to eBay; a scheduled job can remain the recovery path.

## One-time private setup

1. In the eBay Developers Program, create or open the production keyset for Discontinued Club.
2. Use eBay's OAuth user-consent flow while signed into the selling account to create a production refresh token with `https://api.ebay.com/oauth/api_scope`.
3. Store `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_REFRESH_TOKEN`, and `STRIPE_SECRET_KEY` as encrypted GitHub Actions repository secrets.
4. Store `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, and `EBAY_REFRESH_TOKEN` in Netlify's production environment to enable immediate eBay quantity updates after direct website checkout.
5. Run a read-only dry run, review additions/removals and quantity changes, and only then enable the recurring production job.

Never commit or paste credential values into source files, support messages, or screenshots.

## Local verification

With credentials supplied through environment variables:

```sh
npm run ebay:sync
```

That command is a dry run. It reads eBay and Stripe but changes nothing. Applying to live inventory requires both explicit locks:

```sh
npm run ebay:sync -- --apply --live
```

To approve reviewed new listings, name their eBay item IDs explicitly:

```sh
npm run ebay:sync -- --apply --live --approve-new=ITEM_ID,ITEM_ID
```
