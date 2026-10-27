const announcement = 'https://www.nosh.com/pr/2026/10/26/heavenly-hunks-dupe-loops-mini-donuts-expand-to-sprouts-and-costco-following-target-launch';
const locator = 'https://heavenlyhunks.com/pages/find-us';

export const dupeLoopsReport = {
  slug: 'dupe-loops-sprouts-costco-mini-donuts-2026',
  brand: 'Dupe Loops', brands: ['Dupe Loops', 'Heavenly Hunks'], product: 'Dupe Loops Mini Donuts', theme: 'pink',
  format: 'news-brief', checkedDate: '2026-10-27', readTime: 2,
  statusKey: 'launch', statusLabel: 'Retail expansion', lane: 'New snack finds',
  title: 'Dupe Loops adds Sprouts and a different Costco bag.',
  seoTitle: 'Dupe Loops at Sprouts and Costco: Which Mini Donuts to Look For',
  description: 'The mini-donut rollout includes different formats. Here is what the new announcement establishes, and what shoppers still need to check locally.',
  deck: 'A familiar flavor name does not necessarily mean the same package at every retailer.',
  answerHeading: 'Two retailers, two assortments.',
  answer: 'Heavenly Hunks announced the Dupe Loops expansion on October 26. Sprouts gets the three original varieties; select Costco regions are due an organic version later this month.',
  sidebar: 'Do not assume that a national chain announcement covers every branch.',
  evidenceGrade: 'Brand-issued release',
  evidenceNote: 'The dated announcement distinguishes the assortments; individual warehouse stock remains unverified.',
  image: 'assets/images/journal/dupe-loops-2026.jpg', imageWidth: 467, imageHeight: 700,
  imageAlt: 'Purple Dupe Loops Babysitter mini-donut bag beside Heavenly Hunks oatmeal cookies in a picnic basket',
  caption: 'Brand-supplied photo of the original Babysitter bag beside Heavenly Hunks cookies, not the new organic Costco package.',
  imageCredit: 'Dupe Loops press materials via NOSH',
  cardCopy: 'Check the bag before comparing the new retailer offers.',
  relatedSlugs: ['ritz-gluten-free-crackers-release-2026', 'kidfresh-mini-muffins-breakfast-snacks-target-2026', 'little-debbie-hot-cocoa-mini-muffins-christmas-2026'],
  sections: [
    { id: 'sprouts', heading: 'The Sprouts lineup', toc: 'Sprouts', paragraphs: [
      `The <a href="${announcement}" target="_blank" rel="noopener noreferrer">brand-issued release</a> names 4 oz bags in more than 500 Sprouts stores: Babysitter with vanilla glaze and sprinkles, chocolate-frosted Bruce, and vanilla-glazed Plain Wayne. All three use a vanilla donut base.`,
      'That assortment follows a September Target debut. This is expanded distribution, not evidence that an earlier version has been discontinued.'
    ]},
    { id: 'costco', heading: 'The Costco distinction', toc: 'Costco', paragraphs: [
      'The Organic Babysitter is a separate certified-organic, 13 oz format planned exclusively for Costco in selected regions. The announcement does not name every participating warehouse or provide a universal arrival day.',
      `Use the <a href="${locator}" target="_blank" rel="noopener noreferrer">brand's store finder</a> as a starting point, then confirm the exact item with your store. A locator result should not be treated as a reserved bag waiting on the shelf.`
    ]},
    { id: 'package-comparison', heading: 'A bigger bag is a different comparison', toc: 'Package comparison', paragraphs: [
      'The announced Costco bag contains 3.25 times the net weight of a 4 oz Sprouts bag. That calculation compares weight only: it does not establish the number of donuts, an identical recipe or a better deal. To compare value, divide each actual shelf price by its own net weight. Without confirmed prices, there is no defensible savings percentage to publish.',
      'The photo above is useful for recognizing the original Babysitter branding, but it should not be used as a picture of the organic warehouse-club product. When sharing a find, include the retailer, exact variety and package weight. That makes it much easier to distinguish a newly spotted format from a familiar bag appearing at another chain.',
      'For readers trying these for the first time, the three original names describe different toppings rather than three different donut bases. Choose by the actual flavor description, not just the character name. We have not compared their sweetness, texture or portion sizes ourselves, so this report is a shopping reference rather than a ranked review.'
    ]}
  ],
  statusParagraphs: ['We have not independently checked shelves or confirmed a selling price. Avoid making a special trip based only on a reposted launch graphic.'],
  buyerHeading: 'Compare like with like',
  buyerParagraphs: ['Check the format, net weight and current label before comparing offers. We are not making allergen guarantees for an individual package or claiming a taste-test result.'],
  faq: [
    { question: 'Can I assume my Costco has them today?', answer: 'No. Confirm the item at your warehouse before traveling.' },
    { question: 'Are these available from Discontinued Club?', answer: 'No. This is editorial coverage, separate from our live inventory.' }
  ],
  disclosure: 'Independent, unsponsored reporting. Discontinued Club has not taste-tested these products or verified every retailer location.',
  sources: [
    { label: 'Dupe Loops: retail expansion announcement', url: announcement, note: 'brand-issued October 26 release hosted by NOSH; reviewed October 27, 2026' },
    { label: 'Heavenly Hunks: store finder', url: locator, note: 'official location-search starting point, not verified on-shelf counts' }
  ]
};
