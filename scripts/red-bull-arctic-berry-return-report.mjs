const calendar = 'https://www.prnewswire.com/news-releases/red-bull-advent-calendar-for-2026-launches-in-the-us-302889925.html';
const pomegranate = 'https://www.redbull.com/us-en/energydrink/questions/where-can-i-buy-red-bull-pomegranate';
const iced = 'https://www.redbull.com/us-en/red-bull-winter-edition-iced-vanilla-berry';

export const redBullArcticBerryReturnReport = {
  slug: 'is-red-bull-arctic-berry-back-2026-advent-calendar',
  brand: 'Red Bull', brands: ['Red Bull'], product: 'Red Bull Arctic Berry', theme: 'blue',
  format: 'news-brief', checkedDate: '2026-10-19', editionDate: '2026-10-19', readTime: 3,
  statusKey: 'launch', statusLabel: 'Limited calendar return', lane: 'Returning drink news',
  title: 'Is Red Bull Arctic Berry back? Yes, with a catch.',
  seoTitle: 'Is Red Bull Arctic Berry Back in 2026? U.S. Return Explained',
  description: 'Red Bull Arctic Berry returns in the 2026 U.S. Advent Calendar. Understand the limited format, Festive Edition can and single-can resale listings.',
  deck: 'The old flavor is part of a real comeback, but that does not make it a permanent standalone addition to the U.S. lineup.',
  answerHeading: 'Yes, in the 2026 Advent Calendar.',
  answer: 'Red Bull identifies Arctic Berry as the calendar-exclusive Festive Edition. That is a limited return, not confirmation of a permanent U.S. single-can launch.',
  sidebar: 'The manufacturer launch format and separate resale listings should not be confused.',
  evidenceGrade: 'Official release and brand FAQ',
  evidenceNote: 'This October 19 explainer covers a September announcement; it is not presented as news announced today.',
  image: 'assets/images/listings/merchant/407297979026.webp', imageWidth: 1200, imageHeight: 1200,
  imageAlt: 'Red Bull Festive Edition Arctic Berry 8.4-fluid-ounce can with a pale blue label',
  caption: 'Single-can image from our current listing, not the complete Advent Calendar.', imageCredit: 'Discontinued Club listing',
  cardCopy: 'The official return, the calendar restriction and why single cans can still appear for sale.',
  relatedSlugs: ['is-red-bull-fuji-apple-ginger-discontinued', 'is-red-bull-blue-edition-blueberry-discontinued', 'is-red-bull-green-edition-curuba-elderflower-discontinued'],
  shop: {
    href: 'products/red-bull-festive-edition-arctic-berry-8-4-oz-single-can-407297979026.html',
    heading: 'Our separate single-can listing',
    copy: 'We sell this flavor and have a commercial interest to disclose. Check the listing for current price, quantity and condition; it is not the full calendar.',
    cta: 'View the single-can listing'
  },
  sections: [
    { id: 'official-return', heading: 'What returned, and when?', toc: 'The official comeback', paragraphs: [
      `Red Bull North America's <a href="${calendar}" target="_blank" rel="noopener noreferrer">September 28 announcement</a> introduced a U.S. Advent Calendar containing 24 assorted 8.4-fluid-ounce cans. Arctic Berry, originally the 2020 Winter Edition, is included as the Festive Edition. The brand describes its flavor as raspberry and says the calendar is available while supplies last.`,
      'The distinction matters if you remember the older can: a flavor can return under a different edition name and in a restricted package. For collecting purposes, the new front label should be recorded separately rather than called an untouched example of the old release.'
    ]},
    { id: 'where-to-buy', heading: 'Calendar availability versus individual cans', toc: 'Where to look', paragraphs: [
      'The announcement names retailers including Amazon, Target and Walmart. Those are distribution leads, not a live inventory check. The calendar is an assortment, not a case containing 24 Arctic Berry cans.',
      'A single-can resale listing does not contradict a calendar-exclusive manufacturer release. It is a different selling format offered by that seller. Equally, the existence of individual listings does not prove a permanent national relaunch.',
      'Before ordering, read the quantity carefully and compare the total delivered cost. Check that the photographs show the edition you want. Ask about package condition when collecting, and do not assume a listing is a sealed calendar just because its title mentions the holiday release.'
    ]},
    { id: 'other-berries', heading: 'Arctic Berry, Iced Vanilla Berry and Pomegranate are different', toc: 'Avoiding flavor mix-ups', paragraphs: [
      `Red Bull's <a href="${iced}" target="_blank" rel="noopener noreferrer">Iced Edition page</a> describes Iced Vanilla Berry as blueberry and vanilla, and identifies it as a permanent product. That is not the raspberry-flavored Arctic Berry comeback covered here. A blue-toned can is not enough to identify the flavor.`,
      `The brand's <a href="${pomegranate}" target="_blank" rel="noopener noreferrer">U.S. Pomegranate FAQ</a> also explicitly says Pomegranate is not in the 2026 Advent Calendar and points to Arctic Berry instead. Do not use an older calendar review as a packing list for this year's box.`,
      'For a useful search, include the flavor, edition, year and size together. That helps separate a current calendar item from an older collectible or a different drink with similar winter branding.'
    ]}
  ],
  statusParagraphs: ['A limited comeback does not erase the history of an earlier discontinued edition. We distinguish the flavor, package and sales channel instead of applying one permanent yes-or-no label to every version.'],
  buyerHeading: 'Our retail interest',
  buyerParagraphs: ['Discontinued Club has a separate listing for this can. We are not using our inventory as proof of brand distribution, and we are not promising it will remain available. The official sources above establish the return; the product page establishes only our own offer. This report is not a taste comparison with a preserved 2020 can.'],
  faq: [
    { question: 'Is the calendar entirely Arctic Berry?', answer: 'No. It is a mixed-flavor assortment.' },
    { question: 'Is Arctic Berry the same as Iced Vanilla Berry?', answer: 'No. Red Bull describes different flavor profiles and selling formats for them.' },
    { question: 'Does a single-can listing prove a permanent comeback?', answer: 'No. Resale availability is not the same as a manufacturer announcing permanent distribution.' }
  ],
  disclosure: 'Independent reporting, not affiliated with Red Bull. Discontinued Club sells the featured can; that commercial interest is disclosed above.',
  sources: [
    { label: 'Red Bull North America: 2026 U.S. Advent Calendar', url: calendar, note: 'September 28, 2026; official return, assortment and distribution information' },
    { label: 'Red Bull U.S.: Pomegranate availability FAQ', url: pomegranate, note: 'checked October 19, 2026; distinguishes the current calendar flavor' },
    { label: 'Red Bull U.S.: Iced Edition', url: iced, note: 'checked October 19, 2026; separate flavor and permanent status' }
  ]
};
