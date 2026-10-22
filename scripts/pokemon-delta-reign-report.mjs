const prerelease = 'https://www.pokemon.com/us/news/play-at-a-pokemon-tcg-mega-evolution-delta-reign-prerelease-event';
const announcement = 'https://press.pokemon.com/en/MEDIA-ALERT-New-Pokemon-Trading-Card-Game-Mega-EvolutionDelta-Reign-Ex';
const locator = 'https://events.pokemon.com/EventLocator/';

export const pokemonDeltaReignReport = {
  slug: 'pokemon-delta-reign-prerelease-october-2026',
  brand: 'Pokemon', brands: ['Pokemon'], product: 'Pokemon TCG Mega Evolution Delta Reign', theme: 'green',
  format: 'news-brief', checkedDate: '2026-10-22', editionDate: '2026-10-22', readTime: 3,
  statusKey: 'current', statusLabel: 'Upcoming release confirmed', lane: 'Trading card release watch',
  title: 'Pokemon Delta Reign prereleases start this weekend',
  seoTitle: 'Pokemon Delta Reign Prerelease: October 24 Start, November 6 Release',
  description: 'Pokemon TCG Mega Evolution Delta Reign prereleases begin October 24, 2026. See the Build & Battle contents, promo cards and November 6 full-release date.',
  deck: 'Mega Rayquaza is on the box, but the date to circle depends on how you plan to play. Here is the difference between this weekend and the wider release.',
  answerHeading: 'Prereleases begin October 24. The full release is November 6.',
  answer: 'Pokemon confirms that select Play! Pokemon Stores can offer Mega Evolution Delta Reign Build & Battle Boxes starting October 24, 2026. The expansion launches more broadly November 6. An early event is not a promise that every retailer has stock this weekend.',
  sidebar: 'A confirmed upcoming expansion, not a discontinued set. Check your local event before traveling.',
  evidenceGrade: 'Official Pokemon announcements',
  evidenceNote: 'The U.S. prerelease article and North American press announcement were reviewed October 22. Local seats and prices have not been audited.',
  image: 'assets/images/journal/pokemon-delta-reign-prerelease-2026.webp', imageWidth: 1439, imageHeight: 809,
  imageAlt: 'Official Pokemon Delta Reign Build and Battle Box beside its four possible prerelease promo cards',
  caption: 'Official Build & Battle artwork shows the box and four possible promos. One box includes one promo, not all four.',
  imageCredit: 'The Pokemon Company International / Pokemon.com',
  cardCopy: 'The weekend prerelease, four possible promos and the separate November full-release date.',
  relatedSlugs: ['red-bull-carnaval-edition-flavor-us-release', 'ocean-spray-cranberry-cider-2026-where-to-buy', 'waffle-house-salsa-return-october-2026'],
  sections: [
    { id: 'release-dates', heading: 'Three dates, three different ways to play', toc: 'Release dates', paragraphs: [
      `The <a href="${announcement}" target="_blank" rel="noopener noreferrer">official expansion announcement</a> separates the rollout into prerelease events from October 24, a Pokemon TCG Live arrival on November 5, and the physical expansion launch on November 6. The digital date does not move the retail date forward.`,
      'For a weekend plan, look for an actual event listing with a start time and registration details. For a sealed-product purchase, confirm the seller\'s shipping or pickup date. A preorder confirmation and a reserved tournament seat are different things.'
    ]},
    { id: 'build-battle', heading: 'What is inside the Build & Battle Box?', toc: 'Box and promos', paragraphs: [
      `Pokemon's <a href="${prerelease}" target="_blank" rel="noopener noreferrer">prerelease guide</a> lists four Delta Reign booster packs and a ready-to-play 40-card deck, including one of four foil promos: Masquerain, Magmortar, Enamorus or Kommo-o. The event format uses 40-card decks and four Prize cards.`,
      'That makes the pictured product different from a booster bundle. Do not compare two offers by the word "box" alone: check the exact product name and contents. The promotional image displays all four possible promos for reference, not a guaranteed four-card selection in every package.',
      'Before paying for an event, ask what the entry fee includes and whether any additional packs depend on participation. Do not assume a particular store\'s event extras are standard contents of the sealed product.'
    ]},
    { id: 'rayquaza', heading: 'Why Delta Reign is worth watching', toc: 'What is new', paragraphs: [
      'The expansion brings Mega Rayquaza back to the TCG for the first time since XY Ancient Origins. It also introduces Legendary Stadiums: two Stadium cards work as a pair, with connected artwork. Pokemon says a booster containing one of these Stadiums includes both required halves.',
      'Those are concrete reasons to follow the set. They are not evidence of guaranteed pulls, a short print run or future resale value. We are not publishing pack odds or an investment forecast, and have not opened this expansion for a review.'
    ]},
    { id: 'find-event', heading: 'How to find a prerelease near you', toc: 'Find an event', paragraphs: [
      `Start with the official <a href="${locator}" target="_blank" rel="noopener noreferrer">Play! Pokemon Event Locator</a>, then contact the organizer to confirm the date, open seats, entry cost and any registration deadline. Ask whether you need to register before arriving and what you should bring.`,
      'A local sold-out event would describe that organizer\'s availability, not the production status of the entire expansion. Keep event capacity, sealed-box stock and manufacturer release plans separate when reading availability claims.',
      'Discontinued Club does not currently list Delta Reign for sale. This is an independent release guide, not a preorder announcement. Our current card inventory is a separate selection of sets and formats.'
    ]}
  ],
  statusParagraphs: ['As of October 22, this is an announced upcoming release. No discontinuation or final production date is established by the sources reviewed.'],
  buyerHeading: 'Match the product, not just the artwork',
  buyerParagraphs: ['When comparing listings, check the expansion, language, sealed condition, pack count and exact box type. Similar artwork can appear on different products. Keep a copy of the listing description so you can check what was promised when the package arrives.'],
  faq: [
    { question: 'Does Delta Reign release on October 24?', answer: 'That is the start of prerelease access at select stores. The full expansion release is November 6, 2026.' },
    { question: 'Are all four promos in one Build & Battle Box?', answer: 'No. The box includes one of four possible foil promo cards.' },
    { question: 'Is Discontinued Club taking Delta Reign preorders?', answer: 'No. We do not currently list this expansion for sale.' }
  ],
  disclosure: 'Independent coverage, not sponsored by Pokemon. Product artwork is credited to The Pokemon Company International. We have not attended a Delta Reign prerelease or opened its packs for this report.',
  sources: [
    { label: 'Pokemon: U.S. Delta Reign prerelease guide', url: prerelease, note: 'September 28, 2026; event timing, Build & Battle contents and promo choices' },
    { label: 'The Pokemon Company International: Delta Reign announcement', url: announcement, note: 'August 20, 2026; physical and digital dates, Mega Rayquaza and Legendary Stadiums' },
    { label: 'Play! Pokemon Event Locator', url: locator, note: 'Official event search; confirm availability and terms with the organizer' }
  ]
};
