const imageRoot = 'assets/images/journal/';
const evidence = (file, alt) => ({ image: `${imageRoot}${file}.jpg`, alt });

export const drinkFlavorWatchReport = {
  slug: 'core-power-banana-powerade-watermelon-new-drink-flavors',
  brand: 'Core Power, Powerade, Sprite, Topo Chico and vitaminwater',
  brands: ['Core Power', 'Powerade', 'Sprite', 'Topo Chico', 'vitaminwater'],
  product: 'Core Power Banana and more',
  theme: 'blue', statusKey: 'launch', statusLabel: 'Launch watch / mixed evidence',
  lane: 'U.S. drink news', checkedDate: '2026-09-23', readTime: 6,
  title: 'Core Power Banana and more: checking five drink-flavor claims',
  seoTitle: 'Core Power Banana, Powerade Watermelon and More: Flavor Watch',
  description: 'A fact check of Core Power Banana, Powerade Watermelon, Sprite Chill Strawberry Kiwi, Topo Chico Pineapple Coconut and a vitaminwater Zero Sugar Grape image.',
  deck: 'Banana protein shakes, a watermelon sports drink and pineapple-coconut sparkling water appear in a shared reel. Here is what the images show, what already exists, and what still needs confirmation.',
  answerHeading: 'Not every flavor in a new post is a new product.',
  answer: 'Our September 23, 2026 review found that Sprite Chill Strawberry Kiwi already has a documented U.S. release history. We have not verified new U.S. launch announcements for the exact Core Power Banana, standard Powerade Watermelon, Topo Chico Sabores Pineapple Coconut or vitaminwater Zero Sugar Grape versions shown in the submitted frames. Existing products with similar names are not confirmation of those claims.',
  sidebar: 'Sprite Strawberry Kiwi is documented, not a first-time reveal. Four other exact pictured versions remain unverified in this review.',
  evidenceGrade: 'Social images + catalog and reporting checks',
  evidenceNote: 'The frames show the handle snachwithzach; two display 9/23/26. The full reel, audio and underlying launch documents were not available for this review.',
  image: `${imageRoot}core-power-banana-reel-evidence.jpg`,
  imageAlt: 'Reader-submitted reel photograph showing proposed Core Power Banana bottles marked 26g and 42g, not authenticated final packaging',
  caption: 'Submitted reel frame showing Banana-labeled Core Power concepts. The protein figures are visible image claims, not independently verified specifications for a new release.',
  imageCredit: 'reader photograph of a frame bearing the snachwithzach handle; original reel URL not supplied',
  cardCopy: 'Core Power Banana, Powerade Watermelon, Sprite Strawberry Kiwi, Topo Chico Pineapple Coconut and vitaminwater Grape: new claims versus existing products.',
  relatedSlugs: ['new-soda-rumors-coca-cola-pepsi-mr-pibb', 'is-red-bull-fuji-apple-ginger-discontinued'],
  evidenceImages: [
    evidence('core-power-banana-reel-evidence', 'Core Power Banana: submitted 26g and 42g bottle images'),
    evidence('powerade-watermelon-reel-evidence', 'Powerade Watermelon: submitted sports-drink bottle image'),
    evidence('sprite-strawberry-kiwi-reel-evidence', 'Sprite Chill Strawberry Kiwi: submitted bottle image'),
    evidence('topo-chico-pineapple-coconut-reel-evidence', 'Topo Chico Sabores Pineapple Coconut: submitted can image'),
    evidence('vitaminwater-grape-reel-evidence', 'vitaminwater Zero Sugar Grape: submitted bottle image')
  ],
  statusParagraphs: [
    '<strong>Mixed evidence</strong> means the five entries do not share one conclusion. Strawberry Kiwi has a documented release history; the other four exact pictured versions remain unverified. That is why this roundup belongs in launch watch, not a list of five officially announced new drinks.',
    'A catalog describes what a brand currently presents publicly, not everything it may be developing. A missing product is not proof that a future release is fake. Equally, a familiar flavor word in a catalog does not authenticate a different formula, package or product line shown in a reel.'
  ],
  buyerHeading: 'What to check before looking for these drinks',
  buyerParagraphs: [
    'Search the exact product line and flavor together, then check the actual label. Banana is not automatically Strawberry Banana; Powerade is not automatically Power Water; and a pictured zero-sugar bottle is not evidence that a regular-sugar version is also planned.',
    'We have not verified a shared release date, retailer-exclusive agreement or preorder offer for this group. Discontinued Club is not offering these five pictured items for sale. A news article does not represent store inventory, and there is no reason to pay a scarcity premium on the strength of these frames alone.'
  ],
  disclosure: 'Discontinued Club is an independent retailer and is not affiliated with or endorsed by the brands discussed. This U.S.-focused article reviews reader-submitted images and linked public sources. We have not obtained direct manufacturer confirmation of the proposed launches.',
  sections: [
    { id: 'core-power-banana', heading: 'Core Power Banana: two bottles shown, no verified launch details', toc: 'Core Power Banana', paragraphs: [
      'The first frame shows yellow and dark-gray Core Power bottles labeled <strong>Banana</strong>, with 26g and 42g protein figures respectively. Those are details visible in the image. Without an authenticated new-product page or nutrition panel, we should not turn them into confirmed specifications, serving sizes or launch promises.',
      '<a href="https://fairlife.com/frequently-asked-questions/" target="_blank" rel="noopener noreferrer">Fairlife\'s official FAQ</a>, checked for this report, lists Vanilla, Chocolate and <strong>Strawberry Banana</strong> for Core Power 26g, and Vanilla, Chocolate and Strawberry for Core Power Elite 42g. Its <a href="https://fairlife.com/core-power/" target="_blank" rel="noopener noreferrer">Core Power page</a> also identifies Strawberry Banana. That combined flavor is not evidence of a new banana-only pair.',
      'We have not verified a U.S. release window or whether the pictured concepts would replace anything. A yellow banana graphic does not establish a reformulation of Strawberry Banana, and the fact that two protein amounts appear together does not prove they will launch together.'
    ]},
    { id: 'powerade-watermelon', heading: 'Powerade Watermelon: distinguish the sports drink from Power Water', toc: 'Powerade Watermelon', paragraphs: [
      'The second frame shows a red drink in a standard-style Powerade sports bottle with a bright green Watermelon label. It does not display the Power Water name. We have not authenticated this particular bottle as an announced new U.S. product.',
      'There is already an official <a href="https://www.powerade.com/products/powerade-power-water" target="_blank" rel="noopener noreferrer">Powerade Power Water Watermelon listing</a>. The brand identifies Power Water as a zero-sugar flavored-water range, and lists Watermelon in a 20-ounce size. That is useful context, but it is not the same product claim as the sports-drink image.',
      'The <a href="https://www.powerade.com/products/powerade" target="_blank" rel="noopener noreferrer">standard Powerade catalog</a> is a separate product page. When comparing sightings, look for the full line name rather than treating every Powerade bottle with a melon flavor as interchangeable. We have not established a release date, final nutrition information or a replacement for another sports-drink flavor.'
    ]},
    { id: 'sprite-chill-strawberry-kiwi', heading: 'Sprite Chill Strawberry Kiwi already has a release history', toc: 'Sprite Chill Strawberry Kiwi', paragraphs: [
      'This is the clearest correction to a five-brand-new-flavors interpretation. <a href="https://sporked.com/article/sprite-chill-strawberry-kiwi-review/" target="_blank" rel="noopener noreferrer">Sporked reviewed Sprite Chill Strawberry Kiwi on March 28, 2025</a>, identifying it as a limited-time Walmart release. An <a href="https://sporked.com/article/sprite-chill-new-sprite-chill-flavors-news/" target="_blank" rel="noopener noreferrer">April 9, 2026 follow-up</a> reported a limited return expected in mid-May 2026. It is not a flavor first revealed by the September reel.',
      'A <a href="https://www.walmart.com/ip/14263556321" target="_blank" rel="noopener noreferrer">Walmart product record for Strawberry Kiwi cans</a> also exists. A surviving retail page is evidence of the product identity, not a guarantee of stock in your ZIP code. Nor does earlier coverage establish that a new permanent rollout is happening now.',
      'The frame might concern another return, wider distribution or simply an existing flavor. We do not have the complete narration, so we cannot attribute a particular claim to the presenter. What we can say is that the product has a documented past and any newly claimed change needs its own evidence.'
    ]},
    { id: 'topo-chico-pineapple-coconut', heading: 'Topo Chico Sabores Pineapple Coconut: the exact pairing is unverified', toc: 'Topo Chico Pineapple Coconut', paragraphs: [
      'The fourth image shows a yellow-and-white <strong>Topo Chico Sabores Pineapple Coconut</strong> can. It presents the drink as flavored sparkling water. We have not verified the pictured can as final packaging or located a U.S. launch announcement for that exact pairing.',
      'The <a href="https://www.coca-cola.com/us/en/brands/topo-chico/products/sabores" target="_blank" rel="noopener noreferrer">official U.S. Sabores page</a> checked for this report lists Passionfruit, Raspberry with Lemon, Lime with Mint Extract, Tangerine with Ginger Extract, Tropical Mango and Blueberry with Hibiscus Extract. Pineapple Coconut is not among the flavor names shown there.',
      'That is a snapshot of the public lineup, not a rejection of the possibility. We would need a dated announcement or authenticated product record to establish timing and specifications. Existing Sabores ingredients, calories or pack sizes should not be copied onto this proposed flavor as though they were its own label.'
    ]},
    { id: 'vitaminwater-zero-sugar-grape', heading: 'vitaminwater Zero Sugar Grape: do not infer the formula from the color', toc: 'vitaminwater Zero Sugar Grape', paragraphs: [
      'The last frame shows a pink drink with a purple-and-white vitaminwater label. <strong>Zero Sugar</strong> and <strong>Grape</strong> are readable. Smaller formula wording is not clear enough in the supplied photograph for us to confidently transcribe a complete final product name.',
      'The <a href="https://www.coca-cola.com/us/en/brands/vitaminwater/products/vitaminwater-zero-sugar" target="_blank" rel="noopener noreferrer">official U.S. Zero Sugar page</a> includes an <strong>xxx acai blueberry pomegranate</strong> product. That is a different flavor description; it should not be renamed Grape because the label colors or liquid look similar.',
      'We have not verified a new U.S. Grape announcement, an ingredient panel or a connection to a historical vitaminwater formula. We are also not assigning this bottle the nutrients or sweeteners of an existing variety. The full label and an attributable product source are the missing pieces.'
    ]},
    { id: 'source-context', heading: 'What we can establish about the reel', toc: 'Source context', paragraphs: [
      'The five photographs show paused reel frames with the handle <strong>snachwithzach</strong>. The Core Power and vitaminwater frames visibly carry the date <strong>9/23/26</strong>. That helps identify the material the reader is asking about; it does not independently authenticate a manufacturer release date.',
      'We have not reviewed the complete reel or its audio, so this article does not quote the presenter or claim to reproduce his full reporting. The images are leads to investigate. Brand catalogs and dated coverage provide the separate checks above.',
      'For the other image being shared, our <a href="journal/new-soda-rumors-coca-cola-pepsi-mr-pibb.html">Coca-Cola, Pepsi and Mr. Pibb soda roundup</a> examines Strawberry Float, Cherry Lime, Strawberry Shortcake and Black Currant. The two reports distinguish upcoming-product claims from confirmed launches and from products with an existing history.'
    ]}
  ],
  faqHeading: 'New drink flavor questions',
  faq: [
    { question: 'Is banana-only Core Power confirmed in both 26g and 42g?', answer: 'Not in our September 23, 2026 review. Both figures appear in the shared image, but we have not authenticated the proposed products or their launch timing.' },
    { question: 'Is Powerade Watermelon the same as Power Water Watermelon?', answer: 'Not necessarily. Power Water Watermelon is officially listed, while the submitted frame depicts a different, standard-style sports-drink bottle.' },
    { question: 'Is Sprite Chill Strawberry Kiwi a brand-new flavor?', answer: 'No. It was reviewed in March 2025, and a limited 2026 return was subsequently reported. A newly shared image does not establish another launch.' },
    { question: 'Is Topo Chico Sabores Pineapple Coconut confirmed?', answer: 'We have not verified an official U.S. announcement for the exact pictured flavor. It was not among the names on the U.S. Sabores page checked for this report.' },
    { question: 'Is vitaminwater Zero Sugar Grape available now?', answer: 'We have not verified current U.S. retail availability for the exact bottle in the image. Similar colors or an existing flavor do not establish that it is the same product.' }
  ],
  sources: [
    { label: 'Fairlife: official product FAQ', url: 'https://fairlife.com/frequently-asked-questions/', note: 'Core Power flavor lists, checked September 23, 2026' },
    { label: 'Fairlife: Core Power range', url: 'https://fairlife.com/core-power/', note: 'current product identity, not confirmation of banana-only additions' },
    { label: 'Powerade: Power Water', url: 'https://www.powerade.com/products/powerade-power-water', note: 'official Watermelon listing in a separate product line' },
    { label: 'Powerade: standard sports-drink catalog', url: 'https://www.powerade.com/products/powerade', note: 'checked September 23, 2026' },
    { label: 'Sporked: Sprite Chill Strawberry Kiwi review', url: 'https://sporked.com/article/sprite-chill-strawberry-kiwi-review/', note: 'Tyler Bowers, March 28, 2025; documents the earlier product' },
    { label: 'Sporked: new and returning Sprite Chill flavors', url: 'https://sporked.com/article/sprite-chill-new-sprite-chill-flavors-news/', note: 'Gwynedd Stuart, April 9, 2026; reports a limited return, not a September announcement' },
    { label: 'Walmart: Sprite Chill Strawberry Kiwi product record', url: 'https://www.walmart.com/ip/14263556321', note: 'product identity only; local availability not verified' },
    { label: 'Topo Chico: U.S. Sabores catalog', url: 'https://www.coca-cola.com/us/en/brands/topo-chico/products/sabores', note: 'flavor names checked September 23, 2026' },
    { label: 'vitaminwater: U.S. Zero Sugar range', url: 'https://www.coca-cola.com/us/en/brands/vitaminwater/products/vitaminwater-zero-sugar', note: 'checked September 23, 2026; xxx identified as acai blueberry pomegranate' },
    { label: 'Reader-submitted reel frames', url: 'https://discontinuedclub.com/journal/core-power-banana-powerade-watermelon-new-drink-flavors.html#evidence-images', note: 'visible snachwithzach credit retained; original URL and complete narration not supplied' }
  ]
};
