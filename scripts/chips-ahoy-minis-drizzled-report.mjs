const announcement = 'https://www.globenewswire.com/news-release/2026/10/21/3385669/35903/en/chips-ahoy-brand-launches-two-new-minis-drizzled-cookies-in-caramel-and-fudge.html';
const retailer = 'https://www.shaws.com/shop/pd/chips-ahoy-minis-drizzled-caramel-cookies-6-oz/971427683';
const artwork = 'https://www.globenewswire.com/NewsRoom/AttachmentNg/cc8127f9-93c8-4e21-bdb8-52ee7960f258';

export const chipsAhoyMinisDrizzledReport = {
  slug: 'chips-ahoy-minis-drizzled-caramel-fudge-2026',
  brand: 'CHIPS AHOY!', brands: ['CHIPS AHOY!'], product: 'CHIPS AHOY! Minis Drizzled', theme: 'blue',
  format: 'news-brief', checkedDate: '2026-10-22', editionDate: '2026-10-22', readTime: 3,
  statusKey: 'current', statusLabel: 'New retail rollout', lane: 'Cookie launch guide',
  title: 'CHIPS AHOY! Minis get a caramel and fudge drizzle',
  seoTitle: 'CHIPS AHOY! Minis Drizzled: Caramel, Fudge and Where to Buy',
  description: 'New CHIPS AHOY! Minis Drizzled cookies are rolling out in Caramel and Fudge. Here are the bag sizes, a retailer reference and what limited availability means.',
  deck: 'A new finish for the bite-size cookie. Here is what to look for on the bag before heading to the snack aisle.',
  answerHeading: 'Two new varieties, with a limited retail rollout.',
  answer: `Mondelēz announced Minis Caramel Drizzled and Minis Fudge Drizzled on <a href="${announcement}" target="_blank" rel="noopener noreferrer">October 21, 2026</a>. Today's guide separates that announcement from store-by-store availability.`,
  sidebar: 'Newly announced. Check the exact product and your location before making a trip.',
  evidenceGrade: 'Brand announcement + retailer listing',
  evidenceNote: 'Sources reviewed October 22, 2026. No local stock or taste test is implied.',
  image: 'assets/images/journal/chips-ahoy-minis-drizzled-official-2026.webp', imageWidth: 855, imageHeight: 480,
  imageAlt: 'Official CHIPS AHOY! Minis Drizzled Fudge and Caramel bags with drizzled cookies on a blue background',
  caption: 'Official launch artwork showing both varieties.',
  imageCredit: 'CHIPS AHOY! / Mondelez International via GlobeNewswire',
  cardCopy: 'Two drizzled Minis, the bag sizes and why a limited rollout is not a discontinued verdict.',
  relatedSlugs: ['oreo-banana-pudding-return-2027-vote-winner', 'chessmen-spiced-orange-cranberry-cookies-fall-2026', 'bauducco-skippy-peanut-butter-chocottone-2026'],
  sections: [
    { id: 'flavors-and-bags', heading: 'What changed, and how big are the bags?', toc: 'Flavors and sizes', paragraphs: [
      'The brand describes crunchy, bite-size fudgy chocolate-chip cookies with either a caramel or fudge topping. The announced formats are a 6-ounce resealable pouch and a 2.5-ounce tear bag, with the smaller format sold through convenience stores.',
      `The <a href="${retailer}" target="_blank" rel="noopener noreferrer">Shaw's Caramel product page</a> also identifies a 6-ounce resealable bag and describes a caramel-flavored drizzle. Look for the full Minis Drizzled name, rather than assuming any small CHIPS AHOY! bag is this release.`,
      'We have not tasted either version. The packaging can tell you which topping you are buying; it cannot tell you which one you will prefer.'
    ]},
    { id: 'where-to-look', heading: 'Where can you look for them?', toc: 'Where to look', paragraphs: [
      'The announcement says availability is limited to certain retailers. It does not provide a complete chain list, a nationwide shelf date or a suggested retail price.',
      `Shaw's has a <a href="${retailer}" target="_blank" rel="noopener noreferrer">catalog page for Caramel</a>, which is a useful starting point for shoppers in its service area. That page is not confirmation that your nearest location has it, and it does not establish Fudge availability.`,
      'Set your pickup store or delivery ZIP code first. Then check the flavor, bag weight and number of bags in the offer. Compare the price per ounce and delivery fees rather than treating the lowest headline price as the best deal.'
    ]},
    { id: 'compare-value', heading: 'Compare the bag, not just the price tag', toc: 'Comparing value', paragraphs: [
      'The larger pouch contains 2.4 times as much cookie weight as the smaller bag: six divided by 2.5. That is our size comparison, not a claim about cookie count. At the same price per ounce, one large pouch would cost the same as 2.4 small bags. Use that relationship to check whether a bundle actually offers better value.',
      'For a first try, buying the smallest available bag may still make more sense than chasing a bulk discount. A lower unit price is only useful if you want that quantity. Check whether an online offer contains one flavor or a mixed assortment, too.'
    ]}
  ],
  statusParagraphs: [
    'Limited distribution is not the same as limited edition. The reviewed launch announcement does not establish a seasonal end date or a permanent-lineup commitment. We are recording a new rollout, not predicting a discontinuation.'
  ],
  buyerHeading: 'A useful side-by-side comparison',
  buyerParagraphs: [
    'If both flavors reach your area, compare equivalent bag sizes and write down what you actually notice: crunch, topping coverage and sweetness. Keep those personal impressions separate from the package description. One shopper finding a bag also should not become a claim that an entire chain stocks it.',
    'For another cookie story with a different timeline, our <a href="journal/oreo-banana-pudding-return-2027-vote-winner.html">Banana Pudding OREO report</a> covers a planned return. A future comeback and a newly announced shelf rollout deserve different labels.'
  ],
  faq: [
    { question: 'Are Minis Drizzled discontinued?', answer: 'No discontinuation is established by the sources reviewed here. This is launch coverage.' },
    { question: 'Does a product page mean my store has it?', answer: 'No. Select your location and check the exact item before traveling or ordering.' },
    { question: 'Is this a taste review?', answer: 'No. We have not tried the cookies; this guide documents the release and shopping details.' }
  ],
  disclosure: 'Independent coverage, not sponsored by CHIPS AHOY!, Mondelez International or Shaw\'s. Retailer links are references, not promises of availability.',
  sources: [
    { label: 'Mondelez International: Minis Drizzled launch', url: announcement, note: 'October 21, 2026; flavors, formats and distribution wording' },
    { label: 'Shaw\'s: Caramel Minis Drizzled, 6 ounces', url: retailer, note: 'retailer product record checked October 22, 2026; local stock not confirmed' },
    { label: 'CHIPS AHOY!: official launch image', url: artwork, note: 'manufacturer-supplied press artwork' }
  ]
};
