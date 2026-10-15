const product = 'https://www.drinkpoppi.com/products/sour-apple';
const timing = 'https://www.pepsico.com/en/newsroom/stories/2026/back-to-school-stock-dorm-pepsico-food-drinks';
const halloween = 'https://www.pepsico.com/en/newsroom/stories/2026/halloween-snacks-drinks-variety-packs-from-pepsico-for-spooky-season';

export const poppiSourAppleReport = {
  slug: 'poppi-sour-apple-limited-edition-october-2026',
  brand: 'Poppi', product: 'Poppi Sour Apple', theme: 'green',
  checkedDate: '2026-10-15', editionDate: '2026-10-15', readTime: 3,
  statusKey: 'launch', statusLabel: 'Confirmed limited edition', lane: 'Seasonal soda watch',
  title: 'Is Poppi Sour Apple limited edition? What its October window means.',
  seoTitle: 'Is Poppi Sour Apple Limited Edition? October 2026 Availability',
  description: 'Poppi Sour Apple is limited edition. PepsiCo says through the end of October, while supplies last. See the U.S. status, ingredients and shopping guidance.',
  deck: 'The green can is still being promoted for fall. That is different from a promise that it is joining the permanent lineup.',
  answerHeading: 'Yes, it is limited edition. It is not confirmed discontinued today.',
  answer: 'Poppi labels Sour Apple a limited edition, and PepsiCo gives an end-of-October availability window subject to supplies. Its official product page remains live at our October 15 check.',
  sidebar: 'Current seasonal offering, not a verified permanent flavor. We have not found a confirmed return date for a later season in the sources below.',
  evidenceGrade: 'Official product + dated seasonal guidance',
  evidenceNote: 'The product listing and two PepsiCo seasonal articles support the status. An individual store running out would not establish a nationwide end.',
  image: 'assets/images/journal/poppi-sour-apple-official.webp', imageWidth: 1400, imageHeight: 1400,
  imageAlt: 'One bright green Poppi Sour Apple can surrounded by green apples and sour candy in the official product photograph',
  caption: 'Official Sour Apple campaign photo. Props illustrate the flavor theme; read the label for ingredients.', imageCredit: 'Poppi',
  cardCopy: 'A clear answer to the limited-edition question, including the October window and what it does not guarantee.',
  relatedSlugs: ['olipop-pomegranate-sparkle-limited-edition-2026', 'hint-treat-yourself-dessert-water-flavors-2026', 'is-7up-shirley-temple-coming-back-2026'],
  sections: [
    { id: 'window', heading: 'How long is Poppi Sour Apple available?', toc: 'The October window', paragraphs: [
      `In its <a href="${timing}" target="_blank" rel="noopener noreferrer">September 18 back-to-school guide</a>, PepsiCo said the flavor would be available through the end of October, while supplies last. Its <a href="${halloween}" target="_blank" rel="noopener noreferrer">October 9 Halloween roundup</a> continued to feature Sour Apple as a seasonal option.`,
      'Our reading is that this is a stated seasonal window, not a precise national shelf-clearance date. A store could run out sooner; another could have remaining cans afterward. Neither situation, by itself, demonstrates a permanent lineup change.',
      'That matters if you found this page after seeing an empty shelf. The most useful immediate question is whether your store has sold through its allocation, not whether every can in the country disappeared on the same day.'
    ]},
    { id: 'flavor', heading: 'What flavor is the green Poppi can?', toc: 'Flavor and label', paragraphs: [
      `PepsiCo describes a green-apple profile with candy-like sweetness and a sour finish in its <a href="${halloween}" target="_blank" rel="noopener noreferrer">Halloween article</a>. We have not tasted it, so that description should not be read as a Discontinued Club review or a comparison with a specific candy.`,
      `The <a href="${product}" target="_blank" rel="noopener noreferrer">official product page</a> lists 35 calories, 5 grams of total sugar and 3 grams of fiber per can. Its ingredients include cane sugar and stevia leaf extract: this is not a zero-sugar drink or an unsweetened water. Use the can you purchase for the current nutrition and ingredient information.`
    ]},
    { id: 'find-it', heading: 'Where should you look before paying a resale premium?', toc: 'Finding a can', paragraphs: [
      `Start with <a href="${product}" target="_blank" rel="noopener noreferrer">Poppi's product page and store finder</a>, then check the retailer with your location selected. We have not verified local inventories, so a national listing should be treated as a lead, not a reservation.`,
      'For an online listing, compare the number of cans, their volume, shipping and total price. A twelve-pack should not be compared directly with the price of a single can, and a sold-out message from one seller is not proof that a resale premium is justified everywhere.',
      'If you are trying it for the first time, a single can where available is a more cautious purchase than a full case bought only because a flavor is seasonal. Scarcity is not a substitute for knowing whether you enjoy the drink.',
      'For a reader tracking the flavor over time, keep the seasonal window and the date of the stock check together. A screenshot without a date quickly loses its usefulness, especially when an old search result remains visible after a promotion has ended.'
    ]}
  ],
  statusParagraphs: ['We keep seasonal availability separate from discontinuation. A future permanent release, extension or return would need fresh evidence; this October guide does not predict one.'],
  buyerHeading: 'A seasonal-news report',
  buyerParagraphs: ['Discontinued Club does not currently sell Poppi Sour Apple. This article is part of our wider coverage of new and disappearing flavors, including products outside our store inventory.'],
  faq: [
    { question: 'Is Poppi Sour Apple permanent?', answer: 'The sources reviewed call it limited edition, not permanent.' },
    { question: 'Does an empty shelf mean it has been discontinued?', answer: 'No. Local stock alone cannot establish a nationwide status change.' }
  ],
  disclosure: 'Independent reporting, not sponsored by Poppi or PepsiCo. No tasting or health benefit is claimed.',
  sources: [
    { label: 'Poppi: Sour Apple product page', url: product, note: 'checked October 15, 2026; product status, label information and official photography' },
    { label: 'PepsiCo: back-to-school food and drinks', url: timing, note: 'September 18, 2026; end-of-October window, while supplies last' },
    { label: 'PepsiCo: Halloween snacks and drinks', url: halloween, note: 'October 9, 2026; current seasonal promotion and flavor description' }
  ]
};
