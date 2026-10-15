const announcement = 'https://www.pepsico.com/en/newsroom/press-releases/2026/bubly-sparkling-water-stirs-up-two-new-mocktail-inspired-flavors-for-a-limited-time';
const label = 'https://www.pepsicoproductfacts.com/home/product?gtin=00012000251276';

export const bublyFallMocktailsReport = {
  slug: 'bubly-berry-sparkle-sangria-paradise-paloma-2026',
  brand: 'Bubly', product: 'Bubly Berry Sparkle Sangria and Paradise Paloma', theme: 'berry',
  checkedDate: '2026-10-15', editionDate: '2026-10-15', readTime: 3,
  statusKey: 'launch', statusLabel: 'Confirmed limited edition', lane: 'Sparkling water watch',
  title: 'Bubly Sangria and Paloma: cocktail names, no alcohol.',
  seoTitle: 'Bubly Sangria and Paloma 2026: Flavors, Alcohol and Limited-Edition Status',
  description: 'Bubly Berry Sparkle Sangria and Paradise Paloma are limited U.S. fall releases. See their flavor profiles, alcohol-free status and what the Sangria label says.',
  deck: 'Two mocktail-inspired waters joined the fall lineup in September. Here is what to know if you are spotting them now.',
  answerHeading: 'They are alcohol-free sparkling waters, not canned cocktails.',
  answer: 'PepsiCo announced both flavors as limited U.S. releases, with distribution starting September 7, 2026. Their cocktail-inspired names do not mean they contain alcohol.',
  sidebar: 'This is an October guide to a September launch. Limited availability is confirmed; a fixed final sale date or future return is not.',
  evidenceGrade: 'Manufacturer announcement + product label',
  evidenceNote: 'The release establishes the launch window. The nutrition details below refer specifically to Berry Sparkle Sangria, whose label we checked separately.',
  image: 'assets/images/journal/bubly-berry-sparkle-sangria-official.webp', imageWidth: 700, imageHeight: 700,
  imageAlt: 'One pink and purple Bubly Berry Sparkle Sangria sparkling water can',
  caption: 'Berry Sparkle Sangria, one of the two fall releases. Official pack image, not an AI rendering.', imageCredit: 'PepsiCo Product Facts',
  cardCopy: 'What the cocktail names mean, what is in the Sangria can and why neither flavor is confirmed permanent.',
  relatedSlugs: ['hint-treat-yourself-dessert-water-flavors-2026', 'poppi-sour-apple-limited-edition-october-2026', 'olipop-pomegranate-sparkle-limited-edition-2026'],
  sections: [
    { id: 'flavors', heading: 'What are the new Bubly flavors?', toc: 'Sangria versus Paloma', paragraphs: [
      `The <a href="${announcement}" target="_blank" rel="noopener noreferrer">September 8 PepsiCo announcement</a> describes <strong>Berry Sparkle Sangria</strong> with raspberry, lemon, orange, strawberry and lime notes, and <strong>Paradise Paloma</strong> with grapefruit and lime. Both arrive in eight-packs of 12-ounce cans.`,
      'Those are the manufacturer\'s flavor descriptions, not our tasting notes. A familiar cocktail name tells you the inspiration, but it does not promise the sweetness, texture or strength of the drink it references. That distinction is useful before buying an entire pack expecting a ready-made mixed drink.'
    ]},
    { id: 'label', heading: 'Does Bubly Sangria contain sugar, juice or caffeine?', toc: 'Inside the Sangria can', paragraphs: [
      `The <a href="${label}" target="_blank" rel="noopener noreferrer">official Berry Sparkle Sangria product record</a> lists carbonated water and natural flavor as its ingredients. A 12-fluid-ounce can is listed at zero calories, zero grams of sugar, zero milligrams of caffeine and zero percent juice.`,
      'In other words, the fruit names describe flavor, not a fruit-juice blend. The listed formula is also not a zero-sugar soda sweetened to imitate a sugary one: no sweetener appears in that ingredient list. Read the can you buy for the applicable formulation, since online product information and packaging can change.',
      'This label check should not be stretched into a claim that every product using the Bubly name has identical ingredients. Match the exact flavor and package, especially when comparing a sparkling water with another beverage carrying a similar name.'
    ]},
    { id: 'limited', heading: 'Are these permanent flavors or fall limited editions?', toc: 'How long they last', paragraphs: [
      `PepsiCo calls this a limited release available while supplies last, with U.S. retail distribution in stores and online. Its <a href="${announcement}" target="_blank" rel="noopener noreferrer">announcement</a> does not give a calendar end date or confirm a permanent place in the lineup.`,
      'That leaves an important middle ground between permanent and already discontinued. A seasonal product can still be in its announced selling window while individual stores sell out. We would not describe a local empty shelf as proof that the entire release has ended.',
      'We have not verified a later-season return. Planning around a possible comeback is different from planning around one the manufacturer has actually announced.'
    ]},
    { id: 'shopping', heading: 'What should you check before buying a pack?', toc: 'A practical stock check', paragraphs: [
      'Search the full flavor name, then set your store or delivery location before relying on a retailer\'s availability message. Berry Sparkle Sangria and Paradise Paloma are distinct items; a result for one is not confirmation that the other is stocked.',
      'Compare the total number of cans, volume per can and delivered price. A search-result thumbnail or an old retailer page can remain visible after a particular seller runs out, so the current product detail and checkout availability matter more than the thumbnail.',
      'We have not checked stock at your local stores. This guide establishes what the release is and how it was announced; it is not a promise that any specific store has a pack waiting.'
    ]}
  ],
  statusParagraphs: ['The confirmed status is a limited fall release, not a permanent addition or a verified nationwide discontinuation. A later change would need fresh evidence.'],
  buyerHeading: 'Independent coverage beyond our shelves',
  buyerParagraphs: ['Discontinued Club does not currently sell these Bubly flavors. We cover new and limited products whether or not they appear in our store.'],
  faq: [
    { question: 'Does Bubly Berry Sparkle Sangria contain alcohol?', answer: 'No. PepsiCo describes it as an alcohol-free sparkling water inspired by a cocktail.' },
    { question: 'Is Bubly Paradise Paloma permanent?', answer: 'The announcement identifies a limited release. It does not confirm a permanent addition or give a fixed end date.' }
  ],
  disclosure: 'Independent reporting, not sponsored by Bubly or PepsiCo. We have not taste-tested either flavor.',
  sources: [
    { label: 'PepsiCo: two new mocktail-inspired Bubly flavors', url: announcement, note: 'September 8, 2026; launch, flavor profiles, package format and limited availability' },
    { label: 'PepsiCo Product Facts: Berry Sparkle Sangria', url: label, note: 'checked October 15, 2026; ingredients, serving size and nutrition' }
  ]
};
