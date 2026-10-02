const products = 'https://www.coca-cola.com/us/en/brands/coca-cola/products/coca-cola-flavors';
const lineup = 'https://www.coca-cola.com/us/en/offerings/coca-cola/year-of-cherry';
const launch = 'https://www.coca-colacompany.com/media-center/coca-cola-cherry-float-and-diet-coke-cherry-launch-nationwide.html';
const britain = 'https://www.cocacolaep.com/gb/news-and-stories/coca-cola-introduces-cherry-float-flavour-blending-retro-inspiration-with-an-iconic-cherry-taste/';
const canada = 'https://www.coca-cola.com/ca/en/brands/coca-cola/products/coca-cola-flavours';

export const cherryFloatStatusReport = {
  slug: 'is-coca-cola-cherry-float-discontinued',
  brand: 'Coca-Cola', product: 'Coca-Cola Cherry Float', theme: 'red',
  statusKey: 'current', statusLabel: 'Currently listed in U.S.', lane: 'Availability check',
  checkedDate: '2026-10-02', readTime: 4,
  title: 'Is Coca-Cola Cherry Float discontinued? Check the evidence first.',
  seoTitle: 'Is Coca-Cola Cherry Float Discontinued? U.S. Status in 2026',
  description: 'Coca-Cola still lists Cherry Float and Zero Sugar in its U.S. lineup. What is confirmed in October 2026, how to find the right can, and what remains unknown.',
  deck: 'A missing multipack can start a rumor quickly. The useful answer comes from separating local stock, the exact recipe and the country being discussed.',
  answerHeading: 'The current U.S. listing does not support a discontinued claim.',
  answer: 'As of October 2, 2026, Coca-Cola lists Cherry Float and Cherry Float Zero Sugar on its U.S. flavor page. We have not verified a U.S. discontinuation announcement or final selling date. That is evidence of a current listing, not a guarantee of stock near you.',
  sidebar: 'U.S. status checked. British permanence and Canadian pack sizes are discussed separately below.',
  evidenceGrade: 'Current U.S. lineup + market-specific sources',
  evidenceNote: 'A manufacturer webpage can lag a change. We therefore report what it documents without claiming to know live factory output or every retailer shipment.',
  image: 'assets/images/journal/coca-cola-cherry-float-official.webp', imageWidth: 1088, imageHeight: 1088,
  imageAlt: 'One regular Coca-Cola Cherry Float can from the official U.S. lineup',
  caption: 'The official U.S. Cherry Float can, shown here in the regular version. Read the full label when choosing between regular and Zero Sugar.',
  imageCredit: 'The Coca-Cola Company / U.S. cherry lineup',
  cardCopy: 'Still in the U.S. lineup. What that tells us, what it does not, and why an overseas launch is a separate question.',
  statusParagraphs: [
    'We are not marking this drink discontinued based on an empty shelf, an unavailable delivery listing or a resale price. Those signals can justify another check, but they do not identify the cause of a shortage.',
    'We also cannot promise that a currently listed product will remain available indefinitely. A useful status report leaves room for the evidence to change rather than turning a snapshot into a permanent verdict.'
  ],
  buyerHeading: 'Before paying a reseller premium',
  buyerParagraphs: [
    'Confirm that a seller is offering the version you want, in the quantity you expect. Compare the delivered total per can or bottle, not just the headline price. Ask for a readable date-code photo and the condition of the packaging if those details are missing.',
    'A collectible package and a drink for immediate use are different purchases. Decide which you are buying before comparing prices. Discontinued Club does not currently stock Cherry Float, so this report is not an inventory announcement or an invitation to pay a scarcity premium.'
  ],
  disclosure: 'Independent availability reporting, not a sponsored feature or taste review. We have not verified individual store stock or obtained a separate production schedule from Coca-Cola.',
  relatedSlugs: ['is-diet-coke-cherry-back-2026', 'fanta-ghost-face-punch-halloween-2026'],
  sections: [
    { id: 'what-is-it', heading: 'What is Cherry Float Coke?', toc: 'The float-inspired flavor', paragraphs: [
      `The <a href="${launch}" target="_blank" rel="noopener noreferrer">February 2026 launch announcement</a> describes a cherry-and-vanilla cola inspired by a soda-fountain float, without ice cream or dairy. That is the manufacturer's description, not our own tasting verdict. The drink launched in regular and zero-sugar versions.`,
      'A float illustration can make the product look like a dairy dessert in a can. Read the actual ingredient panel rather than treating the illustration as a recipe. We have not tested whether the drink matches a homemade float or how it compares with earlier cherry-vanilla colas.',
      `The separate <a href="${lineup}" target="_blank" rel="noopener noreferrer">U.S. cherry campaign page</a> still presents both Float versions alongside other cherry colas. In our reading, two current official listings are a stronger starting point than an unsupported claim that the flavor has already disappeared nationwide.`
    ]},
    { id: 'regular-zero', heading: 'Regular and Zero Sugar are separate products', toc: 'Check your version', paragraphs: [
      `The <a href="${products}" target="_blank" rel="noopener noreferrer">U.S. flavor page</a> lists 12-fluid-ounce and 20-fluid-ounce formats for both. Its regular 12-ounce entry shows 150 calories and 42 grams of total sugars. The Zero Sugar entry shows zero calories and zero sugars, but its displayed nutrition serving is a 20-ounce bottle. Do not compare the two panels as though the serving sizes were identical.`,
      'That matters when a retailer merges reviews or offers a selector for several variants on one page. Check the selected option immediately before paying. A familiar thumbnail can remain on screen even when the chosen pack size or formula changes.',
      'Diet Coke Cherry is another distinct product, not the zero-sugar version of Cherry Float. Our <a href="journal/is-diet-coke-cherry-back-2026.html">Diet Coke Cherry return guide</a> covers that comeback and the current can design.'
    ]},
    { id: 'international', heading: 'Is Cherry Float permanent in other countries?', toc: 'What overseas sources say', paragraphs: [
      `For Great Britain, there is an explicit statement. <a href="${britain}" target="_blank" rel="noopener noreferrer">CCEP's February 5 announcement</a> describes permanent availability from February 2026 and lists several can and bottle formats, varying by variant. That is stronger evidence than inferring permanence from a product photo. It is also specifically a British statement.`,
      `The <a href="${canada}" target="_blank" rel="noopener noreferrer">Canadian Coca-Cola flavor page</a> separately lists Cherry Float and Zero Sugar Cherry Float in 355 mL and 500 mL sizes. Its regular 355 mL label lists 150 calories and 42 grams of sugars, and the ingredient wording names sugar/glucose-fructose. The market and label should travel with any nutrition comparison.`,
      'Neither page establishes a permanent U.S. commitment. An importer showing foreign packaging is not proof of an American rollout, and a British announcement should not be used to dismiss a U.S. shopper who cannot find the drink. The questions have different geographic scopes.'
    ]},
    { id: 'find-it', heading: 'How to check availability without chasing rumors', toc: 'A better stock check', paragraphs: [
      'Start with the exact name and formula, then select a local store on the retailer website. Look at both cans and bottles if either format would work for you. Before traveling, confirm that the result represents your selected store rather than a marketplace seller or a different delivery area.',
      'If the store cannot find it, ask whether the item is temporarily unavailable or no longer carried at that location. Record the answer with the date and store. That creates a useful local observation without stretching it into a nationwide production claim.',
      'For us to change this report to discontinued, we would want stronger evidence of U.S. withdrawal, such as a clear brand response or documented market-wide change. A specific dated statement would carry more weight than repeated copies of the same social post. Until then, the honest answer is narrower: currently listed, local availability unverified.'
    ]}
  ],
  faqHeading: 'Cherry Float availability questions',
  faq: [
    { question: 'Has a U.S. end date been confirmed?', answer: 'We have not verified one in the sources reviewed for this October 2 check.' },
    { question: 'Does a store selling out mean the flavor is discontinued?', answer: 'No. Local availability alone does not establish a nationwide withdrawal.' },
    { question: 'Is this a review of the flavor?', answer: 'No. This guide checks product identity and availability evidence. It does not claim a hands-on taste test.' }
  ],
  sources: [
    { label: 'Coca-Cola: U.S. flavor products and labels', url: products, note: 'checked October 2, 2026; both Float variants remain listed' },
    { label: 'Coca-Cola: current U.S. cherry campaign', url: lineup, note: 'separate corroborating brand page' },
    { label: 'Coca-Cola: original rollout announcement', url: launch, note: 'February 2, 2026; flavor concept and variants' },
    { label: 'CCEP Great Britain: Cherry Float launch', url: britain, note: 'February 5, 2026; permanent status applies to Great Britain' },
    { label: 'Coca-Cola Canada: flavor products', url: canada, note: 'Canadian formats and label, not a U.S. availability promise' }
  ]
};
