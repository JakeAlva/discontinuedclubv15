const announcement = 'https://www.instagram.com/p/DepNRXjF8Nr/';
const coverage = 'https://secretatlanta.co/waffle-house-salsa/';
const history = 'https://sporked.com/article/waffle-house-is-finally-giving-us-what-weve-been-begging-for/';

export const waffleHouseSalsaReport = {
  slug: 'waffle-house-salsa-return-october-2026',
  brand: 'Waffle House', brands: ['Waffle House'], product: 'Waffle House Salsa', theme: 'yellow',
  format: 'news-brief', checkedDate: '2026-10-21', editionDate: '2026-10-21', readTime: 3,
  statusKey: 'current', statusLabel: 'Brand announcement confirmed', lane: 'Restaurant return watch',
  title: 'Waffle House salsa is back. Is it the old recipe?',
  seoTitle: 'Waffle House Salsa Returns: October 2026 Announcement Explained',
  description: 'Waffle House announced salsa on October 19, 2026. See the new packets, what is known about availability, and why the old Casa de Waffle recipe is not confirmed.',
  deck: 'The packets are real and the brand announcement is confirmed. The question longtime fans are asking about the old recipe still needs a separate answer.',
  answerHeading: 'Waffle House announced salsa on October 19.',
  answer: 'The verified Waffle House Instagram account introduced Waffle House Salsa in a post dated October 19, 2026. Its photograph shows red Medium Salsa packets next to a breakfast bowl. That confirms the product announcement, not an identical return of the old Casa de Waffle recipe.',
  sidebar: 'Confirmed announcement. Recipe continuity and stock at individual restaurants remain unverified.',
  evidenceGrade: 'Official brand post + contemporary reporting',
  evidenceNote: 'The original Instagram post and its displayed publication date were checked directly on October 21, rather than inferring the announcement date from a later news article.',
  image: 'assets/images/journal/waffle-house-salsa-official-2026.webp', imageWidth: 1440, imageHeight: 1440,
  imageAlt: 'Waffle House promotional photograph of three red Medium Salsa packets beside a breakfast bowl',
  caption: 'The packets in the official announcement say Medium Salsa. The photograph does not establish that the recipe matches earlier versions.',
  imageCredit: 'Waffle House / official Instagram',
  cardCopy: 'The October announcement, the new packet and what remains unknown about the old recipe.',
  relatedSlugs: ['is-mountain-dew-sweet-lightning-discontinued-kfc-coca-cola-2027', 'dunkin-halloween-2026-green-apple-zero', 'wingstop-sour-patch-kids-wicked-punch-release-2026'],
  sections: [
    { id: 'announcement', heading: 'What has Waffle House actually confirmed?', toc: 'The original post', paragraphs: [
      `The <a href="${announcement}" target="_blank" rel="noopener noreferrer">official announcement</a> introduces Waffle House Salsa after requests from customers. The post's visible date is October 19. Later articles can have a different publication date; that does not move the original announcement.`,
      'The image is useful evidence because it shows the actual product presentation, rather than a generic restaurant exterior. It identifies a branded packet and a heat description. It does not provide the full ingredient panel, a nationwide inventory count or a manufacturing history.',
      'This is the distinction that matters for a return story: a brand can bring a product category back without promising an unchanged formula. We can confirm the announcement while leaving the recipe question open.'
    ]},
    { id: 'casa-de-waffle', heading: 'Is this the same as Casa de Waffle salsa?', toc: 'The recipe question', paragraphs: [
      `Contemporary <a href="${history}" target="_blank" rel="noopener noreferrer">Sporked coverage</a> connects the return with the older Casa de Waffle picante sauce and reports that the earlier option disappeared during the pandemic. That is reported historical context, not a manufacturer statement identifying a precise discontinuation month.`,
      'The current brand post does not say the new packet uses the same recipe, supplier or formulation as that older sauce. A familiar use at breakfast and an enthusiastic comment section are not enough to fill those gaps.',
      'If you remember the old sauce, a personal side-by-side comparison would be interesting, but it would still be a taste impression. Confirming recipe continuity would require a statement from the company or another direct record. We have not obtained that confirmation and have not taste-tested the new salsa.'
    ]},
    { id: 'availability', heading: 'Can you get it at your local Waffle House?', toc: 'Restaurant availability', paragraphs: [
      `<a href="${coverage}" target="_blank" rel="noopener noreferrer">Secret Atlanta's October 20 report</a> says Waffle House replied that it was available now on X. That supports an active rollout rather than a teaser for an unspecified future year. It still does not document the stock at every restaurant.`,
      'Ask your location whether it has the new salsa before making a special trip. If you are ordering delivery, check whether the restaurant can include it rather than assuming every ordering service has added a condiment option.',
      'We have not verified a retail bottle, an online case listing or a nationwide packet price from the announcement. Avoid treating third-party resale offers as an official grocery launch. The product shown here is a restaurant condiment, and this article is not an offer to sell it.'
    ]}
  ],
  statusParagraphs: ['Our timeline records an October 2026 announcement and return to coverage. The earlier absence is reported as pandemic-era, with no verified month in the sources reviewed. No official end date or guarantee of permanent availability is established here.'],
  buyerHeading: 'Why the wording of a comeback matters',
  buyerParagraphs: [
    'For an archive, "back" is the start of the investigation rather than the answer to every question. Brand, package, recipe, serving format and distribution can change independently. We keep those distinctions visible so a familiar name does not become a claim the evidence cannot support.',
    'Save a photograph of the packet if you try it, including the back label. That provides a better reference for future comparisons than relying on a restaurant menu thumbnail or a memory of how an earlier version tasted.'
  ],
  faq: [
    { question: 'When did Waffle House announce the salsa?', answer: 'The official Instagram post is dated October 19, 2026. This guide was checked and published October 21.' },
    { question: 'Is the old Casa de Waffle recipe confirmed?', answer: 'No. The brand announcement does not confirm an unchanged recipe or supplier.' },
    { question: 'Does every restaurant have it?', answer: 'We have not checked individual restaurants. Contact your location for current availability.' },
    { question: 'Is this a new bottled grocery product?', answer: 'The announcement shows condiment packets. We have not verified an official retail-bottle launch.' }
  ],
  disclosure: 'Independent coverage, not sponsored by Waffle House. The official photograph is illustrative; we have not visited a restaurant or sampled the new salsa for this report.',
  sources: [
    { label: 'Waffle House: official salsa announcement', url: announcement, note: 'October 19, 2026; verified account, publication date and packet photograph inspected directly' },
    { label: 'Secret Atlanta: Waffle House Salsa', url: coverage, note: 'October 20, 2026; reporting on availability comments, not a store-by-store audit' },
    { label: 'Sporked: Waffle House salsa return', url: history, note: 'October 21, 2026; reported context on the earlier Casa de Waffle sauce' }
  ]
};
