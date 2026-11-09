const testLaunch = 'https://www.deseret.com/1992/4/13/18978307/pepsi-will-find-out-if-clear-cola-makes-a-hit-with-consumers/';
const novak = 'https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/what-great-leaders-know-about-not-knowing-it-all';
const execution = 'https://mastersofscale.com/from-crystal-pepsi-to-cool-ranch-doritos-lessons-from-david-novak/';
const reformulation = 'https://www.mintel.com/insights/ingredients-flavours-and-fragrances/crystal-pepsis-rumored-return-acknowledges-colors-are-part-of-consumers-ingredient-concerns/';
const giveaway = 'https://time.com/4141447/crystal-pepsi-comeback-2/';
const retail2016 = 'https://www.pepsico.com/en/newsroom/press-releases/2016/celebrate-the-90s-with-crystal-pepsi----iconic-clear-cola-to-hit-shelves-this-summer';
const retail2017 = 'https://www.pepsico.com/newsroom/press-releases/2017/crystal-pepsi-throwback-tour-brings-music-baseball-and-iconic-clear-cola-to-fans-across-the-us';
const anniversary = 'https://www.fox9.com/news/crystal-pepsi-2022-90s-soda-makes-comeback-with-30th-anniversary-contest.amp';
const rumor = 'https://sporked.com/article/this-pepsi-flavor-flop-is-slated-to-return-in-2027/';
const photo = 'https://www.preparedfoods.com/articles/118379-crystal-pepsi-returns-for-summer-2016';

