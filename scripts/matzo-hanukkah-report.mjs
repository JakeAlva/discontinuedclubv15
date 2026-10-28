const announcement = 'https://www.prweb.com/releases/the-matzo-project-launches-in-200-target-stores-nationwide-expands-to-600-stores-for-the-holidays-302919964.html';
const retailer = 'https://www.target.com/p/the-matzo-project-chocolate-dipped-matzo-chips-with-festive-sprinkles-5oz/-/A-1011059062';

export const matzoHanukkahReport = {
  slug: 'matzo-project-hanukkah-chocolate-chips-target-2026',
  brand: 'The Matzo Project', brands: ['The Matzo Project'], product: 'Hanukkah Chocolate-Dipped Matzo Chips', theme: 'blue',
  format: 'news-brief', checkedDate: '2026-10-28', readTime: 3,
  statusKey: 'launch', statusLabel: 'Holiday launch', lane: 'Seasonal snack watch',
  title: 'Chocolate-dipped matzo chips join Target\'s holiday lineup.',
  seoTitle: 'The Matzo Project Hanukkah Chips: Target Holiday Launch 2026',
  description: 'The Matzo Project announces a holiday Target expansion and chocolate-dipped Hanukkah chips. Here are the dates and the package details to check.',
  deck: 'The blue holiday bag is a seasonal addition, not a replacement for the everyday assortment.',
  answerHeading: 'A wider holiday rollout begins November 1.',
  answer: 'In its October 27 announcement, The Matzo Project says its Target presence will grow from roughly 200 stores to more than 600 from November 1 through December 15, 2026. Hanukkah Chocolate-Dipped Matzo Chips are part of that seasonal expansion.',
  sidebar: 'The rollout window is not an expiration date, and it is not a guarantee that each store carries every product.',
  evidenceGrade: 'Brand and retailer records',
  evidenceNote: 'A dated brand release establishes the schedule; Target identifies the specific seasonal package.',
  image: 'assets/images/journal/matzo-hanukkah-chocolate-chips-2026.jpg', imageWidth: 1200, imageHeight: 1200,
  imageAlt: 'Blue 5 oz Matzo Project bag labeled milk chocolate dipped matzo chips festively sprinkled for Hanukkah',
  caption: 'Target\'s product photograph identifies the blue Hanukkah package. This is the milk-chocolate version, not a plain matzo chip bag.',
  imageCredit: 'Target / The Matzo Project product image',
  cardCopy: 'A blue holiday bag and an expanded Target rollout, with a defined seasonal window.',
  relatedSlugs: ['ritz-gluten-free-crackers-release-2026', 'chessmen-spiced-orange-cranberry-cookies-fall-2026', 'trubar-drizzle-mini-rice-cakes-walmart-2026'],
  sections: [
    { id: 'the-holiday-bag', heading: 'What makes this the holiday version?', toc: 'The holiday bag', paragraphs: [
      `The <a href="${announcement}" target="_blank" rel="noopener noreferrer">brand's announcement</a> describes salted matzo chips dipped in milk chocolate and finished with blue-and-white nonpareils. The limited-time product is distinct from the brand's regular flats, chips and soup-related products.`,
      `The corresponding <a href="${retailer}" target="_blank" rel="noopener noreferrer">Target listing</a> identifies a 5 oz bag with festive sprinkles. Its front photograph explicitly names Hanukkah and milk chocolate. Those details are more useful for matching this release than simply searching for the brand and selecting the first blue package.`,
      'Do not treat a broad assortment claim as an ingredient statement for every item. A chocolate-coated seasonal snack and a plain chip are different products. Read the current ingredients and certification marks on the exact package you intend to buy, especially when choosing food for someone else.'
    ]},
    { id: 'calendar', heading: 'A distribution window is not a freshness clock', toc: 'The dates', paragraphs: [
      'The dates above describe the announced Target holiday assortment. They do not tell you when an individual bag was manufactured, what its best-by date is or whether it will remain on a particular shelf until the last day of the rollout. Those are separate questions that require the package or a store-level check.',
      'If you are shopping for a gathering, check fulfillment before building the menu around one seasonal item. An online product record establishes that the retailer recognizes the product; it does not guarantee pickup stock at your branch. Keep a fallback in mind and verify the final item if substitutions are enabled.'
    ]},
    { id: 'seasonal-versus-discontinued', heading: 'Seasonal does not mean already discontinued', toc: 'How we classify it', paragraphs: [
      'We are recording this as a holiday launch. It would be premature to describe an announced seasonal release as discontinued before its rollout has even begun. Likewise, a temporary out-of-stock message at one store would not settle whether the manufacturer plans another batch or a later return.',
      'For collectors of seasonal packaging, save the full product name and a clear photograph of the front and back rather than relying on a screenshot of a search result. That gives you a record of the edition, size and labeling without turning a future availability question into a claim of rarity.',
      'For snack buyers, the useful comparison is simpler: check the amount in the bag, the final delivered price and whether the package is the exact coated version you wanted. We have not tried it, so we are not scoring sweetness, crunch or how well it travels. A product announcement cannot substitute for a hands-on review.'
    ]}
  ],
  statusParagraphs: ['This report covers the announced holiday release and its identifiable retail package. Local availability and the remaining shelf life of individual bags have not been verified.'],
  buyerHeading: 'Check the label, not a general brand description',
  buyerParagraphs: ['The package shown is milk-chocolate dipped. Do not carry dietary assumptions from a plain matzo product over to this one. For gifting or serving a group, keep the original packaging available so guests can read the ingredient and allergen information themselves.'],
  faq: [
    { question: 'Is the holiday bag the entire Target assortment?', answer: 'No. It is a seasonal addition. The brand also announced a continuing core assortment; the holiday package should not be confused with those everyday items.' },
    { question: 'Does the end of the rollout mean every bag expires then?', answer: 'No. A retail assortment window and a printed best-by date are separate. Check the actual bag for its date.' },
    { question: 'Is this available from Discontinued Club?', answer: 'No. This article is independent news coverage and does not advertise stock in our store.' }
  ],
  disclosure: 'Independent reporting, not sponsored by The Matzo Project or Target. We have not taste-tested this product or confirmed stock at individual stores.',
  sources: [
    { label: 'The Matzo Project: Target holiday expansion', url: announcement, note: 'Published October 27; reviewed October 28, 2026. Rollout schedule and seasonal product announcement.' },
    { label: 'Target: Chocolate Dipped Matzo Chips with Festive Sprinkles', url: retailer, note: '5 oz product identification and package photograph; not a local availability guarantee.' }
  ]
};
