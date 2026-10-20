const brazilReport = 'https://gkpb.com.br/199687/red-bull-frutas-citricas/';
const usReport = 'https://sporked.com/article/this-new-red-bull-is-carnaval-in-a-can-but-you-wont-find-it-at-walmart/';
const extra = 'https://www.extramercado.com.br/produto/1673432/energetico-frutas-citricas-zero-acucar-red-bull-lata-the-carnaval-edition-250ml';
const rappi = 'https://www.rappi.com.br/p/red-bull-energetico-the-carnaval-ed-110664537';
const usEditions = 'https://www.redbull.com/us-en/energydrink/questions/red-bull-editions';
const summer = 'https://www.redbull.com/us-en/energydrink/questions/what-is-the-flavor-of-the-new-red-bull-summer-edition';

export const redBullCarnavalEditionReport = {
  slug: 'red-bull-carnaval-edition-flavor-us-release',
  brand: 'Red Bull', brands: ['Red Bull'], product: 'Red Bull Carnaval Edition', theme: 'yellow',
  format: 'news-brief', checkedDate: '2026-10-20', editionDate: '2026-10-20', readTime: 3,
  statusKey: 'launch', statusLabel: 'U.S. launch not confirmed', lane: 'International flavor watch',
  title: 'Red Bull Carnaval Edition: Is it coming to the U.S.?',
  seoTitle: 'Red Bull Carnaval Edition: Flavor, Brazil and U.S. Release',
  description: 'Red Bull Carnaval Edition has Brazilian retailer listings, but no confirmed U.S. launch. See the citrus flavor, reported timing and Sudachi Lime comparison.',
  deck: 'A yellow can, colorful Carnaval lettering and a citrus flavor are drawing attention. Here is what the Brazilian listings tell us, and what they do not.',
  answerHeading: 'Brazilian listings exist. A U.S. release is not confirmed.',
  answer: 'Red Bull Carnaval Edition is being reported for Brazil with the flavor Frutas C\u00edtricas, meaning citrus fruits. As of October 20, 2026, we have not found an official U.S. launch announcement or a confirmed first-sale date.',
  sidebar: 'Do not read Brazilian product listings as confirmation of American distribution.',
  evidenceGrade: 'Retail listings + early reporting',
  evidenceNote: 'Product identity has retailer support; launch timing and U.S. availability remain unconfirmed.',
  image: 'assets/images/journal/red-bull-carnaval-edition-can-2026.webp', imageWidth: 1200, imageHeight: 675,
  imageAlt: 'Yellow Red Bull The Carnaval Edition 250 ml can labeled Frutas Citricas with multicolored Carnaval lettering',
  caption: 'The can image published with GKPB\'s report. This is not our own shelf photograph or a U.S. package.',
  imageCredit: `<a href="${brazilReport}" target="_blank" rel="noopener noreferrer">GKPB</a>`,
  cardCopy: 'Brazilian listings, the citrus flavor and the unanswered U.S. release question.',
  relatedSlugs: ['is-red-bull-arctic-berry-back-2026-advent-calendar', 'is-red-bull-fuji-apple-ginger-discontinued', 'is-red-bull-blue-edition-blueberry-discontinued'],
  sections: [
    { id: 'flavor', heading: 'What flavor is Red Bull Carnaval Edition?', toc: 'The citrus flavor', paragraphs: [
      `<a href="${brazilReport}" target="_blank" rel="noopener noreferrer">GKPB's October 15 report</a> names Frutas C\u00edtricas and describes a limited Brazilian release in 250 ml cans, with regular and sugar-free versions. It does not identify a definitive blend of individual fruits.`,
      'That leaves an important gap between a flavor category and a tasting review. We have not sampled this edition, so we cannot tell you whether orange, lemon or another fruit dominates. A yellow label is not a recipe, and online tasting claims should not be treated as manufacturer confirmation.'
    ]},
    { id: 'retailer-evidence', heading: 'Is it a real listing or just a social-media rumor?', toc: 'Retailer evidence', paragraphs: [
      `There is more to check than a circulating image. <a href="${extra}" target="_blank" rel="noopener noreferrer">Extra Mercado has a product page</a> naming The Carnaval Edition, citrus flavor, zero sugar and a 250 ml can. The page reviewed for this article showed the item as unavailable.`,
      `<a href="${rappi}" target="_blank" rel="noopener noreferrer">Rappi also lists Carnaval Edition</a>, with a sugar-free description, but displayed regional unavailability for Greater S\u00e3o Paulo. That is a location-specific result, not a statement about every shop in Brazil.`,
      'Our conclusion: retailer catalog entries support the product identity, but do not establish when customers can actually buy it. A product page can exist before stock arrives. Equally, an unavailable listing does not prove a drink has already launched, sold out or been discontinued.'
    ]},
    { id: 'release-date', heading: 'When is Carnaval Edition coming out?', toc: 'Release timing', paragraphs: [
      `The reports are not equally specific. GKPB connects the edition with Carnaval 2027 and says it should arrive soon. <a href="${usReport}" target="_blank" rel="noopener noreferrer">Sporked's October 18 coverage</a> describes an early-2027 release as probable and treats the news as a leak, rather than a finalized launch announcement.`,
      'Neither gives us a verified on-sale day. We are therefore not publishing a January release date, a countdown or a nationwide availability claim. The festival tie-in is useful context; it is not a substitute for a dated brand announcement or a retailer confirming stock.'
    ]},
    { id: 'us-release', heading: 'Can you buy Red Bull Carnaval Edition in the U.S.?', toc: 'U.S. availability', paragraphs: [
      `We did not find Carnaval Edition in the <a href="${usEditions}" target="_blank" rel="noopener noreferrer">official U.S. Editions information</a> checked for this report. That is not proof it will never reach America. It means we cannot currently present it as an announced domestic release.`,
      'An importer offering a Brazilian can would be a separate development. If a listing appears, check the actual photos, country labeling, seller location and whether it is in hand or a preorder. Shipping a can to an American address is not the same thing as Red Bull launching that edition through U.S. stores.'
    ]},
    { id: 'sudachi-lime', heading: 'Is Carnaval Edition the same as Sudachi Lime?', toc: 'Sudachi Lime comparison', paragraphs: [
      `That has not been established. Red Bull's <a href="${summer}" target="_blank" rel="noopener noreferrer">official Summer Edition description</a> identifies lime, sudachi and a hint of pomelo. The Carnaval material reviewed here uses the broader citrus-fruit description without confirming a matching formula.`,
      'Similar colors and overlapping flavor families are not enough to call this a renamed Summer Edition. For now, treat them as separately labeled products with an unanswered formula comparison, not as proven duplicates or proven completely different recipes.'
    ]}
  ],
  statusParagraphs: ['The status badge refers to the U.S. launch question. It does not dismiss the Brazilian retailer evidence. We separate three things: a product appearing in a catalog, a store having it available, and a manufacturer announcing its distribution.'],
  buyerHeading: 'More Red Bull flavor news',
  buyerParagraphs: [
    'For a comeback with official U.S. documentation, see our <a href="journal/is-red-bull-arctic-berry-back-2026-advent-calendar.html">Arctic Berry return guide</a>. For older editions, our <a href="discontinued-red-bull-flavors.html">discontinued Red Bull flavor index</a> separates retired American products from international availability.',
    'This page is a news report, not a Carnaval Edition stock offer or preorder. The source links let you check the underlying evidence rather than rely on a repost of the can alone.'
  ],
  faq: [
    { question: 'Is Red Bull Carnaval Edition coming to America?', answer: 'No official U.S. launch was found in the sources checked on October 20, 2026. Future plans remain unconfirmed.' },
    { question: 'Is there a sugar-free Carnaval Edition?', answer: 'Extra Mercado and Rappi both have listings identifying a sugar-free version. Their reviewed pages did not confirm available stock.' },
    { question: 'Is it Carnaval or Carnival Edition?', answer: 'The pictured can and Brazilian listings use Carnaval. Use that spelling when searching for this specific edition.' }
  ],
  disclosure: 'Independent reporting, not sponsored by or affiliated with Red Bull. No taste test, verified local stock or U.S. distribution is implied.',
  sources: [
    { label: 'GKPB: Carnaval Edition citrus report', url: brazilReport, note: 'October 15, 2026; early Brazilian reporting and published can image' },
    { label: 'Sporked: Carnaval Edition coverage', url: usReport, note: 'October 18, 2026; early-2027 timing presented as probable, not confirmed' },
    { label: 'Extra Mercado: zero-sugar Carnaval Edition listing', url: extra, note: 'reviewed October 20, 2026; catalog evidence, displayed unavailable' },
    { label: 'Rappi Brazil: Carnaval Edition listing', url: rappi, note: 'reviewed October 20, 2026; displayed unavailable in Greater Sao Paulo' },
    { label: 'Red Bull U.S.: Editions information', url: usEditions, note: 'checked October 20, 2026; no Carnaval announcement found here' },
    { label: 'Red Bull U.S.: Summer Edition flavor', url: summer, note: 'checked October 20, 2026; comparison only, not proof of identical formulas' }
  ]
};
