# October 12 Campaign Refresh

Replaced the old Destined Rivals four-pack promotion with a Pokemon collection
campaign and refreshed the Liquid Death x Pop-Tarts artwork. Prices, quantities,
the jersey slide, and the Alani reserve slide are unchanged.

## Assets

These are AI-assisted advertising compositions, generated with the built-in
image generation tool using existing packaging and campaign references. They
are not replacements for the actual item photos on product detail pages.

| File under assets/images/campaign/scenes/ | Native dimensions | WebP bytes |
| --- | --- | --- |
| pokemon-arrivals-desktop.webp | 2004 x 785 | 456736 |
| pokemon-arrivals-mobile.webp | 1536 x 1024 | 628720 |
| liquid-carnage-desktop.webp | 1942 x 809 | 387530 |
| liquid-carnage-mobile.webp | 1536 x 1024 | 520180 |

WebP conversion uses Sharp quality 94 and effort 6 without resizing, cropping,
or artificial upscaling. Original generated PNGs remain in the Codex generated
images directory. The new source URLs avoid the old browser-cached artwork.

## Final Prompt Specifications

### Pokemon Desktop

Use case: ads-marketing. Create a premium, sharp product campaign in the visual
language of the Alani homepage slide. Show an Ascended Heroes six-pack booster
bundle and a Destined Rivals six-pack booster bundle, preserving the reference
packaging, proportions, and recognizable artwork. Place both upright boxes on
the right, fully in frame with breathing room. Leave the left 46 percent dark
and quiet for live webpage text. Use a charcoal tabletop with bold scarlet,
turquoise, and yellow diagonal paper-like background panels. Crisp commercial
studio lighting, clear edges and labels. No added headline, badges, prices,
invented product formats, or floating decorative effects.

### Pokemon Mobile

Adapt the approved Pokemon campaign to a 3:2 mobile image. Center both complete
boxes with generous margins and preserve their packaging, backdrop colors,
lighting, and sharp detail. No headline or additional text outside packaging.

### Liquid Death Desktop

Use case: ads-marketing. Create a premium, crisp Liquid Death x Pop-Tarts
Carnage campaign using the reference can and six-can carton. Position the
gold-topped can front-right and the blue carton behind-left, together in the
right-hand portion of the composition. Preserve the actual product identity:
Pop-Tarts Carnage, strawberry toaster pastry flavored iced tea, 43mg natural
caffeine, and 12 fl oz / 355ml can. Keep the left side deep blue and clear for
live page text. Use cobalt, scarlet, and yellow diagonal campaign panels over
a matte blue tabletop. Sharp studio detail, readable key packaging, full
product edges, no added slogans or prices.

### Liquid Death Mobile

Adapt the approved Liquid Death campaign to a 3:2 composition with the complete
can and six-pack carton centered and comfortably framed. Preserve the actual
packaging and campaign lighting/colors. No added headline or price.

## Integration

- HTML headline, supporting text, and CTA remain crawlable and crisp.
- Pokemon copy correctly says booster bundles, not 36-pack booster boxes.
- Both Pokemon links open the collectibles category with boxes grouped first.
- At 701-1000px, use the mobile composition beside the copy with contain sizing.
- At 700px and below, copy and a 3:2 image stack vertically.
- Dedicated image dimensions reserve space; the first image has high fetch
  priority and later slides remain lazy-loaded.
- Canonical homepage and existing sitemap location remain unchanged.
