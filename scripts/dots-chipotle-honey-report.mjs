const announcement = 'https://hershey.gcs-web.com/news-releases/news-release-details/winning-season-tastes-dots-fall-football-season';
const product = 'https://www.hersheyland.com/products/dots-homestyle-pretzels-chipotle-honey-flavored-seasoned-pretzel-twists-16-oz-bag.html';
const smallBag = 'https://www.hersheyland.com/products/dots-homestyle-pretzels-chipotle-honey-flavored-seasoned-pretzel-twists-5-oz-bag.html';

export const dotsChipotleHoneyReport = {
  slug: 'dots-chipotle-honey-pretzels-limited-edition-2026',
  brand: "Dot's", product: "Dot's Chipotle Honey Pretzels", theme: 'gold',
  checkedDate: '2026-10-15', editionDate: '2026-10-15', readTime: 3,
  statusKey: 'launch', statusLabel: 'Confirmed limited edition', lane: 'Seasonal snack news',
  title: "Dot's Chipotle Honey pretzels bring sweet heat to the fall lineup.",
  seoTitle: "Dot's Chipotle Honey Pretzels: Limited Edition, Sizes & Status",
  description: "Dot's Chipotle Honey pretzels are a confirmed limited-edition fall flavor. See the official bag sizes, flavor description and what is known about availability.",
  deck: 'The yellow bag is a separate flavor, not a redesign of Original. Here is what the official listings tell us.',
  answerHeading: 'Chipotle Honey is a limited-time addition, not a replacement for Original.',
  answer: "Hershey introduced it in its September 16 fall campaign. Official product pages list the flavor in two bag sizes, and the brand still identifies it as limited edition at our October 15 check.",
  sidebar: 'Confirmed seasonal snack. No exact final sale date appears in the announcement reviewed.',
  evidenceGrade: 'Official announcement + product pages',
  evidenceNote: 'The brand confirms the product and limited status. We have not checked stock or prices at individual retailers.',
  image: 'assets/images/journal/dots-chipotle-honey-official.webp', imageWidth: 1200, imageHeight: 1200,
  imageAlt: "One yellow 16-ounce bag of Dot's Homestyle Pretzels Chipotle Honey seasoned pretzel twists",
  caption: 'The official 16-ounce package. Check the weight when comparing it with smaller bags.', imageCredit: 'The Hershey Company',
  cardCopy: 'A new seasonal pretzel flavor, two bag sizes and a limited-edition label worth understanding.',
  relatedSlugs: ['wingstop-sour-patch-kids-wicked-punch-release-2026', 'utz-chicken-dipping-sauce-chips-new-flavor-2026', 'little-debbie-hot-cocoa-mini-muffins-christmas-2026'],
  sections: [
    { id: 'new-flavor', heading: 'What is new about Chipotle Honey?', toc: 'The new flavor', paragraphs: [
      `Hershey's <a href="${announcement}" target="_blank" rel="noopener noreferrer">September announcement</a> positions Chipotle Honey alongside Original for fall football season. The described combination is honey sweetness and smoky chipotle heat over the brand's buttery seasoning. This is a new flavor offering, not an announcement that the core pretzel is disappearing.`,
      'We have not taste-tested it. In particular, the brand does not give a useful numeric heat scale in the sources we checked, so we would not label it mild or intensely hot based on the package alone.'
    ]},
    { id: 'bag-sizes', heading: 'Which bag sizes are listed?', toc: 'Sizes and packaging', paragraphs: [
      `Hersheyland has separate listings for a <a href="${product}" target="_blank" rel="noopener noreferrer">16-ounce bag</a> and a <a href="${smallBag}" target="_blank" rel="noopener noreferrer">5-ounce bag</a>. Both identify Chipotle Honey as limited edition. The larger package is pictured here.`,
      'For price comparisons, divide the price by the number of ounces rather than comparing the two bag totals. The smaller bag can still be the sensible first purchase if you only want to find out whether you like the seasoning. Better value per ounce is not better value if most of a larger bag goes uneaten.',
      'Check the full flavor name, too. Honey Mustard and Chipotle Honey are different choices; the presence of honey in both names is not enough to identify the seasonal product.'
    ]},
    { id: 'availability', heading: 'Is it already discontinued?', toc: 'Current U.S. status', paragraphs: [
      `We do not have evidence to call it discontinued at this check. <a href="https://www.hersheyland.com/dots-pretzels" target="_blank" rel="noopener noreferrer">The current brand page</a> promotes Chipotle Honey and links to its product listing. The dated announcement calls it a limited-time fall addition, without a fixed final sale date.`,
      'Limited edition describes the intended scope of an offer; it does not tell us the day the last bag will leave a store. An unavailable retailer page can be a local stock problem. Conversely, leftover bags after a campaign ends would not prove that production had become permanent.'
    ]},
    { id: 'shopping', heading: 'How to find the right bag', toc: 'Where to look', paragraphs: [
      `Use the shopping link on the <a href="${product}" target="_blank" rel="noopener noreferrer">official product page</a> as a starting point, then confirm the selected store and size. Before ordering a multipack, check whether its advertised quantity refers to bags or ounces.`,
      'If you are buying for a group, retain the ingredient and allergen label instead of serving from an unmarked bowl. For dietary needs, the current package is more useful than a generic description of the pretzel category.'
    ]}
  ],
  statusParagraphs: ['We will only describe a permanent addition or a future return when there is evidence for it. A seasonal label alone establishes neither.'],
  buyerHeading: 'Independent coverage',
  buyerParagraphs: ["Discontinued Club does not currently sell Dot's Chipotle Honey pretzels. Our coverage follows limited releases as well as discontinued products, whether or not we carry them."],
  faq: [
    { question: "Is Dot's Chipotle Honey a permanent flavor?", answer: 'It is currently labeled limited edition; no permanent status is established by the sources reviewed.' },
    { question: 'Is this a taste review?', answer: 'No. It is a guide to the confirmed release and product listings.' }
  ],
  disclosure: "Independent reporting, not sponsored by Dot's or The Hershey Company. No tasting or local stock verification is implied.",
  sources: [
    { label: "Hershey: Dot's fall football announcement", url: announcement, note: 'September 16, 2026; new flavor, seasonal status and Original remaining in the campaign' },
    { label: 'Hersheyland: Chipotle Honey, 16-ounce bag', url: product, note: 'checked October 15, 2026; package size, photography and shopping link' },
    { label: 'Hersheyland: Chipotle Honey, 5-ounce bag', url: smallBag, note: 'checked October 15, 2026; smaller format and limited-edition designation' },
    { label: "Hersheyland: current Dot's lineup", url: 'https://www.hersheyland.com/dots-pretzels', note: 'checked October 15, 2026; current promotion and other varieties' }
  ]
};
