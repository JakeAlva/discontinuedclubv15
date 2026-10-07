const launch = 'https://www.prnewswire.com/news-releases/ghost-energy-reimagines-an-american-classic-with-new-aw-root-beer-flavor-302878747.html';
const permanent = 'https://www.keurigdrpepper.com/keurig-dr-pepper-reveals-2027-beverage-innovation-ahead-of-nacs-show/';
const target = 'https://www.target.com/p/-/A-1011200480';
const gnc = 'https://www.gnc.com/energy-drinks/582087.html';
const sevenUp = 'https://www.target.com/p/-/A-95231019';

export const ghostAwRootBeerReport = {
  slug: 'ghost-aw-root-beer-energy-drink-permanent-2027',
  brand: 'GHOST', brands: ['GHOST', 'A&W'], product: 'GHOST Energy A&W Root Beer', theme: 'orange',
  statusKey: 'launch', statusLabel: 'Permanent lineup planned', lane: 'Energy drink news',
  checkedDate: '2026-10-07', readTime: 4,
  title: 'Is GHOST A&W Root Beer limited edition? The answer has changed.',
  seoTitle: 'Is GHOST A&W Root Beer Limited Edition? 2027 Update & Caffeine',
  description: 'GHOST A&W Root Beer has a new lineup update. Check its future status, caffeine, can size and retailer records before paying a limited-edition premium.',
  deck: 'The root-beer collaboration has news beyond its first drop. For shoppers, the important distinction is the long-term plan versus what a local shelf holds today.',
  answerHeading: 'It has a permanent place planned for 2027.',
  answer: 'Keurig Dr Pepper says GHOST Energy x A&W and GHOST Energy x 7UP will become permanent offerings in 2027 after their limited-time 2026 runs.',
  sidebar: 'The lineup plan has changed; uninterrupted local supply is not guaranteed.',
  evidenceGrade: 'Manufacturer + retail labels',
  evidenceNote: 'Future status comes from KDP; product details come from the launch release and current retailer records.',
  image: 'assets/images/journal/ghost-aw-root-beer-official.webp', imageWidth: 1200, imageHeight: 1200,
  imageAlt: 'One GHOST Energy A&W Root Beer zero-sugar 16-ounce can',
  caption: 'Look for GHOST Energy on the label, not just the A&W logo.', imageCredit: 'GHOST product artwork via Target',
  cardCopy: 'The latest lineup news, the caffeine difference, and where to look without assuming every store has stock.',
  relatedSlugs: ['c4-all-hopped-up-beer-flavor-energy-drink', 'dr-pepper-ice-cream-float-release-date-2027'],
  sections: [
    { id: 'status-update', heading: 'What changed this week?', toc: 'The status update', paragraphs: [
      `The change appears in <a href="${permanent}" target="_blank" rel="noopener noreferrer">KDP's October 5 portfolio announcement</a>. Our reading: older limited-edition descriptions no longer tell the complete story. They may accurately describe the first release without reflecting the newer plan.`,
      'That is useful context before paying a scarcity premium. A temporarily empty shelf, an old promotional caption and a discontinued product are not the same thing. We would not advise buying a case solely because a seller says the flavor is disappearing forever.',
      'There is still a practical gap between a portfolio commitment and a can in your local cooler. We have not verified a store-by-store replenishment schedule or continuous availability through the transition.'
    ]},
    { id: 'what-is-it', heading: 'What is GHOST A&W Root Beer?', toc: 'The collaboration', paragraphs: [
      `<a href="${launch}" target="_blank" rel="noopener noreferrer">GHOST announced the collaboration on September 15</a>, describing a root-beer-float-inspired energy drink with a creamy finish. Its release named national retail destinations including Target, Walmart, Kroger, Publix and Circle K.`,
      'This is a licensed crossover, not a photograph of ordinary root beer with an unfamiliar label. The packaging makes the soda connection obvious, but the product category matters more than the familiar logo when deciding whether it is the drink you want.',
      'We have not taste-tested it. The float comparison describes the brand\'s intended flavor direction; it is not our verdict that the can reproduces a scoop of ice cream or tastes identical to another A&W product.'
    ]},
    { id: 'caffeine', heading: 'How much caffeine and sugar are in the can?', toc: 'Caffeine and label details', paragraphs: [
      `<a href="${target}" target="_blank" rel="noopener noreferrer">Target's product label</a> identifies a 16-fluid-ounce can containing 200 milligrams of caffeine, 15 calories and zero grams of total sugar. Its ingredients include sucralose and acesulfame potassium. Zero sugar does not mean unsweetened or caffeine-free.`,
      'The same listing carries adult-use and caffeine cautions. Read the warnings on the actual can rather than assuming that familiar soda branding makes it a suitable substitute for a child\'s soft drink. We are reporting label information, not endorsing the retailer\'s performance claims.',
      `The <a href="${sevenUp}" target="_blank" rel="noopener noreferrer">GHOST 7UP retailer record</a> also identifies a caffeinated energy drink, not standard lemon-lime soda. Its listing specifies 200 milligrams per 16-ounce can, with zero sugar and 10 calories. Do not transfer nutrition numbers from one collaboration to the other.`
    ]},
    { id: 'where-to-buy', heading: 'Where should you look?', toc: 'Singles vs. cases', paragraphs: [
      `Target has a single-can record, while <a href="${gnc}" target="_blank" rel="noopener noreferrer">GNC lists a 12-pack of 16-ounce A&W cans</a>. Those records establish useful places to check, not a guarantee that either can deliver to every ZIP code today.`,
      'Choose your location before reading a pickup promise. For a case, divide the delivered total by the number of cans and compare it with local singles. Check shipping, deposits where applicable and the seller identity before deciding an online bundle is a bargain.',
      'Search the complete name including GHOST. Leaving that word out can send you to ordinary A&W soda, a fountain menu or a different float-flavored drink.'
    ]}
  ],
  statusParagraphs: ['Permanent is a lineup intention, not a promise that a product can never be discontinued later. We track the newest dated manufacturer statement separately from individual store stock.'],
  buyerHeading: 'Buy the product, not the urgency',
  buyerParagraphs: ['A limited-looking can does not establish rarity. Confirm quantity, condition and the actual item before buying. Discontinued Club does not currently sell this collaboration; the links above are research references.'],
  faqHeading: 'GHOST A&W questions',
  faq: [
    { question: 'Is this ordinary A&W root beer?', answer: 'No. Look for the GHOST Energy branding and read its caffeine and ingredient panel.' },
    { question: 'Does a sold-out listing prove the flavor is discontinued?', answer: 'No. A stock message describes that seller at that moment, not the entire product line.' }
  ],
  disclosure: 'Independent reporting, not sponsored by GHOST, A&W, Keurig Dr Pepper or the retailers cited. No firsthand taste claims are made.',
  sources: [
    { label: 'KDP: 2027 portfolio update', url: permanent, note: 'October 5, 2026; changed long-term lineup status' },
    { label: 'GHOST: A&W launch release', url: launch, note: 'September 15, 2026; product concept and retail rollout' },
    { label: 'Target: GHOST A&W can and label', url: target, note: 'Size, caffeine, nutrition, artwork and warnings; checked October 7, 2026' },
    { label: 'GNC: GHOST A&W 12-pack', url: gnc, note: 'Case identity; stock depends on location and fulfillment' },
    { label: 'Target: GHOST 7UP can and label', url: sevenUp, note: 'Separate collaboration and nutrition record' }
  ]
};
