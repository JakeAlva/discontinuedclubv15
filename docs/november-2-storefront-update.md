# November 2, 2026 Storefront Update

## Inventory

- Read all 78 active rows in signed-in eBay Seller Hub, across both pages.
- Exact item prices and available listing units are recorded in `data/ebay-inventory-update-2026-11-02.json` (132 listing units).
- Added Voodoo Vanilla 8.4 oz single can, item 407329572793, and Ruby Apple 12 oz single can, item 407332173468. Both are $12.99 eBay offers.
- Reduced Witch's Brew Mini four-pack availability to 2 and Winter Wonderland single-can availability to 3.
- New products use eBay checkout; no Stripe catalog or eBay listing mutations were made. Existing direct-price rules are unchanged.
- No printed dates or complete ingredient/allergen panels were verified for the additions.

## Campaign Assets

- `assets/images/campaign/scenes/alani-pair-desktop.webp`: 2172 x 724.
- `assets/images/campaign/scenes/alani-pair-mobile.webp`: 1024 x 1536.
- `assets/images/journal/alani-pair-arrivals-2026.webp`: 1774 x 887.
- Generated with the built-in image tool using the two actual eBay listing photos as packaging references. Prompt direction: pink photoreal studio, complete shorter Voodoo Vanilla and taller Ruby Apple cans, flavor-reference props, no extra text. Desktop leaves negative space on the left; portrait leaves it above the cans. Optimized as WebP without cropping.
- Product pages retain the listing photos, not the campaign artwork. The article identifies its campaign image as AI-made and the two offers as separate cans.

## Journal

- `alani-voodoo-vanilla-ruby-apple-now-available`: first-party availability update, no exact stock totals.
- `dutch-bros-holiday-menu-2026`: independently written news based on the official November 1 announcement, reviewed November 2. Official image credited to Dutch Bros.
- Updated three older Alani reports to link to live offers, retaining their original publication dates and setting modification dates to November 2.
- Regenerated product pages, related recommendations, journal pagination, index and sitemaps using existing scripts.

## Verification

- Build and 247 automated tests passed, including checkout rejection tests that do not contact Stripe.
- Inspected homepage at 320, 390, 600, 768, 1440 and 1920 px widths in the in-app browser.
- Verified both hero buttons, separate eBay checkout destinations, loaded images and no document-width overflow on checked phone layouts.
- Inspected both new articles on mobile and desktop.