export const crystalPepsiHistoryReport = {
  slug: 'crystal-pepsi-history-failure-comebacks',
  brand: 'Pepsi', product: 'Crystal Pepsi', theme: 'blue',
  checkedDate: '2026-11-09', editionDate: '2026-11-09', readTime: 10,
  statusKey: 'format', statusLabel: 'Historical releases', lane: 'Soda history',
  title: 'Crystal Pepsi: the clear cola that failed, then refused to disappear.',
  seoTitle: 'Crystal Pepsi History: Why It Failed, Every Major U.S. Comeback and the 2027 Rumor',
  description: 'A deep history of Crystal Pepsi: the 1992 launch, the flavor problem, the citrus reformulation, fan campaigns, limited returns and the unconfirmed 2027 rumor.',
  deck: 'A bottle can be a failed everyday product, a successful nostalgia event and a collector object. Crystal Pepsi has been all three, but not at the same time.',
  answerHeading: 'The comeback story is not one continuous production run.',
  answer: 'Crystal Pepsi began as an early-1990s clear cola and later returned through giveaways and limited retail releases. The 2015, 2016, 2017 and 2022 events had different rules and audiences. As of this November 9, 2026 review, we have not verified a manufacturer-confirmed 2027 U.S. relaunch; that claim remains a rumor in the reporting examined here.',
  sidebar: 'This is a history of the U.S. product and its major documented returns, not a promise of current store stock. Canadian dates are identified separately.',
  evidenceGrade: 'Manufacturer releases + first-person interviews',
  evidenceNote: 'Dated announcements establish past distribution. Executive recollections help explain decisions but are not a complete sales audit. The future-release rumor is separately labeled.',
  image: 'assets/images/journal/crystal-pepsi-2016.webp', imageWidth: 900, imageHeight: 550,
  imageAlt: 'Three clear Crystal Pepsi bottles in the historical 2016 relaunch publicity photograph',
  caption: 'The 2016 publicity image documents a past retail return, not a newly announced batch.',
  imageCredit: `Pepsi publicity image via <a href="${photo}" target="_blank" rel="noopener noreferrer">Prepared Foods, July 2016</a>`,
  cardCopy: 'The flavor problem, the comeback timeline and why a giveaway is not the same thing as a permanent return.',
  relatedSlugs: ['surge-soda-history-fan-comeback', 'is-pepsi-blue-discontinued-us-2026', 'new-soda-rumors-coca-cola-pepsi-mr-pibb'],
  sections: [
    { id: 'why-clear', heading: 'The original idea: make the familiar look unfamiliar', toc: 'Why make cola clear?', paragraphs: [
      'The appeal of Crystal Pepsi starts before the first sip. A transparent bottle displaying a transparent drink contradicts the dark cola most shoppers associate with the Pepsi name. That creates an unusually immediate question: is this the same drink, a lighter version, or something entirely different? The package can generate curiosity before an advertisement explains anything.',
      `At launch, Pepsi did not describe it as ordinary Pepsi with its color removed. In an <a href="${testLaunch}" target="_blank" rel="noopener noreferrer">Associated Press report dated April 13, 1992</a>, executive David Novak said the formula was different. The report identified tests in Providence, Dallas and Colorado, following more than a year of development. It also described the intended appeal of a lighter-tasting cola.`,
      'That distinction is fundamental. Removing an expected visual cue and introducing a different flavor are two changes, not one. A buyer drawn by the familiar Pepsi name could bring one expectation; someone drawn by the clear appearance could bring another. Neither person necessarily wanted the same drink. This is our reading of the positioning problem, not a claim that every customer reacted alike.'
    ]},
    { id: 'expectations', heading: 'Why did Crystal Pepsi fail? Start with the name, not a punchline', toc: 'The expectation problem', paragraphs: [
      `In an <a href="${novak}" target="_blank" rel="noopener noreferrer">April 2026 McKinsey interview</a>, Novak recalled seeing growth in clear beverages, including Clearly Canadian, and pursuing a clear Pepsi. He said bottlers warned that the product needed stronger Pepsi-Cola flavor notes because it carried the Pepsi name. He also recalled weak repeat purchasing after the highly publicized launch and acknowledged rushing toward a Super Bowl deadline. These are his retrospective explanations, not independently reproduced consumer-study results.`,
      'The useful distinction is trial versus repeat purchase. Trial asks whether someone will buy a bottle to satisfy curiosity. Repeat purchase asks whether that same bottle earns a place in the next grocery trip. A surprising appearance can help with the first question without answering the second. Calling the drink a failure does not mean nobody enjoyed it; it means admiration from some drinkers and broad commercial durability are different outcomes.',
      'It is tempting to reduce the story to a single verdict about taste. A better question is what the brand promised. If a product must be different enough to attract a new customer yet familiar enough to satisfy an existing one, the development team has a difficult brief. Crystal Pepsi is useful precisely because the visual novelty is so obvious while the underlying promise is not.'
    ]},
    { id: 'execution', heading: 'The less glamorous issue: a concept still has to work in a bottle', toc: 'Execution and quality', paragraphs: [
      `Novak described another problem in his <a href="${execution}" target="_blank" rel="noopener noreferrer">Masters of Scale interview</a>: some early product was cloudy or hazy, and he believed the launch had been rushed. That is a particularly awkward defect for a drink whose name advertises clarity. We are attributing this account to an executive involved in the launch, not treating it as proof that every bottle had a quality problem.`,
      'There is a difference between an attractive concept, a promising sample and a consistent packaged product. The first wins attention, the second can win a taste test, and the third must survive ordinary manufacturing and distribution. Looking only at the famous label leaves out that operational side of the story.',
      'These interviews also have limits. They were recorded decades later and are framed as leadership lessons. They illuminate what Novak believes went wrong, but they do not isolate the contribution of pricing, competing products, distribution or changing consumer tastes. We would need contemporaneous data to assign percentages of blame. This article does not pretend that those data are available.'
    ]},
    { id: 'second-crystal', heading: 'The overlooked sequel: Crystal From Pepsi', toc: 'The citrus reformulation', paragraphs: [
      `<a href="${reformulation}" target="_blank" rel="noopener noreferrer">Mintel's historical account</a> describes the original product leaving the market in 1994 after declining sales, followed by a short-lived citrus reformulation called Crystal From Pepsi. That follow-up matters: the original clear cola and the later citrus-oriented product should not be collapsed into one unchanged recipe.`,
      'This is also why memories can conflict without either person inventing an experience. Someone may remember an original package, another a reformulation, and a younger drinker a much later nostalgia release. The brand name alone is not enough to identify what was in the bottle.',
      'For a collection, keep the exact wording on the label in the description. Do not silently replace a less familiar product name with the more searchable one. For a history, separate the end of the first commercial attempt from the fate of its successor. We are not assigning an exact final bottling day from a broad historical summary.'
    ]},
    { id: 'fan-return', heading: '2015: the audience was asking for the old idea back', toc: 'The 2015 giveaway', paragraphs: [
      `The later revival had a different starting point. <a href="${giveaway}" target="_blank" rel="noopener noreferrer">TIME's December 8, 2015 report</a> connected Pepsi's announcement to fan campaigning, including Kevin Strahle, known online as L.A. Beast. Pepsi offered 13,000 six-packs through a holiday sweepstakes. It was a giveaway, not the restoration of an ordinary nationwide supermarket product.`,
      'That difference changes how success should be understood. A promotion can reward supporters, attract attention and reconnect a brand with a memorable era without committing it to permanent shelf space. The people asking for a return are also a self-selected audience. Their enthusiasm is real, but it is not a representative survey of everyone buying soda.',
      'For fans, the reward was concrete: the possibility of a new encounter with something remembered or missed. For readers today, the important detail is the access mechanism. An announcement that bottles exist does not necessarily mean anyone can order one. In this case, entry and selection stood between the audience and the product.'
    ]},
    { id: 'retail-return', heading: '2016: an actual retail return, wrapped in 1990s culture', toc: 'Back in stores in 2016', paragraphs: [
      `<a href="${retail2016}" target="_blank" rel="noopener noreferrer">Pepsi's June 29, 2016 announcement</a> supplied the details a shopper could act on: July 11 availability in Canada, August 8 in the United States, 20-ounce bottles and a suggested $1.79 price. The release explicitly described limited availability. These are historical launch dates and pricing, not a current buying guide.`,
      'The same announcement paired the drink with The Crystal Pepsi Trail, a browser-game take on The Oregon Trail. The point was not simply to place a bottle in a refrigerator. The campaign placed that bottle inside a recognizable period of popular culture.',
      'Our interpretation is that the return offered two kinds of discovery. Older drinkers could revisit a memory; younger drinkers could finally investigate a product they knew through stories. Those are different motivations from choosing a routine replacement for everyday cola. The relaunch therefore cannot be used, by itself, to prove that the original long-term proposition would have succeeded.'
    ]},
    { id: 'last-return', heading: '2017 and 2022: what did another return actually mean?', toc: 'The 2017 and 2022 events', paragraphs: [
      `<a href="${retail2017}" target="_blank" rel="noopener noreferrer">Pepsi's July 19, 2017 release</a> announced a Throwback Tour connecting music and baseball with another limited retail run. It named New York, Phoenix and Miami tour stops and an August 14 shelf date for 20-ounce bottles. The company called this the product's last return at the time. That wording belongs to the 2017 announcement, not an enforceable promise about all future decisions.`,
      `A later anniversary event demonstrates why the date matters. <a href="${anniversary}" target="_blank" rel="noopener noreferrer">FOX's January 2022 report</a> described a 30th-anniversary contest with 300 winners receiving six bottles each. It was not another open retail launch. A reader seeing only the words "Crystal Pepsi is back" would miss the most practical fact: most interested people could not simply buy it from that promotion.`,
      'The timeline is therefore a set of distinct events: a first commercial life, a fan-oriented giveaway, limited retail appearances and an anniversary contest. It is not evidence of uninterrupted manufacturing between those dates. Nor does a later contest automatically invalidate a description of the earlier product as discontinued.'
    ]},
    { id: '2027-rumor', heading: 'What about the reported 2027 comeback?', toc: 'The 2027 rumor', paragraphs: [
      `A <a href="${rumor}" target="_blank" rel="noopener noreferrer">September 20, 2026 Sporked article</a> relayed social-media claims of a May 2027 return, including regular and zero-sugar versions in cans and bottles. The article itself said its sources were social-media accounts and withheld certainty pending PepsiCo confirmation. Those qualifications are as important as its headline.`,
      'We have not verified a manufacturer announcement establishing that proposed U.S. release as of this review. That does not prove a project cannot exist internally. It means the public evidence examined here does not justify presenting its date, formulas or package sizes as settled.',
      'A meaningful confirmation would identify the market, product, distribution window and purchase route. A mockup or an unsourced retailer placeholder would not answer all four. We will distinguish a confirmed launch from the rumor if stronger evidence appears, rather than quietly turning an old forecast into a historical fact.'
    ]},
    { id: 'collector-guide', heading: 'How to identify a bottle without inventing its story', toc: 'A collector checklist', paragraphs: [
      '<strong>Start with the exact package.</strong> Record the full product name, container material, volume, language and label design. Photograph the front, back, cap and printed code. A nostalgic design may have been deliberately reused; appearance alone is not a production date.',
      '<strong>Separate the dates.</strong> The date a seller listed a bottle, the date of a relaunch announcement and the code printed on that bottle answer different questions. A listing created this week does not make its contents newly manufactured. If a code cannot be interpreted confidently, say so instead of assigning a year from a nearby news headline.',
      '<strong>Separate condition from provenance.</strong> An unopened bottle, an empty display piece and a promotional container are different purchases. Ask what is included and whether the images show the actual item. A seller should disclose uncertainty about the release rather than describe every old bottle as an original 1992 example.',
      '<strong>Do not turn a collectible into a tasting promise.</strong> We have not tasted the historical items discussed here or assessed an individual bottle for consumption. This article documents releases; it does not certify freshness or establish a resale value. Asking prices alone also do not establish what comparable items actually sold for.'
    ]},
    { id: 'lasting-meaning', heading: 'Why Crystal Pepsi remains interesting after the novelty wears off', toc: 'What the story tells us', paragraphs: [
      'The most interesting question is no longer whether clear cola was a good or bad idea. It is how the same product can be asked to perform different jobs. In one period it must earn repeat purchases as an everyday beverage. In another it can anchor a short promotion. Later, a surviving package can matter as an object that records a particular design and moment.',
      'Those roles do not erase one another. A limited comeback does not rewrite the original commercial result, and the original result does not make later affection fake. A person can love a product that was not sustainable at its original scale. That is a more useful way to understand discontinued favorites than assuming either that every failure deserved to vanish or that every devoted fan base guarantees permanent production.',
      'For a contrasting route back, read our <a href="journal/surge-soda-history-fan-comeback.html">SURGE history</a>, where organized fans and an online sales channel became central to the revival. For another Pepsi example, our <a href="journal/is-pepsi-blue-discontinued-us-2026.html">Pepsi Blue report</a> separates a documented limited return from older bottles still circulating today.'
    ]}
  ],
  statusParagraphs: ['Historical releases means the article documents dated events. It does not label a newly found bottle as current production, promise local stock, or treat an unconfirmed future announcement as a completed launch.'],
  buyerHeading: 'What this article is not selling',
  buyerParagraphs: ['The pictured bottles are historical publicity imagery, not a photograph of Discontinued Club inventory. There is no Crystal Pepsi stock or preorder promise attached to this article. Product pages, when available, must supply their own condition and availability information.'],
  faq: [
    { question: 'Was Crystal Pepsi just regular Pepsi without coloring?', answer: 'Pepsi described the original 1992 product as a different formula in contemporaneous Associated Press reporting. The clear appearance should not be treated as a complete recipe description.' },
    { question: 'Why did Crystal Pepsi fail the first time?', answer: 'David Novak has pointed to a mismatch between the Pepsi name and the flavor, weak repeat purchasing and rushed execution. These are his retrospective explanations, not a complete independent accounting of every cause.' },
    { question: 'Did Crystal Pepsi return in 2022?', answer: 'Yes, through a 30th-anniversary contest. The reported offer was six bottles each for 300 winners, not an ordinary retail relaunch.' },
    { question: 'Is Crystal Pepsi confirmed for May 2027?', answer: 'Not in the manufacturer evidence we verified for this November 9, 2026 review. The September 2026 report examined here described social-media claims and explicitly awaited PepsiCo confirmation.' },
    { question: 'Does an online resale listing prove Crystal Pepsi is being made again?', answer: 'No. A listing can offer an older collectible. Its listing date does not establish when the bottle was produced.' }
  ],
  disclosure: 'Independent historical reporting and clearly identified editorial analysis. Not sponsored by or affiliated with PepsiCo. No original taste test, current-stock guarantee or valuation is claimed.',
  sources: [
    { label: 'Associated Press via Deseret News: clear-cola tests', url: testLaunch, note: 'April 13, 1992; contemporaneous formula and test-market description' },
    { label: 'McKinsey: interview with David Novak', url: novak, note: 'April 23, 2026; first-person retrospective, not a new Crystal Pepsi release notice' },
    { label: 'Masters of Scale: David Novak interview', url: execution, note: 'first-person account of rushed execution and product-quality issues; transcript reviewed November 9, 2026' },
    { label: 'Mintel: Crystal Pepsi historical context', url: reformulation, note: 'page marked updated February 13, 2024; discusses earlier history and 2015-era speculation' },
    { label: 'TIME: the holiday giveaway', url: giveaway, note: 'December 8, 2015; fan campaign and sweepstakes terms' },
    { label: 'PepsiCo: 2016 retail announcement', url: retail2016, note: 'June 29, 2016; U.S. and Canadian dates, bottle size and limited release' },
    { label: 'PepsiCo: Crystal Pepsi Throwback Tour', url: retail2017, note: 'July 19, 2017; tour and August retail return' },
    { label: 'FOX: 30th-anniversary contest', url: anniversary, note: 'January 5, 2022; 300 winners receiving six bottles each' },
    { label: 'Sporked: reported 2027 return', url: rumor, note: 'September 20, 2026; explicitly social-media-sourced and unconfirmed by PepsiCo in that report' },
    { label: 'Prepared Foods: 2016 release imagery', url: photo, note: 'July 12, 2016; historical publicity image, not current inventory evidence' }
  ]
};
