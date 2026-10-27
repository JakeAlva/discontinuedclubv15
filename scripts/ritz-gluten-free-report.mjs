const announcement = 'https://www.globenewswire.com/news-release/2026/10/19/3383670/35903/en/index.html';
const retailer = 'https://www.safeway.com/shop/pd/nabisco-ritz-gluten-free-original-crackers-8-oz/971427498';

export const ritzGlutenFreeReport = {
  slug: 'ritz-gluten-free-crackers-release-2026',
  brand: 'RITZ', brands: ['RITZ'], product: 'RITZ Gluten Free Original Crackers', theme: 'red',
  format: 'news-brief', checkedDate: '2026-10-27', readTime: 2,
  statusKey: 'launch', statusLabel: 'New format', lane: 'Snack aisle watch',
  title: 'Gluten-free RITZ are here. The wider rollout comes later.',
  seoTitle: 'Gluten-Free RITZ: October 2026 Release and Where to Look',
  description: 'A new RITZ format has a staged retail rollout. Read the confirmed timing, package size and practical checks before searching for a box.',
  deck: 'Look for the explicitly labeled box, not just the familiar red RITZ branding.',
  answerHeading: 'A separate product, with a two-stage launch.',
  answer: 'Mondelez announced Gluten Free Original crackers on October 19. Walmart and Albertsons are the first named retailers for October 2026; broader U.S. distribution is scheduled for February 2027.',
  sidebar: 'An announced rollout is not a live inventory count for your nearest store.',
  evidenceGrade: 'Manufacturer announcement',
  evidenceNote: 'Dated brand release, plus an identifiable retailer product record.',
  image: 'assets/images/journal/ritz-gluten-free-original-2026.jpg', imageWidth: 1200, imageHeight: 1200,
  imageAlt: 'Red and white RITZ box explicitly labeled gluten free original',
  caption: 'The distinct gluten-free package shown in Safeway\'s product listing. A product photograph does not confirm local availability.',
  imageCredit: 'Safeway / Albertsons product image',
  cardCopy: 'The new box has arrived, but the nationwide expansion is still ahead.',
  relatedSlugs: ['dupe-loops-sprouts-costco-mini-donuts-2026', 'chips-ahoy-minis-drizzled-caramel-fudge-2026', 'chessmen-spiced-orange-cranberry-cookies-fall-2026'],
  sections: [
    { id: 'the-box', heading: 'What is actually new?', toc: 'The new box', paragraphs: [
      `The <a href="${announcement}" target="_blank" rel="noopener noreferrer">manufacturer's release</a> describes a certified gluten-free Original flavor in an 8 oz package, with a suggested U.S. price of $4.49. It is a new option, not an announcement that every existing RITZ product has changed.`,
      'We have not taste-tested it. Claims about matching the familiar buttery flavor come from the brand, not a side-by-side review by Discontinued Club.'
    ]},
    { id: 'finding-stock', heading: 'Check the store, not just the search result', toc: 'Finding stock', paragraphs: [
      `A <a href="${retailer}" target="_blank" rel="noopener noreferrer">Safeway product page</a> now identifies the 8 oz gluten-free Original box. Select a location and check pickup or delivery availability before making a trip.`,
      'An empty result at one branch does not establish discontinuation. Equally, a catalog entry can remain visible without a sellable box behind it. Match the exact product title and front label, and check the final shelf price rather than assuming the suggested price applies everywhere.'
    ]},
    { id: 'compare-the-format', heading: 'Compare the format, not just the logo', toc: 'Package comparison', paragraphs: [
      'For a useful price comparison, start with net weight. At the announced $4.49 for 8 oz, the suggested price works out to about 56 cents per ounce, before any tax or delivery costs. That is a reference point, not a verified checkout quote. A cheaper-looking box in a search result may contain a different amount or be a different RITZ product entirely.',
      'Search using the complete phrase "RITZ Gluten Free Original" and check the package photo against the description. A generic RITZ category page is not enough to identify this release. If a store offers a substitution, review the replacement product separately instead of assuming that a similar red box is interchangeable.',
      'The distinction matters for our archive, too. A familiar brand gaining a new format does not mean its older formats are disappearing. The announcement establishes an addition and a distribution schedule; it does not establish a replacement. We would need separate evidence before describing an existing RITZ item as discontinued.'
    ]}
  ],
  statusParagraphs: ['This is a launch report. We have not verified stock at individual stores or a change to the rest of the RITZ range.'],
  buyerHeading: 'Read the package in hand',
  buyerParagraphs: ['Do not use the brand name alone to make dietary decisions. Read the current ingredients and allergen statements; retailer descriptions can lag behind packaging.'],
  faq: [
    { question: 'Does this mean every RITZ box is gluten-free?', answer: 'No. This report covers the specifically labeled new product, not a range-wide reformulation.' },
    { question: 'Does Discontinued Club have these crackers for sale?', answer: 'No. This is independent product news, not a store-stock announcement.' }
  ],
  disclosure: 'Independent reporting, not sponsored by RITZ or Mondelez. We have not taste-tested this product.',
  sources: [
    { label: 'Mondelez: RITZ Gluten Free Original launch', url: announcement, note: 'October 19 announcement; reviewed October 27, 2026' },
    { label: 'Safeway: 8 oz product record', url: retailer, note: 'package identification and image; not a local stock guarantee' }
  ]
};
