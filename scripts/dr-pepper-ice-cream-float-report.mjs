const announcement = 'https://www.keurigdrpepper.com/keurig-dr-pepper-reveals-2027-beverage-innovation-ahead-of-nacs-show/';
const germany = 'https://www.drpepper.de/produkte/dr-pepper-vanillafloat';
const blueBell = 'https://www.bluebell.com/news/blue-bell-and-dr-pepper-team-up/';

export const drPepperIceCreamFloatReport = {
  slug: 'dr-pepper-ice-cream-float-release-date-2027',
  brand: 'Dr Pepper', product: 'Dr Pepper Ice Cream Float', theme: 'red',
  statusKey: 'launch', statusLabel: 'Announced for 2027', lane: 'New soda releases',
  checkedDate: '2026-10-07', readTime: 4,
  title: 'Dr Pepper Ice Cream Float is coming. Is Vanilla Float back?',
  seoTitle: 'Dr Pepper Ice Cream Float: 2027 Release Date & Vanilla Float Comparison',
  description: 'Dr Pepper Ice Cream Float has a confirmed U.S. launch plan. See the timing, Zero Sugar option, and why older Vanilla Float cans are a different story.',
  deck: 'A familiar name is sending soda fans down a very familiar rabbit hole. Here is how to separate the new American release from imports and the frozen dessert.',
  answerHeading: 'A new U.S. soda, not a verified return of the old recipe.',
  answer: 'Keurig Dr Pepper has announced Ice Cream Float for February 2027, in Regular and Zero Sugar. It is planned as a permanent nationwide addition. The company has not established that it is identical to an earlier Vanilla Float formula.',
  sidebar: 'Future launch confirmed; not a claim of current local stock.',
  evidenceGrade: 'Manufacturer confirmed',
  evidenceNote: 'The U.S. announcement is checked separately from foreign-market products and older names.',
  image: 'assets/images/journal/dr-pepper-ice-cream-float-2027.webp', imageWidth: 1600, imageHeight: 1200,
  imageAlt: 'Official Dr Pepper Ice Cream Float Regular and Zero Sugar can designs',
  caption: 'Manufacturer artwork for the announced U.S. soda.', imageCredit: 'Keurig Dr Pepper press materials',
  cardCopy: 'Release timing, the Zero Sugar option, and the difference between Ice Cream Float and Vanilla Float.',
  relatedSlugs: ['mug-vanilla-howler-limited-edition-2026', 'is-coca-cola-cherry-float-discontinued'],
  sections: [
    { id: 'release-date', heading: 'When does it come out?', toc: 'Release timing', paragraphs: [
      `<a href="${announcement}" target="_blank" rel="noopener noreferrer">KDP's October 5 announcement</a> specifies cans and 20-ounce bottles first, followed by fountain and frozen formats around midyear. Its flavor description combines vanilla-ice-cream character with caramel and butterscotch notes. We have not tasted it.`,
      'For anyone building a shopping list now, a launch month is more useful than a speculative preorder. Wait for a retailer to show the actual product, package quantity and a deliverable date. An announcement photograph is not a stock check, and an online placeholder does not establish that a store can fulfill an order.'
    ]},
    { id: 'vanilla-float', heading: 'Why are people comparing it with Vanilla Float?', toc: 'Vanilla Float vs. Ice Cream Float', paragraphs: [
      `<a href="${germany}" target="_blank" rel="noopener noreferrer">Dr Pepper's German site still has a Vanilla Float product page</a>. It describes a vanilla-flavored caffeinated soft drink and identifies a 0.33-liter can. That is a real foreign-market product record, not evidence that the newly announced U.S. soda has already launched.`,
      'This is where a search for a returning flavor can become confusing. A seller may have an imported can available immediately, while a news headline is discussing a future American release. Both can be legitimate without describing the same item.',
      'Compare the full name, country labeling and volume on the can. Similar dessert language is not enough to establish a recipe match. We would need a manufacturer statement or a supported side-by-side formulation comparison before calling the upcoming drink an exact revival.'
    ]},
    { id: 'blue-bell', heading: 'It is not the Blue Bell ice cream', toc: 'The frozen-dessert distinction', paragraphs: [
      `<a href="${blueBell}" target="_blank" rel="noopener noreferrer">Blue Bell announced Dr Pepper Float ice cream in May 2023</a>. That product combined vanilla ice cream with Dr Pepper-flavored sherbet and was introduced in pints and half gallons. It belongs in the freezer, not the soda cooler.`,
      'An old image of that tub can therefore be completely authentic and still be the wrong illustration for this news. Check whether a search result is talking about a packaged beverage, a frozen dessert or a recipe for pouring soda over ice cream. Those are three different buying decisions.',
      'We use the new manufacturer-supplied can artwork here so readers can identify the announcement being discussed. We are not using the older ice-cream release to make any claim about current freezer-aisle availability.'
    ]},
    { id: 'shopping', heading: 'What should you check before buying?', toc: 'Finding the right product', paragraphs: [
      'Our advice is to start with the exact name on the package, then verify Regular versus Zero Sugar and the number of cans or bottles. Imported singles and domestic multipacks can appear together in search results; a low headline price may refer to only one can.',
      'Do not infer ingredients, allergens or caffeine content from the words Ice Cream Float. Use the final package label when it becomes available. Flavor inspiration is not an ingredient declaration.',
      'Following the wider float-soda trend? Our <a href="journal/mug-vanilla-howler-limited-edition-2026.html">MUG Vanilla Howler report</a> covers a different brand and sales window. Similar names do not make the products interchangeable.'
    ]}
  ],
  statusParagraphs: ['Announced is a forward-looking status. It means there is a documented launch plan, not that we have found the item in a store today. We will distinguish any later shelf sighting from the original announcement.'],
  buyerHeading: 'Do not pay for a rumor',
  buyerParagraphs: ['Before paying an early-access premium, ask for photographs of the actual item and clear fulfillment terms. A rendering alone cannot establish possession. Discontinued Club does not currently sell this soda or take preorders for it.'],
  faqHeading: 'Quick answers',
  faq: [
    { question: 'Is Ice Cream Float the same as Vanilla Float?', answer: 'That recipe equivalence has not been verified. Treat the names and market versions separately.' },
    { question: 'Can I buy it from Discontinued Club?', answer: 'Not currently. This is independent news coverage, not a product listing.' }
  ],
  disclosure: 'Independent reporting, not sponsored by Dr Pepper, Keurig Dr Pepper or Blue Bell. This is a release explainer, not a taste review.',
  sources: [
    { label: 'Keurig Dr Pepper: 2027 innovation announcement', url: announcement, note: 'October 5, 2026; U.S. launch plan and official can artwork' },
    { label: 'Dr Pepper Germany: Vanilla Float', url: germany, note: 'Foreign-market product identity, checked October 7, 2026' },
    { label: 'Blue Bell: Dr Pepper Float ice cream announcement', url: blueBell, note: 'May 18, 2023; historical context for the separate frozen dessert' }
  ]
};
