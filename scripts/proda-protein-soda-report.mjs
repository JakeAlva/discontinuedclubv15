const announcement = 'https://www.prnewswire.com/news-releases/justin-timberlake-and-jessica-biel-join-proda-the-1-fastest-turning-protein-soda-brand-as-co-founders-302906295.html';
const press = 'https://drinkproda.com/pages/press';
const product = 'https://drinkproda.com/products/classic-orange';

export const prodaProteinSodaReport = {
  slug: 'proda-protein-soda-flavors-where-to-buy-2026',
  brand: 'PRODA', product: 'PRODA protein soda', theme: 'orange',
  checkedDate: '2026-10-14', editionDate: '2026-10-13', readTime: 3,
  statusKey: 'launch', statusLabel: 'Current U.S. release', lane: 'Soda news',
  title: 'What is PRODA? The protein soda behind the new celebrity headlines.',
  seoTitle: 'PRODA Protein Soda: Flavors, Ingredients & Where to Buy',
  description: 'What is PRODA protein soda? A guide to its seven flavors, whey protein, caffeine status and U.S. shopping options after the October 13 announcement.',
  deck: 'The celebrity news is new. The soda is already on sale. Here is what to know before ordering a case.',
  answerHeading: 'PRODA is a carbonated protein drink, not a new energy drink.',
  answer: 'PRODA markets a 12-fluid-ounce soda containing 10 grams of whey protein isolate and no sugar. The October 13 news concerns Justin Timberlake, Jessica Biel and Joey Gonzalez joining as co-founders; it is not an announcement that the first cans go on sale that day.',
  sidebar: 'An existing U.S. product with newly announced co-founders. No discontinuation or limited-run deadline established.',
  evidenceGrade: 'Brand announcement + product catalog',
  evidenceNote: 'The founder announcement and the drinks themselves have separate official sources. We have not taste-tested the range.',
  image: 'assets/images/journal/proda-classic-orange-official.webp', imageWidth: 516, imageHeight: 1000,
  imageAlt: 'One orange 12 fluid ounce PRODA Classic Orange protein soda can',
  caption: 'Classic Orange, one of the seven flavors in the current PRODA catalog. Official editorial packshot.', imageCredit: 'PRODA press kit',
  cardCopy: 'The seven flavors, what is in the can, and why the October 13 announcement is not a launch-day stock alert.',
  relatedSlugs: ['coca-cola-prebiotic-soda-us-release-coke-sprite-fresca', 'olipop-pomegranate-sparkle-limited-edition-2026'],
  sections: [
    { id: 'announcement', heading: 'What happened on October 13?', toc: 'The new announcement', paragraphs: [
      `In its <a href="${announcement}" target="_blank" rel="noopener noreferrer">official announcement</a>, PRODA said the new co-founders would help develop the business, including its creative direction and future products. It described a brand already selling through Sprouts, Amazon and its own website.`,
      'That distinction is worth preserving when a familiar face makes an unfamiliar drink suddenly appear everywhere in your feed. This is business news about an existing product, not evidence of a newly invented flavor, a sellout or a limited-edition drop.'
    ]},
    { id: 'flavors', heading: 'Which PRODA flavors are available?', toc: 'The flavor lineup', paragraphs: [
      `The <a href="${press}" target="_blank" rel="noopener noreferrer">current brand catalog</a> names seven: Classic Orange, Cherry Lime, Strawberry Lemonade, Lemon Lime, Golden Apple, Root Beer and Shirley Temple. That gives shoppers a choice between familiar soda profiles and fruit-led combinations.`,
      'We have not tasted these drinks, so this is not a ranking. A flavor name tells you the intended direction, not whether the finish, carbonation or sweetness will suit you. For a first purchase, a single can or a clearly described variety pack is a lower-commitment way to compare them than seven separate cases.'
    ]},
    { id: 'label', heading: 'Is PRODA caffeinated? What protein does it use?', toc: 'Reading the label', paragraphs: [
      `The <a href="${product}" target="_blank" rel="noopener noreferrer">Classic Orange product page</a> identifies whey protein isolate and labels the drink caffeine-free. It is not being sold as a caffeinated energy drink or a creamy bottled shake.`,
      'Do not let the word soda substitute for an ingredient check. A protein formula deserves the same full-label review as any other food purchase, particularly when buying for someone with dietary restrictions. Zero sugar does not, by itself, tell you everything about the ingredients or suitability.',
      'Likewise, adding protein to a drink is a product specification, not proof that it is the best choice for every person. This guide explains the package; it does not make a health or performance recommendation.'
    ]},
    { id: 'buying', heading: 'Where can you buy it in the U.S.?', toc: 'Shopping without surprises', paragraphs: [
      `PRODA lists Sprouts, Amazon and <a href="https://drinkproda.com/" target="_blank" rel="noopener noreferrer">its own store</a> as shopping routes. Confirm the selected flavor and local stock before making a trip. A national retailer relationship is not a live inventory count for your nearest branch.`,
      'At the brand store, pay attention to the purchase selector: a subscription and a one-time order are different commitments. Compare the delivered total and can count, not just the price beside the first button. This is especially important when comparing a single-flavor case with a mixed pack.'
    ]}
  ],
  statusParagraphs: ['Current U.S. release means there is official product and distribution information. It does not promise that every flavor is stocked everywhere, or that the lineup will never change.'],
  buyerHeading: 'Our takeaway',
  buyerParagraphs: ['Shop the drink on its label and flavor, not on an assumption that celebrity coverage makes it rare. Discontinued Club does not currently sell PRODA; these are independent reporting links, not our stock listings.'],
  faq: [
    { question: 'Is PRODA an energy drink?', answer: 'It is marketed as protein soda. The Classic Orange listing specifies that it is caffeine-free.' },
    { question: 'Did PRODA first launch on October 13?', answer: 'No. The October 13 announcement described new co-founders joining an already launched brand.' },
    { question: 'Have we reviewed how it tastes?', answer: 'No. This is a sourced product guide, not a firsthand taste test.' }
  ],
  disclosure: 'Independent reporting, not sponsored by PRODA. Product facts were checked against the brand sources; no tasting or local-stock verification is implied.',
  sources: [
    { label: 'PRODA: co-founder announcement', url: announcement, note: 'October 13, 2026; announcement timing and existing distribution' },
    { label: 'PRODA: press kit and current lineup', url: press, note: 'Seven flavor names and editorial image; checked October 14, 2026' },
    { label: 'PRODA: Classic Orange', url: product, note: 'Product format, protein source, caffeine and purchase options; checked October 14, 2026' }
  ]
};
