import { rehabGreenTeaSeptemberReport } from './rehab-green-tea-update.mjs';
import { whitePineappleReport } from './white-pineapple-report.mjs';
import { aussieLemonadeReport } from './aussie-lemonade-report.mjs';
import { rehabStrawberryLemonadeReport } from './rehab-strawberry-lemonade-report.mjs';
import { cafeLatteReport } from './cafe-latte-report.mjs';
import { newSodaRumorsReport } from './new-soda-rumors-report.mjs';
import { drinkFlavorWatchReport } from './drink-flavor-watch-report.mjs';
import { falloutVaultDwellerReport } from './fallout-vault-dweller-report.mjs';
import { oreoFlavorVoteReport } from './oreo-flavor-vote-report.mjs';
import { sevenUpMiamiViceReport } from './seven-up-miami-vice-report.mjs';

const redBullUsEditions = 'https://www.redbull.com/us-en/energydrink/questions/red-bull-editions';
const redBullCuts = 'https://sporked.com/article/4-discontinued-red-bull-flavors-2026/';
const redBullAppleUs = 'https://www.redbull.com/us-en/energydrink/products/red-bull-apple-edition';
const redBullAppleReturn = 'https://www.prnewswire.com/news-releases/red-bull-brings-back-fan-favorite-fuji-apple--ginger-flavor-permanently-as-red-bull-apple-edition-302864340.html';
const redBullFujiLaunch = 'https://www.prnewswire.com/news-releases/red-bull-reveals-the-new-red-bull-winter-edition-fuji-apple--ginger-302601938.html';
const redBullAppleSugarfreeGb = 'https://www.redbull.com/gb-en/energydrink/products/red-bull-apple-edition-sugarfree';
const monsterCatalog = 'https://www.monsterenergy.com/en-us/energy-drinks/';
const monsterFiling = 'https://www.sec.gov/Archives/edgar/data/865752/000110465926020831/mnst-20251231x10k.htm';
const monsterCuts = 'https://sporked.com/article/monster-energy-discontinued-2026/';
const monsterRumor = 'https://www.reddit.com/r/monsterenergy/comments/1wac5x6/bad_news_all_there_are_3_flavors_being/';

export const reports = [
  {
    slug: 'is-red-bull-blue-edition-blueberry-discontinued',
    modifiedDate: '2026-09-21',
    brand: 'Red Bull', product: 'Red Bull Blue Edition Blueberry', theme: 'blue', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 9,
    title: 'Is Red Bull Blue Edition Blueberry discontinued?', seoTitle: 'Is Red Bull Blueberry Discontinued in the U.S.? 2026 Status',
    description: 'Yes. Red Bull Blue Edition Blueberry was discontinued in the United States in 2026. See the U.S. evidence, remaining inventory, and international context.',
    deck: 'Yes. The original Blue Edition Blueberry has left the United States lineup. It can still appear as old American stock or a current foreign-market product, but its U.S. status is discontinued.',
    answerHeading: 'Yes. Red Bull Blue Edition Blueberry is discontinued in the United States.',
    answer: 'Red Bull removed the original blueberry edition from its current U.S. Editions range, and 2026 discontinuation reporting identified it among four U.S. products being cut. Red Bull still sells a blueberry Blue Edition in some other countries, but this journal uses U.S. marketing and distribution as the deciding status.',
    sidebar: 'Removed from the current U.S. Editions range in 2026; foreign-market availability does not change the U.S. answer.', evidenceGrade: 'High', evidenceNote: 'Current official U.S. lineup plus specific 2026 discontinuation reporting.',
    image: 'assets/images/journal/red-bull-blueberry.webp', imageAlt: 'One Red Bull Blue Edition Blueberry 12 ounce can', caption: 'One original U.S. Blue Edition Blueberry can previously sold by Discontinued Club. Our four-pack is currently sold out.',
    cardCopy: 'Yes. The original blueberry edition left Red Bull’s U.S. lineup in 2026, although foreign-market cans can still appear online.',
    sections: [
      { id: 'us-evidence', heading: 'What confirms the U.S. discontinuation?', toc: 'U.S. evidence', paragraphs: [
        'Red Bull’s current U.S. Editions page functions as the clearest public lineup check. It names the Editions being marketed nationally and no longer includes the original Blue Edition Blueberry. Absence alone can be ambiguous, but it becomes much stronger when paired with the 2026 discontinuation report naming Blueberry directly.',
        'Sporked reported that an internal Red Bull announcement identified four U.S. cuts for early 2026: Blue Edition Blueberry, Green Edition Curuba Elderflower, Sugarfree Red Edition Watermelon, and Sugarfree Amber Edition Strawberry Apricot. The official U.S. lineup now reflects those removals. Together, the reported notice and the changed catalog support a discontinued conclusion rather than a temporary shortage.'
      ]},
      { id: 'international', heading: 'Why can Blueberry still be available outside the U.S.?', toc: 'International availability', paragraphs: [
        'Red Bull manages Editions country by country. Its Australian site has continued to present Blue Edition with the taste of blueberry, demonstrating that the formula did not disappear worldwide. An imported can may therefore be newly produced even though the equivalent U.S. product is discontinued.',
        'That international availability is useful context, but it does not make the product current in America. A shopper in the United States cannot treat foreign production as normal domestic distribution. Country labeling, metric volume, nutrition facts, language, and importer information help distinguish an international can from remaining U.S. stock.'
      ]},
      { id: 'lookalikes', heading: 'Blue Edition, Sea Blue, and Iced Edition are different drinks', toc: 'Similar editions', paragraphs: [
        'The current U.S. range includes other blue or berry-oriented products, which can make search results misleading. Sea Blue Edition is Juneberry. The Iced Edition has used a blueberry-led profile with vanilla and eucalyptus notes. Neither is the original Blue Edition Blueberry simply because the package or flavor description uses blue language.',
        'Retail pages sometimes reuse old images, merge reviews, or shorten several products to “blue Red Bull.” The deciding detail is the exact Edition and flavor printed on the can. Original Blue Edition and the word Blueberry together identify the product covered by this report.'
      ]},
      { id: 'remaining-stock', heading: 'Why are U.S. Blueberry cans still for sale?', toc: 'Remaining stock', paragraphs: [
        '<strong>Store availability update, September 21, 2026:</strong> Discontinued Club has sold its last Blue Edition Blueberry four-pack and now has zero packs available to purchase. The <a href="sold/red-bull-blue-edition-blueberry-4-pack-407203102419.html">sold-out listing archive</a> remains available for reference. No restock date has been announced.',
        'Discontinuation stops future normal distribution; it does not erase inventory already in stores, warehouses, or private collections. Cases can surface months later, and specialty sellers may intentionally hold scarce cans. Marketplace availability therefore tells us that units remain, not that Red Bull restarted U.S. production.',
        'Condition and provenance matter more as the supply ages. Buyers should confirm whether a listing is U.S. old stock or a current import, whether the cans are full, and whether the photograph shows the actual items. A four-pack listing should show and describe four cans rather than use a generic single-can image.'
      ]}
    ],
    faq: [
      { question: 'Is Red Bull Blue Edition Blueberry discontinued in the U.S.?', answer: 'Yes. It left the current U.S. Editions lineup in 2026 and was named in specific U.S. discontinuation reporting.' },
      { question: 'Is Red Bull Blueberry discontinued worldwide?', answer: 'No. Red Bull has continued to list a blueberry Blue Edition in some foreign markets, including Australia.' },
      { question: 'Is Sea Blue Edition the same as Blueberry?', answer: 'No. Sea Blue Edition is Juneberry, not the original Blue Edition Blueberry.' },
      { question: 'Can old U.S. cans still be purchased?', answer: 'Yes. Remaining retailer inventory and collector stock can remain available after normal U.S. distribution ends.' }
    ],
    sources: [
      { label: 'Red Bull U.S.: current Red Bull Editions', url: redBullUsEditions, note: 'reviewed September 11, 2026' },
      { label: 'Sporked: four Red Bull flavors discontinued for 2026', url: redBullCuts, note: 'reporting on an internal U.S. announcement' },
      { label: 'Red Bull Australia: Blue Edition Blueberry', url: 'https://www.redbull.com/au-en/energydrink/products/red-bull-blue-edition', note: 'international context reviewed September 11, 2026' }
    ]
  },
  {
    slug: 'is-monster-ultra-watermelon-discontinued',
    modifiedDate: '2026-09-21',
    brand: 'Monster Energy', product: 'Monster Ultra Watermelon', theme: 'red', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 9,
    title: 'Is Monster Ultra Watermelon discontinued?', seoTitle: 'Is Monster Ultra Watermelon Discontinued? 2026 U.S. Status',
    description: 'Yes. Monster Ultra Watermelon was discontinued from U.S. distribution in 2026. See the retailer-reset evidence, catalog conflict, and remaining-stock guidance.',
    deck: 'Yes. Ultra Watermelon was included on a major retailer’s discontinued-SKU list for 2026. Monster still leaves the flavor on broad web and corporate catalogs, so this report explains why distribution evidence carries the U.S. answer.',
    answerHeading: 'Yes. Monster Ultra Watermelon is discontinued in U.S. distribution.',
    answer: 'A major retailer’s 2026 discontinued-SKU list identified Ultra Watermelon as a cut, and real-world replenishment has contracted accordingly. Monster’s public flavor directory and 2025 corporate filing still name the product, but those broad catalogs also retain products after distribution decisions. Remaining cases are sell-through inventory, not evidence that the cut was reversed.',
    sidebar: 'A retailer-reset-confirmed U.S. cut for 2026, despite legacy Monster catalog pages.', evidenceGrade: 'High', evidenceNote: 'Specific major-retailer SKU reset corroborated by sustained distribution changes.',
    image: 'assets/images/journal/monster-ultra-watermelon.webp', imageAlt: 'One Monster Energy Ultra Watermelon 16 ounce can', caption: 'One Ultra Watermelon can previously sold by Discontinued Club. Our single can is currently sold out.',
    cardCopy: 'A major U.S. retailer reset placed Ultra Watermelon among Monster’s 2026 cuts, even while old catalog pages remain online.',
    sections: [
      { id: 'retailer-reset', heading: 'What supports the 2026 discontinuation?', toc: 'Retailer reset', paragraphs: [
        'Sporked reported Ultra Watermelon from a major retailer’s discontinued-SKU list alongside Monster Reserve Peaches N’ Crème and the outgoing Reserve Orange Dreamsicle format. A retailer reset sheet is more specific than a temporary out-of-stock message because it tells stores not to plan continued assortment for the item.',
        'The conclusion is also consistent with the way Ultra Watermelon has shifted from ordinary multipacks and cooler sets into remaining cases and specialty listings. No single empty shelf proves discontinuation, but a named national reset followed by reduced replenishment creates a strong distribution record.'
      ]},
      { id: 'catalog-conflict', heading: 'Why does Monster still list Ultra Watermelon?', toc: 'Catalog conflict', paragraphs: [
        'Monster’s U.S. web directory still exposes an Ultra Watermelon page, and the company’s 2025 Form 10-K listed the flavor among a very broad portfolio. Those sources prove that the product was part of the company catalog at the end of 2025; they do not prove that every listed SKU continued through the 2026 reset.',
        'Brand websites often preserve searchable pages for old products, and annual filings are historical snapshots with legal and trademark purposes. When a dated retailer decision conflicts with a page that has no visible update history, the distribution evidence is more useful for answering whether Americans can expect routine new stock.'
      ]},
      { id: 'timing', heading: 'When did Ultra Watermelon disappear?', toc: 'Timing', paragraphs: [
        '<strong>Store availability update, September 21, 2026:</strong> Discontinued Club has sold its last Ultra Watermelon single can and now has zero cans available to purchase. The <a href="sold/monster-energy-ultra-watermelon-407207453659.html">sold-out listing archive</a> remains available for reference. No restock date has been announced.',
        'The 2026 reporting described the cut as part of early-year assortment changes. That does not create one universal last-sale date. Distribution centers, convenience chains, grocery stores, and online warehouses sell through at different speeds, sometimes keeping a discontinued flavor visible for months.',
        'A can found later in 2026 can be genuine domestic stock produced before the transition. The relevant question is whether the store can keep ordering newly replenished cases, not whether one unit remains somewhere in the country.'
      ]},
      { id: 'replacement', heading: 'Did another Monster replace Ultra Watermelon?', toc: 'Replacements', paragraphs: [
        'Monster continually rotates zero-sugar Ultra flavors and multipack assortments. New launches take physical shelf slots, but a newer fruit flavor should not be described as the same drink. Ultra Watermelon’s candy-like watermelon profile and textured red can are specific to this SKU.',
        'Fans looking for a substitute should compare flavor descriptions rather than package color. Collectors looking for Ultra Watermelon should verify that the listing is the full 16-ounce U.S. can and not a foreign version, an empty display can, or a mixed pack using an old promotional image.'
      ]}
    ],
    faq: [
      { question: 'Is Monster Ultra Watermelon discontinued in the U.S.?', answer: 'Yes. A major retailer’s 2026 discontinued-SKU list identified it as a U.S. cut.' },
      { question: 'Why is it still on Monster’s website?', answer: 'Monster’s broad catalog retains product pages that can outlast distribution changes. The page does not establish routine 2026 replenishment.' },
      { question: 'Can stores still have it?', answer: 'Yes. Existing cases can continue selling after a SKU is removed from future assortment plans.' },
      { question: 'Was every watermelon Monster discontinued?', answer: 'No. This report covers the zero-sugar Ultra Watermelon SKU specifically.' }
    ],
    sources: [
      { label: 'Sporked: three Monster energy drinks discontinued in 2026', url: monsterCuts, note: 'based on a major retailer discontinued-SKU list' },
      { label: 'Monster Energy U.S.: all energy drink flavors', url: monsterCatalog, note: 'legacy catalog conflict reviewed September 11, 2026' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'portfolio snapshot filed February 27, 2026' }
    ]
  },
  {
    slug: 'is-monster-reserve-peaches-n-creme-discontinued',
    brand: 'Monster Energy', product: 'Monster Reserve Peaches N’ Crème', theme: 'peach', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 9,
    title: 'Is Monster Reserve Peaches N’ Crème discontinued?', seoTitle: 'Is Monster Reserve Peaches N’ Crème Discontinued? 2026 Status',
    description: 'Yes. Monster Reserve Peaches N’ Crème was discontinued in the United States for 2026. See the retail reset evidence and how it differs from Peachy Keen.',
    deck: 'Yes. Peaches N’ Crème was placed on a major retailer’s discontinued list for 2026. Unlike the Reserve Orange Dreamsicle transition, no direct replacement preserves this creamy full-sugar peach product.',
    answerHeading: 'Yes. Monster Reserve Peaches N’ Crème is discontinued in the United States.',
    answer: 'The Reserve Peaches N’ Crème SKU was named in a major retailer’s 2026 discontinuation reset. Monster’s broad web catalog and year-end filing can still surface the name, but expected U.S. replenishment has ended. Ultra Peachy Keen remains a different zero-sugar product, not a continuation of this Reserve formula.',
    sidebar: 'A 2026 U.S. retailer-reset cut with no like-for-like replacement announced.', evidenceGrade: 'High', evidenceNote: 'Named major-retailer SKU discontinuation and subsequent distribution pattern.',
    image: 'assets/images/journal/monster-reserve-peaches-creme.webp', imageAlt: 'One Monster Reserve Peaches N Creme 16 ounce can', caption: 'One Reserve Peaches N’ Crème can from Discontinued Club inventory.',
    cardCopy: 'The creamy, full-sugar peach Reserve flavor was removed in the 2026 reset and has no direct replacement.',
    sections: [
      { id: 'confirmation', heading: 'What confirms Peaches N’ Crème was cut?', toc: 'Confirmation', paragraphs: [
        'The strongest public evidence is the discontinued-SKU list from a major retailer reported by Sporked in December 2025. Peaches N’ Crème was identified by name as one of the products leaving in the 2026 reset, not merely described as difficult to find.',
        'Store assortment changes do not happen everywhere on the same day, but they determine whether a product keeps receiving ordinary shelf space and replenishment. As the reset took effect, remaining cases increasingly moved through isolated stores, online sellers, and collector channels.'
      ]},
      { id: 'monster-pages', heading: 'Why old Monster references are not a relaunch', toc: 'Legacy references', paragraphs: [
        'Monster’s broad product directory has continued to expose Reserve Peaches N’ Crème, and the company’s Form 10-K listed it in the portfolio as of December 31, 2025. Both are real sources, but neither documents the post-year-end retailer reset or guarantees current national distribution.',
        'A brand page becomes evidence of a return when it is paired with new production, renewed distributor orders, and broad retail placement. Without those signals, an unchanged page is best treated as a legacy catalog record rather than proof that the discontinuation report was wrong.'
      ]},
      { id: 'peachy-keen', heading: 'Is Ultra Peachy Keen the same drink?', toc: 'Peachy Keen comparison', paragraphs: [
        'No. Ultra Peachy Keen is a zero-sugar Ultra flavor with its own formula and positioning. Reserve Peaches N’ Crème was a full-sugar drink built around a richer peaches-and-cream profile. Both involve peach, but they are not interchangeable SKUs.',
        'That distinction matters in search results because a retailer may suggest Peachy Keen as an alternative. A replacement recommendation is not evidence that Peaches N’ Crème continues under a new can. The words RESERVE and PEACHES N’ CRÈME identify the discontinued product.'
      ]},
      { id: 'reserve-line', heading: 'What happened to the Monster Reserve line?', toc: 'Reserve line', paragraphs: [
        'The 2026 reset affected more than one Reserve item. Peaches N’ Crème ended, while the Reserve Orange Dreamsicle version gave way to a revised standard Monster Orange Dreamsicle. Those outcomes show why each flavor and format needs its own report.',
        'It is tempting to label an entire family discontinued, but product lines can unwind unevenly across countries and retailers. This article makes the narrower, supportable claim: the U.S. Reserve Peaches N’ Crème SKU has been discontinued.'
      ]}
    ],
    shop: { heading: 'Remaining Peaches N’ Crème cans', copy: 'Discontinued Club currently lists two full 16-fluid-ounce Reserve Peaches N’ Crème cans with the exact package shown.', href: 'products/monster-reserve-peaches-n-creme-2-pack-407205596661.html', cta: 'View the Peaches N’ Crème pair' },
    faq: [
      { question: 'Is Monster Reserve Peaches N’ Crème discontinued?', answer: 'Yes. It was identified on a major retailer’s discontinued-SKU list for the 2026 U.S. reset.' },
      { question: 'Is Ultra Peachy Keen the replacement?', answer: 'It is the closest current peach option, but it is a different zero-sugar product and not the same formula.' },
      { question: 'Why is the old product page still visible?', answer: 'Broad catalogs and indexed pages can remain online after replenishment decisions change.' },
      { question: 'Is Peaches N’ Crème still sold in other countries?', answer: 'Foreign availability can differ and may include remaining or later-arriving stock. This report’s status is U.S.-specific.' }
    ],
    sources: [
      { label: 'Sporked: three Monster energy drinks discontinued in 2026', url: monsterCuts, note: 'names Reserve Peaches N’ Crème' },
      { label: 'Monster Energy U.S.: all energy drink flavors', url: monsterCatalog, note: 'catalog conflict reviewed September 11, 2026' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'portfolio snapshot filed February 27, 2026' }
    ]
  },
  {
    slug: 'is-monster-reserve-orange-dreamsicle-discontinued',
    brand: 'Monster Energy', product: 'Monster Reserve Orange Dreamsicle', theme: 'orange', statusKey: 'format', statusLabel: 'Old version discontinued', lane: 'U.S. package and formula report', readTime: 9,
    title: 'Is Monster Reserve Orange Dreamsicle discontinued?', seoTitle: 'Is Monster Reserve Orange Dreamsicle Discontinued? 2026 Change',
    description: 'The Monster Reserve Orange Dreamsicle version was discontinued in 2026, but an updated standard Monster Orange Dreamsicle keeps the flavor concept alive.',
    deck: 'The Reserve can and formula are discontinued. Orange Dreamsicle continues as a revised standard Monster product, so the exact old version is gone while the broader orange-cream flavor survives.',
    answerHeading: 'The Reserve version is discontinued, but Orange Dreamsicle was reformulated and relaunched.',
    answer: 'A major retailer’s 2026 reset removed Monster Reserve Orange Dreamsicle. Monster introduced a standard Orange Dreamsicle in a slightly different full-sugar format, so “the flavor is gone” is too broad. The correct collector answer is that the Reserve package and formula shown here are discontinued.',
    sidebar: 'Reserve can and formula ended; a revised standard Orange Dreamsicle remains current.', evidenceGrade: 'High', evidenceNote: 'Retailer cut paired with a documented replacement product.',
    image: 'assets/images/journal/monster-reserve-orange-dreamsicle.webp', imageAlt: 'One Monster Reserve Orange Dreamsicle can', caption: 'The outgoing Reserve Orange Dreamsicle package.', imageCredit: 'My American Shop product packshot',
    cardCopy: 'The black Reserve can and its formula ended, but Monster relaunched Orange Dreamsicle outside the Reserve line.',
    sections: [
      { id: 'two-answers', heading: 'Why this question has two correct answers', toc: 'Two-part answer', paragraphs: [
        'Someone asking about the exact black Monster Reserve Orange Dreamsicle can should be told yes: that product was discontinued in the 2026 assortment reset. Someone asking whether Monster still sells an orange-and-cream flavor should be told no: a revised standard Orange Dreamsicle continues the concept.',
        'That is not wordplay. Product lines, formulas, and package identities matter to collectors and to people who preferred the older drink. A brand can preserve a familiar flavor name while ending the exact version customers remember.'
      ]},
      { id: 'change', heading: 'What changed in 2026?', toc: 'The 2026 change', paragraphs: [
        'The major-retailer discontinued-SKU information reported by Sporked named Reserve Orange Dreamsicle among the outgoing products. The same report explained that Orange Dreamsicle would live on in a new, slightly different full-sugar format already reaching shelves.',
        'Monster’s current corporate portfolio also distinguishes Monster Energy Orange Dreamsicle from Monster Reserve Orange Dreamsicle. Seeing both names in a broad filing reflects the transition period; it does not make the outgoing Reserve can current indefinitely.'
      ]},
      { id: 'collectors', heading: 'Why the Reserve can is now collectible', toc: 'Collector difference', paragraphs: [
        'The old version has the black Reserve package, orange claw mark, and Reserve line naming. The newer product changes the line identity and can artwork. Formula commentary from retailers and fans also indicates the replacement is not simply the same liquid under identical branding.',
        'Collectors should request a photo of the exact can because marketplace titles often shorten both products to “Monster Orange Dreamsicle.” The word RESERVE on the front is the fastest way to identify the discontinued version covered here.'
      ]},
      { id: 'status-update', heading: 'What would change this report?', toc: 'Future updates', paragraphs: [
        'A limited reissue of the Reserve can, a true formula return, or a renewed U.S. Reserve-line launch would justify updating the package status. Continued sales of the new standard Orange Dreamsicle do not change it because that is already part of the conclusion.',
        'International Reserve inventory may also remain available on a different schedule. That is useful for collectors but does not reverse the end of the U.S. Reserve version.'
      ]}
    ],
    faq: [
      { question: 'Is Monster Reserve Orange Dreamsicle discontinued?', answer: 'Yes. The Reserve-branded can and version were discontinued in the 2026 U.S. reset.' },
      { question: 'Is Orange Dreamsicle flavor completely gone?', answer: 'No. Monster relaunched Orange Dreamsicle as a revised standard full-sugar product.' },
      { question: 'Are the old and new cans the same product?', answer: 'No. The line, packaging, and reported formula are different enough to track them separately.' },
      { question: 'How do I identify the discontinued can?', answer: 'Look for the black package and the word Reserve beneath the Monster claw logo.' }
    ],
    sources: [
      { label: 'Sporked: three Monster energy drinks discontinued in 2026', url: monsterCuts, note: 'documents the Reserve exit and revised replacement' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'shows the transition-era portfolio naming' },
      { label: 'Monster Energy U.S.: current flavor directory', url: monsterCatalog, note: 'reviewed September 11, 2026' }
    ]
  },
  {
    slug: 'is-monster-ultra-red-discontinued',
    brand: 'Monster Energy', product: 'Monster Ultra Red', theme: 'red', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 10,
    title: 'Is Monster Ultra Red discontinued?', seoTitle: 'Is Monster Ultra Red Discontinued in the U.S.? 2026 Status',
    description: 'Yes. Monster Ultra Red has been discontinued from normal U.S. distribution, although Monster and retailer legacy pages still show it and remaining stock can surface.',
    deck: 'Yes, for the United States. Ultra Red has left normal U.S. distribution, even though Monster’s legacy product page and pockets of remaining retail inventory make the status look contradictory.',
    answerHeading: 'Yes. Monster Ultra Red is discontinued from normal U.S. distribution.',
    answer: 'U.S. distributor and retail phase-out reporting places Ultra Red among the flavors cut from routine American distribution. Monster still publishes an active-looking product page, and some retailers continue to show stock, but those pages and remaining cases do not establish a nationwide relaunch. International Ultra Red can also remain current outside the United States.',
    sidebar: 'U.S. distribution ended; legacy pages, old domestic stock, and imports remain visible.', evidenceGrade: 'Moderate to high', evidenceNote: 'Consistent distributor phase-out reports, with conflicting legacy brand and retail pages disclosed.',
    image: 'assets/images/journal/monster-ultra-red.webp', imageAlt: 'One Monster Energy Ultra Red 16 ounce can', caption: 'One U.S. Ultra Red can from Discontinued Club inventory.',
    cardCopy: 'Ultra Red is discontinued in normal U.S. distribution, but stale brand pages, isolated restocks, and imports keep the question confusing.',
    sections: [
      { id: 'why-yes', heading: 'Why the U.S. answer is yes despite an active product page', toc: 'Why the answer is yes', paragraphs: [
        'Monster’s Ultra Red page still describes a 16-ounce mixed-berry drink and offers shop and store-finder actions. That page proves the product existed and preserves useful label information. It does not show a last-updated date or demonstrate that U.S. distributors are again replenishing it nationally.',
        'Distributor reports and the sustained disappearance of ordinary U.S. shelf placement point to a phase-out rather than a simple regional gap. This journal gives distribution status priority when a brand’s broad web catalog remains unchanged after products leave routine ordering systems.'
      ]},
      { id: 'remaining-retail', heading: 'How can Walmart or Dollar General still show Ultra Red?', toc: 'Retail listings', paragraphs: [
        'Large retailers can keep product records, marketplace offers, coupons, and fulfillment inventory long after a SKU leaves standard distribution. Some stores may also receive old warehouse stock or a final case transfer. A page marked available in one place is evidence of stock, not necessarily of current production.',
        'A true return would be broader and repeatable: newly date-coded U.S. cans, renewed distributor authorization, fresh chain assortment, and sustained replenishment across multiple regions. This report will change if that pattern appears.'
      ]},
      { id: 'international', heading: 'Is Ultra Red still made outside the United States?', toc: 'International status', paragraphs: [
        'Ultra Red has remained visible in some international Monster ranges. Imported cans can therefore appear fresh even while the U.S. version is discontinued. Formula, size, language, and nutrition labeling may differ by market.',
        'Under the journal’s rule, foreign availability does not make a flavor current in America. It belongs in the article because it explains supply and helps buyers identify whether a listing is old U.S. stock or a current import.'
      ]},
      { id: 'red-white-blue', heading: 'Ultra Red is not Red White & Blue Razz', toc: 'Name confusion', paragraphs: [
        'Monster’s 2026 limited-time Ultra Red White & Blue Razz is a different drink with a blue-raspberry or frozen-pop profile. Its name includes the word Red, but it is not a relabeling of the older mixed-berry Ultra Red.',
        'Search results can mix the products because both use “Ultra” and “Red.” The discontinued can is solid red with ULTRA RED printed near the bottom. Always compare the complete flavor name before treating a newer listing as a comeback.'
      ]}
    ],
    shop: { heading: 'Looking for the original Ultra Red?', copy: 'Discontinued Club currently lists two full 16-fluid-ounce U.S. Ultra Red cans. The item page shows the exact pair and current quantity.', href: 'products/monster-energy-ultra-red-2-pack-407205333909.html', cta: 'View the Ultra Red pair' },
    faq: [
      { question: 'Is Monster Ultra Red discontinued in the U.S.?', answer: 'Yes. It has left normal U.S. distribution, although legacy brand pages and remaining retailer stock can still appear.' },
      { question: 'Why does Monster still have an Ultra Red page?', answer: 'The page has remained online without proving renewed national distributor replenishment.' },
      { question: 'Is Red White & Blue Razz the same flavor?', answer: 'No. It is a separate 2026 limited-time product with a different flavor profile.' },
      { question: 'Can imported Ultra Red be current?', answer: 'Yes. Some foreign markets can continue selling it even though the U.S. status is discontinued.' }
    ],
    sources: [
      { label: 'Monster Energy U.S.: Ultra Red product page', url: 'https://www.monsterenergy.com/en-us/energy-drinks/zero-sugar/ultra-red/', note: 'legacy-page conflict reviewed September 11, 2026' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'broad year-end portfolio snapshot' },
      { label: 'History Oasis: discontinued Monster flavor timeline', url: 'https://www.historyoasis.com/post/discontinued-monster-energy-flavors', note: 'secondary chronology reviewed September 11, 2026' }
    ]
  },
  {
    slug: 'is-red-bull-green-edition-curuba-elderflower-discontinued',
    brand: 'Red Bull', product: 'Red Bull Green Edition Curuba Elderflower', theme: 'green', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 8,
    title: 'Is Red Bull Curuba Elderflower discontinued?', seoTitle: 'Is Red Bull Curuba Elderflower Discontinued? U.S. 2026 Status',
    description: 'Yes. Red Bull Green Edition Curuba Elderflower was discontinued in the United States in 2026. Read the evidence and what remaining cans mean.',
    deck: 'Yes. Green Edition Curuba Elderflower is one of four Red Bull products removed from the U.S. range for 2026. Cans still offered by collectors are remaining inventory, not proof of a national return.',
    answerHeading: 'Yes. Red Bull Curuba Elderflower is discontinued in the United States.',
    answer: 'The Green Edition Curuba Elderflower was named in 2026 U.S. discontinuation reporting and is absent from Red Bull’s current U.S. Editions lineup. It may remain available abroad or through sell-through inventory, but it is no longer a normally marketed U.S. Edition.',
    sidebar: 'A 2026 U.S. cut supported by the current official lineup.', evidenceGrade: 'High', evidenceNote: 'Specific discontinuation report and matching official catalog change.',
    image: 'assets/images/journal/red-bull-curuba.webp', imageAlt: 'One Red Bull Green Edition Curuba Elderflower 12 ounce can', caption: 'One Green Edition Curuba Elderflower can from Discontinued Club inventory.',
    cardCopy: 'The green curuba-and-elderflower Edition was removed from normal U.S. distribution in the 2026 range reset.',
    sections: [
      { id: 'decision', heading: 'How the 2026 status was established', toc: '2026 decision', paragraphs: [
        'Curuba Elderflower appears alongside Blueberry and two sugarfree Editions in reporting based on an internal Red Bull discontinuation announcement. That report supplied both a market and a time frame instead of relying on scattered “I cannot find it” comments.',
        'Red Bull’s current U.S. Editions page provides the second half of the evidence. It lists the active American range after the reported cuts and no longer includes Green Edition Curuba Elderflower. A named discontinuation combined with a changed official lineup supports the U.S. discontinued label.'
      ]},
      { id: 'green-edition', heading: 'What happened to the Green Edition name?', toc: 'Green Edition changes', paragraphs: [
        'Edition colors are positions in Red Bull’s lineup, not permanent promises to one flavor. Red Bull can retire a flavor, reuse a color, or promote a seasonal product into a permanent slot. A future green can would not automatically be the same curuba-and-elderflower formula.',
        'That makes the full printed flavor essential for collectors. Search results for “Red Bull Green Edition” can mix Curuba Elderflower with Dragon Fruit, Kiwi Apple, or a market-specific release. This report covers the U.S. Curuba Elderflower product only.'
      ]},
      { id: 'availability', heading: 'Why it may still look available online', toc: 'Online availability', paragraphs: [
        'Retailers do not purge every product page when a manufacturer stops distribution. A listing may be out of stock locally, fulfilled by a marketplace seller, or tied to inventory in another region. Even a checkout button does not establish that a product remains in current national production.',
        'Collector shops may also hold full cans after mainstream stores sell out. Those sales are legitimate remaining inventory. The correct description is “discontinued and still obtainable,” not “current,” unless Red Bull restores it to the U.S. range.'
      ]},
      { id: 'flavor', heading: 'What Curuba Elderflower was', toc: 'Flavor identity', paragraphs: [
        'The Green Edition combined curuba, also known as banana passionfruit, with floral elderflower notes. Its unusual profile helped it stand apart from simpler berry and tropical Editions, which is why disappearance from ordinary coolers was quickly noticed.',
        'A replacement suggestion cannot be treated as an exact substitute. Similar green, tropical, or floral products may occupy the same shelf position while using a different formula. Fans searching for the original should match both Curuba and Elderflower on the can.'
      ]}
    ],
    shop: { heading: 'Looking for the discontinued Green Edition?', copy: 'Discontinued Club has a four-pack of full 12-fluid-ounce Curuba Elderflower cans with the exact U.S. package shown.', href: 'products/red-bull-green-edition-curuba-elderflower-4-pack-407203121847.html', cta: 'View the Curuba four-pack' },
    faq: [
      { question: 'Is Red Bull Curuba Elderflower discontinued in the U.S.?', answer: 'Yes. It was named among the 2026 U.S. cuts and is absent from the current U.S. Editions lineup.' },
      { question: 'Is every Green Edition the same flavor?', answer: 'No. Red Bull can use Edition colors for different flavors across years and countries.' },
      { question: 'Can stores still have Curuba Elderflower?', answer: 'Yes. Remaining cases can sell through after distribution ends.' },
      { question: 'Does an online listing mean it returned?', answer: 'No. A relaunch requires stronger evidence such as renewed U.S. distribution or placement in Red Bull’s current American range.' }
    ],
    sources: [
      { label: 'Red Bull U.S.: current Red Bull Editions', url: redBullUsEditions, note: 'reviewed September 11, 2026' },
      { label: 'Sporked: four Red Bull flavors discontinued for 2026', url: redBullCuts, note: 'reporting on an internal U.S. announcement' }
    ]
  },
  {
    slug: 'is-red-bull-sugarfree-watermelon-discontinued',
    brand: 'Red Bull', product: 'Red Bull Sugarfree Red Edition Watermelon', theme: 'red', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 8,
    title: 'Is Sugarfree Red Bull Watermelon discontinued?', seoTitle: 'Is Sugarfree Red Bull Watermelon Discontinued? 2026 U.S. Status',
    description: 'Yes. Sugarfree Red Bull Red Edition Watermelon was discontinued in the U.S. in 2026, while the regular-sugar Red Edition remains a separate product.',
    deck: 'Yes, the sugarfree Watermelon Edition is discontinued in the United States. The standard Red Edition Watermelon remains a different product, so a red can on the shelf does not disprove the sugarfree cut.',
    answerHeading: 'Yes. The Sugarfree Red Edition Watermelon is discontinued in the U.S.',
    answer: 'The discontinued product is the sugarfree variant specifically. Red Bull’s 2026 U.S. cuts included Sugarfree Red Edition Watermelon, while the standard Red Edition remains part of the current lineup. Sugar level is therefore part of the product identity, not a minor package detail.',
    sidebar: 'Sugarfree Watermelon ended; regular Red Edition Watermelon is separate and remains current.', evidenceGrade: 'High', evidenceNote: 'Named 2026 cut plus current official sugarfree and regular Editions lists.',
    image: 'assets/images/journal/red-bull-sugarfree-watermelon.webp', imageAlt: 'One Red Bull Sugarfree Red Edition Watermelon 12 ounce can', caption: 'One Sugarfree Red Edition Watermelon can from Discontinued Club inventory.',
    cardCopy: 'The sugarfree watermelon variant ended in the U.S.; the regular Red Edition is a separate current drink.',
    sections: [
      { id: 'variant', heading: 'The sugarfree qualifier changes the answer', toc: 'Which version ended', paragraphs: [
        'Red Bull sells Edition flavors in multiple formulations, and discontinuation can apply to only one of them. The 2026 report names Sugarfree Red Edition Watermelon, not every watermelon product. Red Bull’s current U.S. Editions page still includes the standard Red Edition Watermelon.',
        'The current U.S. sugarfree Editions information does not include the watermelon Red Edition. That split matches the reported cut: the flavor survives in a regular formulation, while the exact sugarfree SKU shown in this report has left the normal U.S. range.'
      ]},
      { id: 'evidence', heading: 'What evidence supports the discontinuation?', toc: 'Evidence', paragraphs: [
        'The strongest public case combines a specific industry report with Red Bull’s own present lineup. Sporked identified the sugarfree Watermelon among four American discontinuations for early 2026. Red Bull’s current U.S. pages now separate the continuing regular Editions from a narrower sugarfree range that omits this product.',
        'This is more reliable than inferring status from one store. Retailers can run out before a cut, and they can keep inventory after it. The national lineup shows which formulation Red Bull is actively presenting to U.S. customers now.'
      ]},
      { id: 'confusion', heading: 'Why search results make the product look current', toc: 'Search-result confusion', paragraphs: [
        'A search for “Red Bull watermelon” naturally prioritizes the regular Red Edition, and many retailer titles omit “Sugarfree” until the product details. Images of nearly identical red cans can also be difficult to distinguish at thumbnail size.',
        'Check for the blue SUGARFREE band and the word SUGARFREE in the Edition name. A page for regular Watermelon, a variety pack, or a foreign formulation does not establish renewed U.S. distribution of the discontinued sugarfree version.'
      ]},
      { id: 'remaining', heading: 'What remaining stock means in 2026', toc: 'Remaining inventory', paragraphs: [
        'Cases produced before the reset can continue moving through warehouses and stores. A collector listing may therefore contain full, unopened cans months after the SKU stopped receiving ordinary replenishment. This is expected during sell-through.',
        'A real return would create a different evidence pattern: refreshed U.S. brand placement, new production marks, renewed distributor listings, and broad retail restocking. Until that happens, isolated inventory remains discontinued stock.'
      ]}
    ],
    shop: { heading: 'Remaining Sugarfree Watermelon cans', copy: 'Discontinued Club currently lists a four-pack of full 12-fluid-ounce Sugarfree Red Edition Watermelon cans.', href: 'products/red-bull-red-edition-sugar-free-watermelon-4-pack-407207373104.html', cta: 'View the Watermelon four-pack' },
    faq: [
      { question: 'Is Sugarfree Red Bull Watermelon discontinued?', answer: 'Yes. The Sugarfree Red Edition Watermelon was removed from the U.S. range in 2026.' },
      { question: 'Is regular Red Bull Watermelon discontinued?', answer: 'No. The regular Red Edition Watermelon remains a separate current U.S. product.' },
      { question: 'How can I identify the discontinued can?', answer: 'Look for Sugarfree labeling, including the blue band near the top of the red can.' },
      { question: 'Why can I still find it online?', answer: 'Remaining inventory and marketplace stock can stay available after routine distribution ends.' }
    ],
    sources: [
      { label: 'Red Bull U.S.: current Red Bull Editions', url: redBullUsEditions, note: 'regular Watermelon remains listed' },
      { label: 'Red Bull U.S.: current sugarfree Editions', url: 'https://www.redbull.com/us-en/energydrink/products/red-bull-sugar-free-energy-drinks', note: 'reviewed September 11, 2026' },
      { label: 'Sporked: four Red Bull flavors discontinued for 2026', url: redBullCuts, note: 'names Sugarfree Red Edition Watermelon' }
    ]
  },
  {
    slug: 'is-red-bull-sugarfree-strawberry-apricot-discontinued',
    brand: 'Red Bull', product: 'Red Bull Sugarfree Amber Edition Strawberry Apricot', theme: 'orange', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. flavor status report', readTime: 8,
    title: 'Is Sugarfree Red Bull Strawberry Apricot discontinued?', seoTitle: 'Is Sugarfree Red Bull Strawberry Apricot Discontinued? 2026 Status',
    description: 'Yes. Red Bull Sugarfree Amber Edition Strawberry Apricot was discontinued in the U.S. in 2026; the regular Amber Edition is a separate product.',
    deck: 'Yes. The sugarfree Strawberry Apricot Edition was cut from the U.S. range in 2026. The regular Amber Edition remains separate, which is why the flavor name can still look current.',
    answerHeading: 'Yes. Sugarfree Amber Edition Strawberry Apricot is discontinued in the U.S.',
    answer: 'Red Bull’s reported 2026 cuts included the sugarfree Strawberry Apricot variant. Red Bull continues to show the standard Amber Edition in its U.S. range, but that does not preserve the sugarfree SKU. This report tracks the exact formulation printed on the can.',
    sidebar: 'Sugarfree Strawberry Apricot ended; the regular Amber Edition continues separately.', evidenceGrade: 'High', evidenceNote: 'Named 2026 cut and a matching omission from the current sugarfree range.',
    image: 'assets/images/journal/red-bull-sugarfree-strawberry-apricot.webp', imageAlt: 'One Red Bull Sugarfree Amber Edition Strawberry Apricot 12 ounce can', caption: 'One Sugarfree Amber Edition Strawberry Apricot can from Discontinued Club inventory.',
    cardCopy: 'The sugarfree Amber Edition was cut in 2026 even though regular Strawberry Apricot remains in Red Bull’s U.S. range.',
    sections: [
      { id: 'exact-product', heading: 'Which Strawberry Apricot product was discontinued?', toc: 'Exact product', paragraphs: [
        'The affected can is Sugarfree Amber Edition Strawberry Apricot. Red Bull also markets a standard Amber Edition with the same named flavor, so broad searches can collapse two distinct products into one answer. The reported discontinuation applies to the sugarfree formulation.',
        'Red Bull’s current U.S. Editions page still names Amber Edition Strawberry Apricot among regular products. Its current sugarfree lineup is different and no longer includes the Amber Edition. That is consistent with a formulation-specific cut rather than the disappearance of every Strawberry Apricot drink.'
      ]},
      { id: 'support', heading: 'How strong is the 2026 evidence?', toc: '2026 evidence', paragraphs: [
        'The public evidence is stronger than an ordinary shelf rumor because the sugarfree Amber Edition appears in a specific four-product discontinuation report. The other named products also disappeared from the current U.S. ranges, giving the report a visible catalog match.',
        'Red Bull has not provided a public page that narrates every SKU decision or an exact final production date. The status is based on the named U.S. cut and current lineup, while the timing of the final can moving through distribution can vary by retailer.'
      ]},
      { id: 'identify', heading: 'How to identify the discontinued version', toc: 'Identify the can', paragraphs: [
        'Look for both AMBER EDITION and SUGARFREE on the can. The sugarfree package uses a blue band near the top, a detail that can disappear in small marketplace thumbnails. The flavor words Strawberry and Apricot appear lower on the front panel.',
        'A regular Amber Edition, an imported can, or a retailer page that merges multiple variations is not the same item. Ask sellers to show the front label and size when the listing title leaves out the formulation.'
      ]},
      { id: 'sell-through', heading: 'Why final cans can remain on shelves', toc: 'Sell-through', paragraphs: [
        'A discontinuation usually reaches stores unevenly. A warehouse may still have cases while another region has already removed the shelf tag. Online availability can also be fulfilled from distant inventory rather than a current local distributor order.',
        'Those leftovers are part of the normal wind-down. A credible relaunch would involve new production and sustained U.S. replenishment, not simply a few listings that never disappeared from search.'
      ]}
    ],
    shop: { heading: 'The discontinued sugarfree Amber Edition', copy: 'Discontinued Club currently lists a four-pack of full 12-fluid-ounce Strawberry Apricot Sugarfree cans.', href: 'products/red-bull-amber-edition-sugar-free-4-pack-407203141723.html', cta: 'View the Strawberry Apricot pack' },
    faq: [
      { question: 'Is Sugarfree Red Bull Strawberry Apricot discontinued?', answer: 'Yes. The Sugarfree Amber Edition was removed from the U.S. range in 2026.' },
      { question: 'Is regular Strawberry Apricot discontinued?', answer: 'No. The regular Amber Edition remains a different current U.S. product.' },
      { question: 'How do I tell the cans apart?', answer: 'The discontinued version says Sugarfree and carries the sugarfree package treatment near the top.' },
      { question: 'Could remaining stock still be fresh?', answer: 'Possibly, depending on production and storage dates. Check the actual can markings and seller information.' }
    ],
    sources: [
      { label: 'Red Bull U.S.: current Red Bull Editions', url: redBullUsEditions, note: 'regular Amber Edition remains listed' },
      { label: 'Red Bull U.S.: current sugarfree Editions', url: 'https://www.redbull.com/us-en/energydrink/questions/what-is-the-difference-between-red-bull-sugarfree-and-red-bull-editions-sugarfree', note: 'reviewed September 11, 2026' },
      { label: 'Sporked: four Red Bull flavors discontinued for 2026', url: redBullCuts, note: 'names the sugarfree Amber Edition' }
    ]
  },
  {
    slug: 'is-mountain-dew-livewire-discontinued',
    brand: 'Mountain Dew', product: 'Mountain Dew LiveWire', theme: 'orange', statusKey: 'current', statusLabel: 'Current, regional', lane: 'U.S. flavor and package report', readTime: 9,
    title: 'Is Mountain Dew LiveWire discontinued?', seoTitle: 'Is Mountain Dew LiveWire Discontinued? 2026 U.S. Status',
    description: 'No. Mountain Dew LiveWire is still current in the United States but distributed regionally. Older LiveWire can designs are discontinued packages.',
    deck: 'No. LiveWire remains a current U.S. flavor with regional distribution. The older orange-and-black can shown here is a discontinued package design, which is a different answer from the flavor’s status.',
    answerHeading: 'No. LiveWire is current in the U.S., but this older package design is discontinued.',
    answer: 'Mountain Dew maintains a current official U.S. product page for LiveWire. Availability is uneven and regional, so many shoppers can go years without seeing it. The can shown in this report uses an older design that has been replaced; collectors can accurately call that package discontinued without calling the LiveWire flavor discontinued.',
    sidebar: 'Flavor current and regional; the older can design shown is retired.', evidenceGrade: 'High', evidenceNote: 'Active official U.S. product page, current formula information, and newer package design.',
    image: 'assets/images/journal/livewire.webp', imageAlt: 'One Mountain Dew LiveWire can in the older orange and black design', caption: 'An older LiveWire can design from Discontinued Club inventory; the flavor remains current.',
    cardCopy: 'The orange soda is still current but regional. The older package design shown here is the discontinued part.',
    sections: [
      { id: 'official-status', heading: 'What proves LiveWire is still current?', toc: 'Official status', paragraphs: [
        'Mountain Dew continues to publish a dedicated U.S. LiveWire product page. It identifies the citrus-orange soda, provides current product information, and presents LiveWire as part of the brand rather than an archived release. That is direct evidence against a national flavor discontinuation.',
        'A current product page does not guarantee nationwide shelf coverage. LiveWire has long been distributed more heavily in certain regions and chains, which means the official national status and a customer’s local experience can be very different.'
      ]},
      { id: 'regional', heading: 'Why LiveWire feels discontinued in many states', toc: 'Regional distribution', paragraphs: [
        'Soft-drink bottling territories, warehouse assortments, and retailer shelf plans determine which Mountain Dew flavors actually reach a store. A regional product can be ordinary in one part of the Midwest and effectively absent several states away.',
        'That absence can last long enough to look permanent, but it is not the same as the manufacturer ending the flavor. A discontinued conclusion would require Mountain Dew to remove LiveWire from the active range or reliable distribution evidence showing a nationwide end.'
      ]},
      { id: 'old-design', heading: 'The old LiveWire design is discontinued', toc: 'Old package status', paragraphs: [
        'The exact can shown here uses an earlier orange-and-black design. Mountain Dew has since updated LiveWire’s graphics, so that artwork is no longer the normal package being produced. The old design is therefore a discontinued package even though the soda continues.',
        'Package collectors often search by year, can art, logo treatment, size, or formula era. Those details deserve a clear status because a current LiveWire can is not a replacement for someone trying to complete a set of older Mountain Dew designs.'
      ]},
      { id: 'find-current', heading: 'How to search for current LiveWire', toc: 'How to find it', paragraphs: [
        'Start with Mountain Dew’s product page and current store links, then check major grocery and convenience chains by ZIP code. Expanding the radius can reveal a nearby bottler territory that carries LiveWire even when your closest stores do not.',
        'When shopping online, compare the listing photo with Mountain Dew’s current design. An older can may be collectible inventory, while a current can may be intended for normal consumption. Do not assume a stock photo shows the package that will arrive.'
      ]}
    ],
    shop: { heading: 'Looking for the retired LiveWire can design?', copy: 'Discontinued Club’s listing shows the exact older-design full can rather than substituting a photo of the current package.', href: 'products/mountain-dew-livewire-406795016704.html', cta: 'View the older LiveWire can' },
    faq: [
      { question: 'Is Mountain Dew LiveWire discontinued?', answer: 'No. LiveWire remains a current U.S. flavor with regional distribution.' },
      { question: 'Why can’t I find LiveWire near me?', answer: 'Bottler territories and retailer assortment make availability uneven across the United States.' },
      { question: 'Is the old LiveWire can discontinued?', answer: 'Yes. The older package design shown here has been replaced even though the flavor continues.' },
      { question: 'Did the LiveWire flavor change?', answer: 'This report confirms a package change, not a verified formula change. Compare labels directly for formula details.' }
    ],
    sources: [
      { label: 'Mountain Dew U.S.: official LiveWire product page', url: 'https://www.mountaindew.com/product/mountain-dew-livewire', note: 'reviewed September 11, 2026' }
    ]
  },
  {
    slug: 'is-alani-nu-lime-slush-discontinued',
    modifiedDate: '2026-09-16',
    brand: 'Alani Nu', product: 'Alani Nu Lime Slush', theme: 'green', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. limited-release status report', readTime: 8,
    title: 'Is Alani Nu Lime Slush discontinued?', seoTitle: 'Is Alani Nu Lime Slush Discontinued? 2026 U.S. Status',
    description: 'Yes. Alani Nu Lime Slush was a limited U.S. release whose run has ended in 2026. See the evidence, remaining-stock signals, and what a return would look like.',
    deck: 'Yes, under a U.S. availability definition. Lime Slush was a limited release and is no longer part of the normally replenished Alani Nu range, although late inventory and requests for a comeback remain visible.',
    answerHeading: 'Yes. Alani Nu Lime Slush’s limited U.S. run has ended.',
    answer: 'Lime Slush launched as a limited product rather than a permanent U.S. flavor. Its SmartLabel record and 2026 retail reviews establish that it was a real current release earlier in the year; later sell-through, disappearance from the regular range, and an organized fan campaign to bring it back establish that the limited run ended. A future seasonal return remains possible.',
    sidebar: 'The 2026 limited release ended; a future comeback is possible but not currently announced.', evidenceGrade: 'Moderate', evidenceNote: 'Official product record plus retail chronology and community comeback activity; no public permanent-discontinuation notice.',
    image: 'assets/images/journal/alani-lime-slush.webp', imageAlt: 'One bright green Alani Nu Lime Slush 12 ounce can', caption: 'Alani Nu Lime Slush. Currently unavailable from Discontinued Club; one four-pack is reserved for a future release with no announced date.',
    cardCopy: 'The bright green limited release ended after its 2026 U.S. run; remaining packs are sell-through inventory.',
    sections: [
      { id: 'limited-release', heading: 'Why a limited release counts as discontinued now', toc: 'Limited-run status', paragraphs: [
        'A limited release has an intended end even when the brand does not issue a dramatic cancellation statement. Once normal production and replenishment stop, the flavor is discontinued for the current U.S. market. It can still return later as a seasonal or fan-favorite relaunch.',
        'That definition answers the shopper’s practical question: should they expect ordinary stores to keep restocking it? For Lime Slush, the evidence now points to sell-through rather than ongoing placement.'
      ]},
      { id: 'timeline', heading: 'What the 2026 timeline shows', toc: '2026 timeline', paragraphs: [
        'PepsiCo’s official SmartLabel database carried a Lime Slush product record updated in February 2026, and major-retailer reviews continued into the summer. Those sources establish that the flavor was genuinely circulating in the United States during 2026 rather than being an old rumor or mockup.',
        'Later in the year, fans organized requests for Alani Nu to bring Lime Slush back. A comeback campaign does not prove an exact last-production date, but it is consistent with a limited item that stopped receiving normal replenishment after its launch window.'
      ]},
      { id: 'remaining-packs', heading: 'Why four-packs can still be available', toc: 'Remaining packs', paragraphs: [
        '<strong>Store availability update, September 16, 2026:</strong> Discontinued Club has sold the last Lime Slush four-pack offered for sale on eBay and now has zero packs available to purchase. The <a href="sold/alani-nu-lime-slush-4-pack-407205693415.html">sold-out listing archive</a> remains available for reference.',
        '<strong>A future Discontinued Club drop:</strong> We are holding one separate four-pack for a future release. It is not available to buy or preorder, and no release date has been announced. This is existing inventory reserved by our store, not an announcement of new production or a manufacturer relaunch.',
        'Retail and specialty inventory can outlast a limited run. Stores may sell through cases at different speeds, while marketplace sellers can hold packs specifically because the flavor became scarce. Availability after the run is expected and does not make the item permanent.',
        'Check the seller’s photos, pack quantity, can condition, and date markings. Lime Slush was sold in several retail configurations, so a single can, a four-pack, and a case should not be treated as interchangeable listings.'
      ]},
      { id: 'return', heading: 'Could Lime Slush come back?', toc: 'Possible return', paragraphs: [
        'Yes. Alani Nu rotates seasonal and limited flavors, and fan demand can influence future calendars. A new announcement, refreshed product page, and renewed broad U.S. retail distribution would change this report from discontinued to returning or current.',
        'Until that happens, social requests and isolated packs are not a relaunch. This page will preserve the distinction between “people want it back” and “Alani Nu has confirmed it is back.”'
      ]}
    ],
    faq: [
      { question: 'Is Alani Nu Lime Slush discontinued?', answer: 'Yes. Its limited U.S. run ended in 2026 and it is no longer in normal replenishment.' },
      { question: 'Was Lime Slush a permanent flavor?', answer: 'No. The evidence points to a limited release rather than a permanent addition.' },
      { question: 'Can Lime Slush return?', answer: 'Yes. A limited flavor can return in a later seasonal or promotional window.' },
      { question: 'Why are four-packs still online?', answer: 'Retailers and specialty sellers can continue selling inventory after production and routine replenishment end.' }
    ],
    sources: [
      { label: 'PepsiCo SmartLabel: Alani Nu Lime Slush', url: 'https://smartlabel.pepsico.info/810175041650-0001-en-US/index.html', note: 'official product record updated February 7, 2026' },
      { label: 'Target: Alani Nu Lime Slush customer timeline', url: 'https://www.target.com/p/-/A-95062908', note: 'retail reviews checked September 11, 2026' },
      { label: 'Alani Nu community: Lime Slush comeback campaign', url: 'https://www.reddit.com/r/AlaniNu/comments/1vp5z2m/update_we_hit_100_signatures_to_bring_back_alani/', note: 'community signal, not manufacturer confirmation' }
    ]
  },
  {
    slug: 'is-celsius-raspberry-acai-green-tea-discontinued',
    brand: 'CELSIUS', product: 'CELSIUS Fizz-Free Raspberry Acai Green Tea', theme: 'berry', statusKey: 'discontinued', statusLabel: 'Discontinued in U.S.', lane: 'U.S. lineup status report', readTime: 9,
    title: 'Is CELSIUS Raspberry Acai Green Tea discontinued?', seoTitle: 'Is CELSIUS Raspberry Acai Green Tea Discontinued? 2026 Status',
    description: 'Yes. CELSIUS Fizz-Free Raspberry Acai Green Tea is no longer in the current U.S. Fizz-Free lineup for 2026, although its legacy product page and retailer stock remain.',
    deck: 'Yes. Raspberry Acai Green Tea was omitted from CELSIUS’s refreshed 2026 Fizz-Free range. Its older product page and retailer listings remain visible, but the current U.S. lineup has moved forward without it.',
    answerHeading: 'Yes. CELSIUS Raspberry Acai Green Tea is discontinued from the current U.S. lineup.',
    answer: 'CELSIUS’s current product collection includes Fizz-Free Peach Mango Green Tea but omits Raspberry Acai Green Tea. Reporting on the 2026 Fizz-Free refresh specifically noted the omission and fan reaction. An older official product page can still be found, and retailers may still have inventory, but neither establishes ongoing lineup status.',
    sidebar: 'Omitted from the refreshed 2026 U.S. Fizz-Free lineup; legacy pages and retail stock remain.', evidenceGrade: 'Moderate to high', evidenceNote: 'Current official lineup omission supported by specific 2026 reporting; no separate public cancellation notice found.',
    image: 'assets/images/journal/celsius-raspberry-acai-green-tea.webp', imageAlt: 'One CELSIUS Fizz-Free Raspberry Acai Green Tea 12 ounce can', caption: 'The Raspberry Acai Green Tea can associated with the outgoing Fizz-Free product.', imageCredit: 'Walmart product packshot',
    cardCopy: 'The 2026 Fizz-Free refresh kept Peach Mango but left Raspberry Acai Green Tea out of the current U.S. lineup.',
    sections: [
      { id: 'lineup', heading: 'What changed in the 2026 Fizz-Free lineup?', toc: '2026 lineup', paragraphs: [
        'CELSIUS refreshed and renamed its non-carbonated range for 2026. The current U.S. product collection includes Fizz-Free Peach Mango Green Tea, while Raspberry Acai Green Tea is absent. Coverage of the change called out that omission and the disappointment it generated among fans.',
        'A current collection is more useful for lineup status than a standalone page with no visible update date. The older Raspberry Acai page preserves product details, but the refreshed range shows which flavors CELSIUS is actively presenting together now.'
      ]},
      { id: 'legacy-page', heading: 'Why is the official product page still online?', toc: 'Legacy product page', paragraphs: [
        'Brands often leave product URLs accessible because old links, search traffic, retailer integrations, and support content still depend on them. A page can remain technically live after a flavor stops being part of current assortment.',
        'The strongest sign of a true return would be placement back in the current collection, fresh brand promotion, and renewed broad retail replenishment. Until those appear, the legacy page is historical evidence rather than a current-status override.'
      ]},
      { id: 'retailers', heading: 'Do retailer listings mean it is still current?', toc: 'Retail inventory', paragraphs: [
        'Retailer databases can show Raspberry Acai Green Tea as active, out of stock, or available in isolated locations. Those pages may draw from store inventory, marketplace sellers, or a product database that is not synchronized with the manufacturer’s current lineup.',
        'A spring 2026 food-service catalog also listed the product, which shows that cases were still in commerce during the transition. It does not guarantee continued production after the Fizz-Free reset.'
      ]},
      { id: 'identify', heading: 'How to identify the outgoing can', toc: 'Can identification', paragraphs: [
        'The can says FIZZ-FREE and RASPBERRY ACAI + GREEN TEA on a white CELSIUS package with berry artwork. Older labels may use slightly different benefit language, but the flavor name is the deciding identifier.',
        'Do not confuse it with Sparkling Raspberry Peach, other raspberry CELSIUS products, or the continuing Fizz-Free Peach Mango Green Tea. Carbonation style and full flavor name both matter.'
      ]}
    ],
    faq: [
      { question: 'Is CELSIUS Raspberry Acai Green Tea discontinued?', answer: 'Yes. It is absent from the refreshed current U.S. Fizz-Free lineup in 2026.' },
      { question: 'Why does CELSIUS still have a product page?', answer: 'Standalone legacy pages can remain online after the current product collection changes.' },
      { question: 'Is Peach Mango Green Tea also discontinued?', answer: 'No. Peach Mango Green Tea remains in the current Fizz-Free collection as of this review.' },
      { question: 'Can retailers still sell Raspberry Acai?', answer: 'Yes. Existing inventory can remain in stores and online after lineup removal.' }
    ],
    sources: [
      { label: 'CELSIUS: current product collection', url: 'https://www.celsius.com/products/', note: 'reviewed September 11, 2026' },
      { label: 'CELSIUS: Raspberry Acai Green Tea legacy product page', url: 'https://www.celsius.com/products/celsius/raspberry-acai-green-tea/', note: 'reviewed as historical product evidence' },
      { label: 'Parade: CELSIUS Fizz-Free lineup change for 2026', url: 'https://parade.com/food/celsius-fizz-free-flavors-major-change-new-look-2026', note: 'reports the Raspberry Acai omission' }
    ]
  },
  {
    slug: 'is-monster-ultra-fantasy-ruby-red-being-discontinued',
    brand: 'Monster Energy', product: 'Monster Ultra Fantasy Ruby Red', theme: 'berry', statusKey: 'rumor', statusLabel: 'Rumored, not confirmed', lane: 'U.S. discontinuation watch', readTime: 9,
    title: 'Is Monster Ultra Fantasy Ruby Red being discontinued?', seoTitle: 'Is Monster Ultra Fantasy Ruby Red Being Discontinued? 2026 Rumor',
    description: 'Monster Ultra Fantasy Ruby Red is rumored to leave U.S. distribution by October 1, 2026, but Monster has not publicly confirmed it and current pages remain active.',
    deck: 'A recent U.S. distributor report says Ultra Fantasy Ruby Red will be discontinued on or before October 1. Monster still lists it publicly, so the correct status today is credible rumor, not confirmed discontinuation.',
    answerHeading: 'It is rumored to be ending in the U.S., but it is not confirmed yet.',
    answer: 'On September 8, 2026, a community member reported receiving a Monster corporate email naming Ultra Fantasy Ruby Red, Rehab Green Tea, and Rio Punch for U.S. discontinuation on or before October 1. The claim is specific and has attracted additional distributor discussion, but the underlying email has not been published in a form we can authenticate. Monster’s U.S. product page remains active.',
    sidebar: 'Specific September 2026 report claims an October 1 U.S. end; public Monster sources still show the product.', evidenceGrade: 'Developing', evidenceNote: 'One detailed distributor report with community corroboration, but no public corporate notice or completed retail reset.',
    image: 'assets/images/journal/monster-fantasy-ruby-red.webp', imageAlt: 'One Monster Ultra Fantasy Ruby Red 16 ounce can', caption: 'Ultra Fantasy Ruby Red remains a current-looking U.S. product while the October rumor is investigated.', imageCredit: 'Viking Coca-Cola product packshot',
    cardCopy: 'A reported corporate email names October 1, but Monster still lists Ruby Red. The rumor is credible enough to watch, not confirm.',
    sections: [
      { id: 'origin', heading: 'Where did the Ruby Red discontinuation rumor start?', toc: 'Rumor origin', paragraphs: [
        'The current rumor traces to a September 8 post in the Monster Energy community. The poster said an email received that day named three U.S. products for discontinuation on or before October 1: Rehab Green Tea, Rio Punch, and Ultra Ruby Red. The claimed market and date make it more testable than vague social chatter.',
        'Commenters who identified themselves with distribution operations discussed slow sales and warehouse timing, which gives the report context. Those comments are still self-reported. Without the original corporate message, a distributor bulletin, or a visible national reset, they cannot be treated as an official announcement.'
      ]},
      { id: 'current-evidence', heading: 'What do Monster’s public sources say now?', toc: 'Current public evidence', paragraphs: [
        'Monster’s U.S. Ultra Fantasy Ruby Red page remains active and describes 12- and 16-ounce sizes with shopping and store-finder actions. The broader U.S. flavor directory also includes the product. Major retailers still show individual cans in stock in at least some locations.',
        'Monster’s 2025 Form 10-K listed Ultra Fantasy Ruby Red as part of the portfolio at December 31, 2025. Those sources establish that it was current before the rumor and is still being presented publicly. They do not tell us whether an October 2026 distributor stop has been scheduled internally.'
      ]},
      { id: 'october', heading: 'Why the October 1 date matters', toc: 'October timing', paragraphs: [
        'The claimed date was still in the future when this report was checked. A product can remain genuinely current while a discontinuation is scheduled, and stores can continue selling inventory long after the final distributor order. Calling it already discontinued would collapse those stages.',
        'The next useful checks are whether distributor ordering closes, whether chain resets remove the shelf tag, and whether newly produced U.S. cans continue after October. A change across several unrelated retailers would carry more weight than one local stockout.'
      ]},
      { id: 'international', heading: 'Could Ruby Red remain available abroad?', toc: 'International launches', paragraphs: [
        'Yes. Ultra Fantasy Ruby Red launched in additional European markets during 2026, including Finland and Iceland. A U.S. discontinuation would not automatically end those later international rollouts.',
        'Fresh imported cans appearing online after October could therefore coexist with a U.S. cut. Buyers should inspect volume, language, country labeling, and nutrition information before using an imported listing as evidence about American production.'
      ]}
    ],
    faq: [
      { question: 'Is Monster Ultra Fantasy Ruby Red discontinued?', answer: 'Not confirmed as of September 11, 2026. A specific report says U.S. distribution may end on or before October 1.' },
      { question: 'Did Monster announce the discontinuation?', answer: 'No public Monster announcement was found. The claim comes from a reported corporate email that has not been independently authenticated.' },
      { question: 'Why is it still in stores?', answer: 'The claimed end date is in the future, and existing inventory can remain after distributor orders stop.' },
      { question: 'Could Ruby Red continue outside the U.S.?', answer: 'Yes. International markets follow different launch and discontinuation schedules.' }
    ],
    sources: [
      { label: 'Reddit r/monsterenergy: September 8 U.S. discontinuation report', url: monsterRumor, note: 'original community claim; unverified' },
      { label: 'Monster Energy U.S.: Ultra Fantasy Ruby Red', url: 'https://www.monsterenergy.com/en-us/energy-drinks/zero-sugar/ultra-fantasy-ruby-red/', note: 'current public page reviewed September 11, 2026' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'year-end portfolio evidence' },
      { label: 'Sinebrychoff: Finland Ruby Red launch', url: 'https://www.sinebrychoff.fi/newsroom/monster-ultra-fantasy-ruby-red/', note: 'international context dated August 10, 2026' }
    ]
  },
  {
    slug: 'is-monster-rehab-green-tea-being-discontinued',
    modifiedDate: '2026-09-13',
    brand: 'Monster Energy', product: 'Monster Rehab Green Tea', theme: 'green', statusKey: 'rumor', statusLabel: 'Rumored, not confirmed', lane: 'U.S. discontinuation watch', readTime: 9,
    title: 'Is Monster Rehab Green Tea being discontinued?', seoTitle: 'Is Monster Rehab Green Tea Being Discontinued? 2026 Rumor Watch',
    description: 'Monster Rehab Green Tea is rumored to leave U.S. distribution by October 1, 2026, but the public U.S. page remains active and no official announcement is posted.',
    deck: 'A September distributor report says Rehab Green Tea is scheduled to leave U.S. distribution by October 1. The source is not yet independently verified, and Monster continues to present the product as current.',
    answerHeading: 'Rehab Green Tea is on discontinuation watch, not confirmed discontinued.',
    answer: 'The same September 8 report that named Ultra Fantasy Ruby Red and Rio Punch also named Rehab Green Tea for a U.S. end on or before October 1, 2026. Monster’s official U.S. page still lists the 15.5-ounce drink, and the 2025 corporate filing includes Green Tea in the Rehab range. Until the reported change takes effect or stronger documentation appears, the status remains rumor.',
    sidebar: 'An October 1 U.S. cut is reported; official product and corporate pages remain current.', evidenceGrade: 'Developing', evidenceNote: 'Specific distributor claim, but no authenticated notice or completed assortment change.',
    image: 'assets/images/journal/monster-rehab-green-tea.webp', imageAlt: 'One Monster Rehab Green Tea can', caption: 'Rehab Green Tea is still listed publicly while the reported October change is monitored.', imageCredit: 'Family Dollar product packshot',
    cardCopy: 'A specific report names Rehab Green Tea for October 1, while Monster’s official page still treats it as current.',
    sections: [
      { id: 'claim', heading: 'What exactly is being claimed?', toc: 'The claim', paragraphs: [
        '<strong>September 13 update:</strong> Read our <a href="journal/monster-rehab-green-tea-discontinuation-rumor-september-2026.html">new analysis of the October rumor</a>, including freshly checked U.S. sources, the 2024 return, and Canadian availability. The assessment below records our original September 11 review.',
        'The September 8 report says a Monster corporate email identified Rehab Green Tea, Juice Monster Rio Punch, and Ultra Fantasy Ruby Red for discontinuation in the United States on or before October 1. It does not claim the products were already gone on the date of the post.',
        'That timing matters because a scheduled cut can be real while official shopping pages and store inventory remain active. The report earns a watch page because it is concrete and near-term, but it does not earn a confirmed badge without the actual notice or independent distribution evidence.'
      ]},
      { id: 'official', heading: 'What official evidence conflicts with the rumor?', toc: 'Official evidence', paragraphs: [
        'Monster’s U.S. Rehab Green Tea page remains active with a 15.5-ounce size, flavor description, caffeine information, and shop and store-locator paths. The product also appears in Monster’s broad flavor directory.',
        'The company’s Form 10-K for 2025 lists Green Tea alongside Tea + Lemonade, Peach Tea, and Wild Berry Tea in the Rehab line. The filing is a year-end snapshot rather than a September 2026 schedule, but it confirms that Green Tea entered the year as an active company product.'
      ]},
      { id: 'history', heading: 'Why fans find the rumor believable', toc: 'Product history', paragraphs: [
        'Rehab Green Tea has disappeared and returned before, giving fans a reason to worry when availability changes. It was part of Monster’s earlier Rehab history and returned to U.S. resets in 2024 alongside Ruby Red and Rio Punch.',
        'A prior return also means “discontinued” would not necessarily mean “gone forever.” The useful task is to document each distribution period accurately instead of merging earlier versions, the 2024 return, and a possible 2026 exit into one vague timeline.'
      ]},
      { id: 'signals', heading: 'What evidence would confirm the cut?', toc: 'Confirmation signals', paragraphs: [
        'An authenticated distributor communication, a major retailer discontinued-SKU sheet, removal from Monster’s current Rehab range, or a broad post-October replenishment stop would materially strengthen the report. Several independent distribution territories reporting the same end date would also matter.',
        'One store being out of stock is not enough. Rehab products already have narrower shelf placement than core Monster cans, so normal assortment differences can look like a national exit before one occurs.'
      ]}
    ],
    faq: [
      { question: 'Is Monster Rehab Green Tea discontinued?', answer: 'Not confirmed as of September 11, 2026. A distributor report says it may leave U.S. distribution on or before October 1.' },
      { question: 'Is the official product page still active?', answer: 'Yes. Monster still lists Rehab Green Tea with product and shopping information.' },
      { question: 'Has Rehab Green Tea disappeared before?', answer: 'Yes. The product has had earlier availability gaps and a documented U.S. return in 2024.' },
      { question: 'What would confirm the rumor?', answer: 'An authenticated notice, official lineup removal, or broad distributor and retailer resets after the reported date.' }
    ],
    sources: [
      { label: 'Reddit r/monsterenergy: September 8 U.S. discontinuation report', url: monsterRumor, note: 'original community claim; unverified' },
      { label: 'Monster Energy U.S.: Rehab Green Tea', url: 'https://www.monsterenergy.com/en-us/energy-drinks/rehab-monster/green-tea/', note: 'current public page reviewed September 11, 2026' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'lists Green Tea in the Rehab range' },
      { label: 'Monster 2023 annual report', url: 'https://www.sec.gov/Archives/edgar/data/865752/000110465924053094/tm242702d4_ars.pdf', note: 'documents the 2024 U.S. return' }
    ]
  },
  {
    slug: 'is-monster-rio-punch-being-discontinued',
    brand: 'Monster Energy', product: 'Juice Monster Rio Punch', theme: 'yellow', statusKey: 'rumor', statusLabel: 'Rumored, not confirmed', lane: 'U.S. discontinuation watch', readTime: 9,
    title: 'Is Monster Rio Punch being discontinued?', seoTitle: 'Is Monster Rio Punch Being Discontinued? 2026 U.S. Rumor',
    description: 'Monster Rio Punch is rumored to leave U.S. distribution by October 1, 2026. The report is specific but unconfirmed, and Monster still lists Rio Punch publicly.',
    deck: 'A recent distributor report says Rio Punch may be discontinued in the United States by October 1. Monster still lists the drink, so this is a dated rumor watch rather than a confirmed goodbye.',
    answerHeading: 'Rio Punch is rumored to be ending in the U.S., but it is not confirmed.',
    answer: 'A September 8 community report says a Monster corporate email named Rio Punch, Rehab Green Tea, and Ultra Fantasy Ruby Red for discontinuation on or before October 1, 2026. Monster’s U.S. catalog and corporate filing still include Rio Punch, and no public manufacturer announcement was found. The claim is credible enough to monitor and too weak to publish as final fact.',
    sidebar: 'Reported October 1 U.S. exit; Monster still includes Rio Punch in public sources.', evidenceGrade: 'Developing', evidenceNote: 'Detailed distributor report with no authenticated document or completed national reset yet.',
    image: 'assets/images/journal/monster-rio-punch.webp', imageAlt: 'One Juice Monster Rio Punch 16 ounce can', caption: 'Rio Punch remains publicly listed while the reported October 2026 exit is investigated.', imageCredit: 'Smouk product packshot',
    cardCopy: 'Rio Punch appears in the same October rumor as Ruby Red and Green Tea, but public Monster sources still list it.',
    sections: [
      { id: 'report', heading: 'Where the Rio Punch rumor comes from', toc: 'Rumor source', paragraphs: [
        'The current claim comes from a September 8, 2026 post by someone who said they received a Monster corporate email. The post names three products and gives an on-or-before October 1 date for the United States, which makes the claim specific enough to verify over time.',
        'Other commenters discussed distributor sales and warehouse expectations, but those identities and statements cannot be independently authenticated from the thread. The original email itself has not been published as a verifiable document.'
      ]},
      { id: 'public-record', heading: 'What the public Monster record shows', toc: 'Public record', paragraphs: [
        'Monster launched Juice Monster Rio Punch in the United States in early 2024 and highlighted it in investor materials. The company’s 2025 Form 10-K still lists Rio Punch among Juice Monster products, and the current broad flavor directory continues to expose it.',
        'Those sources establish the product’s official history and current public presentation. They do not rule out a later internal discontinuation schedule, especially when the claimed date falls after the filing period.'
      ]},
      { id: 'retail', heading: 'How retail changes should be interpreted', toc: 'Retail signals', paragraphs: [
        'Rio Punch can already be unevenly distributed, so a missing can in one store should not be treated as confirmation. The meaningful pattern would be removal from chain planograms, closed distributor ordering, and sustained non-replenishment across unrelated markets.',
        'Existing cases can remain after any cutoff. A late-October sighting could still be old stock, while a newly date-coded U.S. production run after the claimed end would be evidence against the rumor.'
      ]},
      { id: 'other-markets', heading: 'Could Rio Punch continue outside the U.S.?', toc: 'Other markets', paragraphs: [
        'Yes. Monster launches products on different schedules across countries. Rio Punch entered some foreign markets after its American debut, and those operations do not have to follow a U.S. assortment decision.',
        'Import availability should therefore be described separately. A current foreign can proves that Rio Punch exists somewhere; it does not prove continued U.S. production or distribution.'
      ]}
    ],
    faq: [
      { question: 'Is Monster Rio Punch discontinued?', answer: 'Not confirmed as of September 11, 2026. A specific distributor report says a U.S. exit may occur on or before October 1.' },
      { question: 'Has Monster announced the change publicly?', answer: 'No public Monster announcement was found during this review.' },
      { question: 'When did Rio Punch launch?', answer: 'Monster documented the U.S. launch in early 2024.' },
      { question: 'Could Rio Punch remain available abroad?', answer: 'Yes. Country lineups and discontinuation schedules can differ.' }
    ],
    sources: [
      { label: 'Reddit r/monsterenergy: September 8 U.S. discontinuation report', url: monsterRumor, note: 'original community claim; unverified' },
      { label: 'Monster Beverage 2024 first-quarter release', url: 'https://www.sec.gov/Archives/edgar/data/865752/000110465924056393/tm2413295d1_ex99-1.htm', note: 'official U.S. launch evidence' },
      { label: 'Monster Beverage 2025 Form 10-K', url: monsterFiling, note: 'lists Rio Punch in the year-end portfolio' },
      { label: 'Monster Energy U.S.: current flavor directory', url: monsterCatalog, note: 'reviewed September 11, 2026' }
    ]
  },
  {
    slug: 'is-red-bull-fuji-apple-ginger-discontinued',
    brand: 'Red Bull', product: 'Red Bull Fuji Apple & Ginger', theme: 'yellow', statusKey: 'format', statusLabel: 'Flavor returned; U.S. Sugarfree retired', lane: 'U.S. flavor and formula status', readTime: 10, checkedDate: '2026-09-12',
    title: 'Is Red Bull Fuji Apple & Ginger discontinued?', seoTitle: 'Is Red Bull Fuji Apple & Ginger Discontinued? 2026 U.S. Status',
    description: 'No. Fuji Apple & Ginger returned permanently as Red Bull Apple Edition in 2026, but the Sugarfree version is not in the permanent U.S. lineup.',
    deck: 'The flavor is back in the United States as the permanent Red Bull Apple Edition. The part that disappeared is the Sugarfree formula: it launched here for winter 2025, but Red Bull brought back only the regular-sugar version in 2026.',
    answerHeading: 'The flavor returned permanently. The U.S. Sugarfree version did not.',
    answer: 'Red Bull relaunched Fuji Apple & Ginger nationwide on August 31, 2026 under the permanent Apple Edition name. Red Bull North America says the U.S. Apple Edition is only available with sugar. That makes the full-sugar flavor current, while the 2025 U.S. Winter Edition Sugarfree is a retired seasonal format rather than part of the new permanent range.',
    sidebar: 'Permanent U.S. Apple Edition is current; the 2025 U.S. Sugarfree version did not join the permanent lineup.', evidenceGrade: 'Official', evidenceNote: 'Red Bull North America directly confirmed the return date, permanent status, U.S. formats, and with-sugar-only availability.',
    image: 'assets/images/journal/red-bull-fuji-apple-ginger-sugarfree.webp', imageAlt: 'One Red Bull Winter Edition Sugarfree Fuji Apple and Ginger can', caption: 'The 2025 U.S. Winter Edition Sugarfree can. The flavor returned permanently in 2026, but this formula did not return to the U.S. lineup.', imageCredit: 'Red Bull product packshot',
    cardCopy: 'Fuji Apple & Ginger is back permanently as Apple Edition, but the U.S. Sugarfree can from winter 2025 did not return with it.',
    sections: [
      { id: 'what-returned', heading: 'What exactly returned in August 2026?', toc: 'The permanent return', paragraphs: [
        'Red Bull North America announced that Fuji Apple & Ginger returned to U.S. retailers on August 31, 2026 as Red Bull Apple Edition. The company describes it as a permanent addition to the Editions lineup, not another short winter run. The flavor profile remains Fuji apple with the warm spiciness of ginger, and the warm red-to-yellow gradient can carries forward the look used for the seasonal release.',
        'The permanent U.S. offering includes 8.4-fluid-ounce and 12-fluid-ounce individual cans plus 12-fluid-ounce four-packs. That product range matters because it establishes a normal national relaunch. Shoppers who cannot find it immediately may be seeing an uneven rollout or a store-level assortment decision, not a second discontinuation.'
      ]},
      { id: 'sugarfree-status', heading: 'Where did the Sugarfree Fuji Apple & Ginger go?', toc: 'Sugarfree status', paragraphs: [
        'The Sugarfree version was part of the original U.S. launch. Red Bull introduced Winter Edition Fuji Apple & Ginger nationwide on November 3, 2025 in both full-sugar and sugarfree formulas. Both were limited seasonal products, so the end of winter distribution applied to each exact Winter Edition SKU even though remaining cans could continue selling afterward.',
        'The 2026 return changed that formula lineup. Red Bull North America lists the Apple Edition format as “with sugar” and answers the availability question directly: Apple Edition is only available with sugar in the United States. The current U.S. Apple Edition page likewise describes sugar, lists 26 grams in an 8.4-ounce can, and does not offer an Apple Edition Sugarfree selection.'
      ]},
      { id: 'conflicting-pages', heading: 'Why do U.S. searches still show Sugarfree cans?', toc: 'Conflicting search results', paragraphs: [
        'Retail and brand URLs do not disappear the moment a seasonal SKU leaves the active range. Target and other U.S. retailers can still surface pages labeled Winter Edition Sugarfree or Apple Edition Sugarfree, sometimes with store-specific stock. Those pages document a real product from the 2025 release, but they do not override Red Bull North America’s statement about the permanent 2026 lineup.',
        'A retailer page can represent leftover inventory, a delayed warehouse allocation, a reused catalog record, or a listing that remains searchable after local stock ends. The useful check is the product identity and production history: a can marked Winter Edition Sugarfree belongs to the limited 2025 U.S. run unless Red Bull announces a new American Sugarfree Apple Edition.'
      ]},
      { id: 'international', heading: 'Is Apple Edition Sugarfree still made outside the United States?', toc: 'International availability', paragraphs: [
        'Yes. Red Bull’s Great Britain site currently presents Apple Edition Sugarfree in a 250-milliliter can with Fuji Apple & Ginger flavoring. That explains why fresh Sugarfree cans can appear in online searches and import listings even though the permanent U.S. range is regular sugar only.',
        'Country-specific availability must stay separate. A current British can proves that Apple Edition Sugarfree exists in that market; it does not establish current U.S. production or distribution. Buyers should inspect the volume, spelling, nutrition panel, importer label, and country information before deciding whether a can is leftover American stock or a current foreign-market product.'
      ]},
      { id: 'package-guide', heading: 'How to tell the seasonal and permanent cans apart', toc: 'Package guide', paragraphs: [
        'The 2025 U.S. cans say “The Winter Edition” and use the red-to-yellow gradient associated with Fuji Apple & Ginger. Sugarfree cans add a visible blue Sugarfree label and zero-sugar nutrition information. The 2026 permanent product uses the Apple Edition name while retaining the gradient design, so color alone is not enough to identify the release.',
        'For collectors, the edition name and formula are both part of the item. A Winter Edition Sugarfree can is a retired U.S. seasonal package even though Fuji Apple & Ginger is current again as a full-sugar drink. A current Apple Edition can is the permanent American product. Imported Apple Edition Sugarfree cans represent another market and should be labeled that way when offered for sale.'
      ]}
    ],
    faq: [
      { question: 'Is Red Bull Fuji Apple & Ginger discontinued in the U.S.?', answer: 'No. It returned nationwide as the permanent Red Bull Apple Edition on August 31, 2026.' },
      { question: 'Is Red Bull Apple Edition Sugarfree available in the U.S.?', answer: 'Not as part of the permanent 2026 U.S. lineup. Red Bull North America says Apple Edition is only available with sugar in the United States.' },
      { question: 'Was Fuji Apple & Ginger Sugarfree ever sold in the U.S.?', answer: 'Yes. The limited Winter Edition launched nationwide in both full-sugar and sugarfree versions on November 3, 2025.' },
      { question: 'Why can Target or another retailer still show Sugarfree?', answer: 'Retail pages can retain 2025 catalog records or remaining local inventory after a seasonal format ends. They do not establish a permanent 2026 U.S. relaunch.' },
      { question: 'Can current Sugarfree cans be imported?', answer: 'Yes. Red Bull currently lists Apple Edition Sugarfree in Great Britain, so newer foreign-market cans can appear online.' },
      { question: 'Is the old Winter Edition can collectible?', answer: 'Yes. The Winter Edition name and the U.S. Sugarfree formula are retired formats even though the flavor returned under the permanent Apple Edition name.' }
    ],
    sources: [
      { label: 'Red Bull North America: Apple Edition returns permanently', url: redBullAppleReturn, note: 'official August 31, 2026 announcement and U.S. Sugarfree answer' },
      { label: 'Red Bull U.S.: Apple Edition Fuji Apple & Ginger', url: redBullAppleUs, note: 'current U.S. product, sizes, and sugar information reviewed September 12, 2026' },
      { label: 'Red Bull: Winter Edition Fuji Apple & Ginger launch', url: redBullFujiLaunch, note: 'official November 3, 2025 launch of both U.S. formulas' },
      { label: 'Red Bull U.S.: current Red Bull Editions', url: redBullUsEditions, note: 'current lineup context reviewed September 12, 2026' },
      { label: 'Red Bull Great Britain: Apple Edition Sugarfree', url: redBullAppleSugarfreeGb, note: 'current foreign-market Sugarfree context reviewed September 12, 2026' },
      { label: 'Target: Winter 2025 Sugarfree product record', url: 'https://www.target.com/p/-/A-94796555', note: 'remaining U.S. retailer-page context, not current lineup evidence' }
    ]
  },
  rehabGreenTeaSeptemberReport,
  whitePineappleReport,
  aussieLemonadeReport,
  rehabStrawberryLemonadeReport,
  cafeLatteReport,
  newSodaRumorsReport,
  drinkFlavorWatchReport,
  falloutVaultDwellerReport,
  oreoFlavorVoteReport,
  sevenUpMiamiViceReport
];
