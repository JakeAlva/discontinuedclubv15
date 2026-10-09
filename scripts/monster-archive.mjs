export const monsterArchiveReviewed = '2026-10-09';

export const monsterArchiveSources = {
  origin: ['2004 company filing: launch history', 'https://investors.monsterbevcorp.com/node/10766/html'],
  khaos: ['2005 company filing', 'https://investors.monsterbevcorp.com/node/10071/html'],
  early: ['2008 company filing: early portfolio', 'https://investors.monsterbevcorp.com/node/10416/html'],
  experiments: ['2010 company filing: formats and Hitman withdrawal', 'https://investors.monsterbevcorp.com/node/9101/html'],
  rehab: ['2012 company filing: introductions and portfolio', 'https://investors.monsterbevcorp.com/node/11396/html'],
  muscle: ['2014 company filing: product introductions', 'https://investors.monsterbevcorp.com/node/12156/html'],
  gronk: ['2016 company filing: Gronk and portfolio', 'https://investors.monsterbevcorp.com/node/12976/html'],
  maxx: ['2018 company update: Nitrous becomes MAXX', 'https://investors.monsterbevcorp.com/node/13681/pdf'],
  later: ['2019 annual report: portfolio and launches', 'https://investors.monsterbevcorp.com/static-files/3a18c9a4-75b9-4d53-b041-14b1bb1c2403'],
  modern: ['2021 annual report: later product families', 'https://investors.monsterbevcorp.com/static-files/d69a2a91-c3dd-4139-871e-d9694a715c83'],
  cuts2025: ['Sporked: reported 2025 cuts', 'https://sporked.com/article/monster-discontinuing-flavors-2025/'],
  cuts2026: ['Sporked: 2026 retailer reset', 'https://sporked.com/article/monster-energy-discontinued-2026/'],
  khaotic: ['Sporked: Khaotic withdrawal report, January 2026', 'https://sporked.com/article/monster-juice-khaotic-discontinued/'],
  scheduled: ['Sporked: reported departures before 2027, September 28', 'https://sporked.com/article/heres-all-12-monster-energy-drinks-being-discontinued-by-2027/'],
  retired: ['Chowhound: historical U.S. departures', 'https://www.chowhound.com/2070440/discontinued-monster-energy-flavors/'],
  citron: ['2019 earnings call: management discusses Ultra Citron', 'https://www.roic.ai/quote/MNST/transcripts/2019-year/1-quarter'],
  return: ['Monster: Green Tea announcement, September 2024', 'https://www.prnewswire.com/news-releases/monster-energy-introduces-rehab-green-tea-for-ultimate-refreshment-and-recovery-302239820.html'],
  us: ['Monster: current U.S. directory', 'https://www.monsterenergy.com/en-us/energy-drinks/'],
  uk: ['Monster: Great Britain directory', 'https://www.monsterenergy.com/en-gb/energy-drinks/monster-energy/']
};

export const monsterArchiveStatuses = {
  historical: 'Historical record / exit undated',
  discontinued: 'U.S. departure supported',
  format: 'Retired version / renamed',
  returned: 'Returned, then on watch',
  watch: 'Reported future exit'
};

const entry = (year, name, family, sources, options = {}) => ({
  year, name, family, sources, status: 'historical',
  dateLabel: `Documented by ${year}`,
  note: 'Historical catalog record. An exact U.S. withdrawal date has not been verified.',
  ...options,
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')
});
const group = (year, names, family, sources, options) => names.map((name) => entry(year, name, family, sources, options));

// "Documented by" is deliberately not a launch or discontinuation date.
export const monsterArchive = [
  entry(2004, 'Monster Assault', 'Original / Juice', ['origin', 'uk', 'us'], { dateLabel: 'Introduced 2004', note: 'The original name predates later overseas versions. U.S. exit timing remains unverified.' }),
  entry(2005, 'Monster Khaos', 'Original / Juice', ['khaos', 'khaotic'], { dateLabel: 'Introduced 2005', status: 'format', note: 'Predecessor to Khaotic, not a second name for every later orange can.' }),
  entry(2007, 'Monster M-80 / Ripper', 'Original / Juice', ['early', 'uk'], { dateLabel: 'M-80 introduced 2007', status: 'format', note: 'M-80 was called Ripper in some countries. Overseas Ripper is not proof of a U.S. return.' }),
  entry(2007, 'Monster MIXXD', 'Original / Juice', ['early', 'uk'], { dateLabel: 'Introduced 2007', note: 'The historical U.S. record and current overseas Mixxd range need separate treatment.' }),
  entry(2007, 'Monster Heavy Metal', 'Original / Juice', ['early', 'retired'], { dateLabel: 'Introduced 2007', status: 'discontinued', note: 'Reported retired; the exact end of American distribution is not established here.' }),
  ...group(2008, ['Java Originale', 'Java Russian', 'Java Chai Hai', 'Java Nut Up', 'Java Lo-Ball'], 'Coffee', ['early']),
  ...group(2008, ['Hitman Energy Shooter', 'Hitman LOBO', 'Hitman Sniper'], 'Shots / concentrated', ['early', 'experiments'], { status: 'discontinued', note: 'The 2010 filing explicitly describes the shooter line as being discontinued.' }),
  ...group(2010, ['Nitrous Super Dry', 'Nitrous Anti-Gravity', 'Nitrous Killer-B', 'Nitrous Black Ice'], 'Nitrous / MAXX', ['experiments', 'maxx'], { status: 'format', note: 'Earlier Nitrous generation. The U.S. line later became MAXX; individual exit dates differ.' }),
  entry(2010, 'Monster Import Light', 'Original / Juice', ['experiments'], { dateLabel: 'Introduced 2010' }),
  entry(2010, 'Monster Absolutely Zero', 'Original / Juice', ['experiments'], { dateLabel: 'Introduced 2010', status: 'format', note: 'Archived name and version. Do not label today\'s entire Zero Sugar range discontinued.' }),
  entry(2010, 'Monster Dub Edition', 'Original / Juice', ['experiments', 'rehab'], { dateLabel: 'Introduced 2010', status: 'format', note: 'The early Dub name preceded later Baller\'s Blend and Mad Dog records.' }),
  ...group(2010, ['X-Presso Hammer', 'X-Presso Midnite'], 'Coffee', ['experiments']),
  ...group(2010, ['Java Kona Blend', 'Java Vanilla Light', 'Java Toffee'], 'Coffee', ['experiments']),
  entry(2010, 'Monster M3 Super Concentrate', 'Shots / concentrated', ['experiments'], { dateLabel: 'Introduced 2010', note: 'The small-format U.S. record should not be confused with later international M3 packaging.' }),
  ...group(2012, ['Rehab Rojo / Raspberry Tea', 'Rehab Protean'], 'Rehab / Tea', ['rehab', 'gronk']),
  entry(2012, 'Rehab Green Tea (earlier version)', 'Rehab / Tea', ['rehab', 'return'], { status: 'returned', note: 'A historical version preceded the documented 2024 return. The returning can has its own entry.' }),
  entry(2012, 'Rehab Tea + Orangeade', 'Rehab / Tea', ['rehab'], { dateLabel: 'Introduced 2012' }),
  entry(2012, 'Monster Cuba-Lima', 'Original / Juice', ['rehab'], { dateLabel: 'Introduced 2012', note: 'Lime-flavored historical entry. No verified U.S. last-production date is assigned.' }),
  entry(2012, 'Ubermonster Energy Brew', 'Original / Juice', ['rehab'], { dateLabel: 'Introduced 2012' }),
  ...group(2012, ["Dub / Punch Baller's Blend", 'Dub / Punch Mad Dog'], 'Original / Juice', ['rehab', 'muscle'], { dateLabel: 'Dub versions introduced 2012', status: 'format', note: 'The names moved to Punch in 2014. That rebrand is separate from a final U.S. exit.' }),
  entry(2014, 'Monster Unleaded', 'Original / Juice', ['muscle'], { dateLabel: 'Introduced 2014' }),
  entry(2014, 'Java Cappuccino', 'Coffee', ['muscle']),
  entry(2014, 'Rehab Tea + Pink Lemonade', 'Rehab / Tea', ['muscle', 'retired'], { status: 'discontinued', note: 'Reported retired. Pink Lemonade and Strawberry Lemonade are distinct entries.' }),
  ...group(2014, ['Muscle Chocolate', 'Muscle Vanilla', 'Muscle Coffee', 'Muscle Strawberry', 'Muscle Peanut Butter Cup'], 'Protein', ['muscle']),
  entry(2016, 'Muscle Banana', 'Protein', ['gronk']),
  entry(2016, 'Monster Gronk', 'Original / Juice', ['gronk'], { dateLabel: 'Introduced 2016', note: 'The athlete-branded release is recorded in the company\'s 2016 introductions.' }),
  entry(2016, 'Monster Ultra Citron', 'Ultra', ['gronk', 'citron'], { status: 'discontinued', note: 'Management discussed discontinuing it in the U.S. on the May 2019 earnings call.' }),
  entry(2018, 'Rehab White Dragon Tea', 'Rehab / Tea', ['maxx', 'retired'], { dateLabel: 'Introduced 2018', status: 'discontinued', note: 'Reported retired. It is not interchangeable with every later Dragon Tea product.' }),
  ...group(2019, ['MAXX Super Dry', 'MAXX Eclipse', 'MAXX Solaris', 'MAXX Mango Matic', 'MAXX Rad Red'], 'Nitrous / MAXX', ['later']),
  ...group(2019, ['Caffe Vanilla', 'Caffe Salted Caramel', 'Caffe Mocha'], 'Coffee', ['later']),
  ...group(2019, ['Espresso and Cream', 'Espresso Vanilla', 'Espresso Salted Caramel'], 'Coffee', ['later']),
  entry(2019, "Java Farmer's Oats", 'Coffee', ['later'], { dateLabel: 'Introduced 2019' }),
  entry(2019, 'Java Swiss Chocolate', 'Coffee', ['later'], { dateLabel: 'U.S. national launch 2019' }),
  entry(2019, 'Java Irish Blend', 'Coffee', ['later'], { note: 'Historical Irish Blend is distinct from the later Irish Creme name.' }),
  ...group(2019, ['Dragon Tea Green Tea', 'Dragon Tea White Tea', 'Dragon Tea Yerba Mate'], 'Rehab / Tea', ['later']),
  ...group(2019, ['Hydro Blue Ice', 'Hydro Manic Melon', 'Hydro Mean Green', 'Hydro Purple Passion', 'Hydro Tropical Thunder', 'Hydro Zero Sugar'], 'Hydro', ['later']),
  entry(2019, 'Monster Mule Ginger Brew', 'Original / Juice', ['later', 'retired', 'uk'], { dateLabel: 'U.S. national launch 2019', status: 'discontinued', note: 'Reported U.S. departure; the British directory still has a separate Mule listing.' }),
  entry(2021, 'Juice Monster Papillon', 'Original / Juice', ['modern', 'retired', 'uk'], { status: 'discontinued', note: 'Reported U.S. departure. Overseas Monarch is a separate market reference, not a U.S. relaunch.' }),
  entry(2021, 'Juice Monster Khaotic', 'Original / Juice', ['modern', 'khaotic'], { status: 'discontinued', note: 'A January 2026 report identifies a U.S. withdrawal. Distinct from original Khaos.' }),
  ...group(2021, ['Hydro Watermelon', 'Hydro Super Sport Blue Streak', 'Hydro Super Sport Killer Kiwi', 'Hydro Super Sport Macho Mango', 'Hydro Super Sport Red Dawg'], 'Hydro', ['modern']),
  entry(2021, 'Rehab Watermelon', 'Rehab / Tea', ['modern']),
  entry(2021, 'Ultra Gold / Golden Pineapple', 'Ultra', ['modern', 'uk', 'us'], { dateLabel: 'Ultra Gold introduced 2021', status: 'format', note: 'Names and markets changed. Current overseas listings do not date a U.S. withdrawal.' }),
  entry(2025, 'Ultra Red', 'Ultra', ['cuts2025', 'us'], { dateLabel: 'U.S. exit reported for 2025', status: 'discontinued', article: 'is-monster-ultra-red-discontinued', note: 'Listed in 2025 withdrawal reporting, even though a U.S. web listing survives.' }),
  entry(2025, 'Ultra Rosa', 'Ultra', ['cuts2025', 'us'], { dateLabel: 'U.S. exit reported for 2025', status: 'discontinued', note: 'Reported alongside Ultra Red. A surviving product page does not establish replenishment.' }),
  entry(2025, 'Aussie Style Lemonade', 'Original / Juice', ['cuts2025', 'uk'], { dateLabel: 'U.S. exit reported for 2025', status: 'discontinued', article: 'is-monster-aussie-lemonade-discontinued', note: 'U.S. withdrawal and continued foreign availability can coexist.' }),
  entry(2025, 'Rehab Strawberry Lemonade', 'Rehab / Tea', ['cuts2025'], { dateLabel: 'U.S. exit reported for 2025', status: 'discontinued', article: 'is-monster-rehab-strawberry-lemonade-discontinued', note: 'The Rehab version is not the newer Juice Strawberry Lemonade.' }),
  ...group(2025, ['Java 300 Mocha', 'Java 300 French Vanilla'], 'Coffee', ['cuts2025'], { dateLabel: '2025 replacement reporting', status: 'format', note: 'Retired 300 naming; Killer Brew followed. Do not count this as all coffee flavors ending.' }),
  entry(2026, 'Ultra Watermelon', 'Ultra', ['cuts2026', 'us'], { dateLabel: '2026 retailer-reset report', status: 'discontinued', article: 'is-monster-ultra-watermelon-discontinued', note: 'The Ultra can, not Reserve Watermelon or Rehab Watermelon.' }),
  entry(2026, 'Reserve Peaches N Creme', 'Reserve', ['cuts2026', 'us'], { dateLabel: '2026 retailer-reset report', status: 'discontinued', article: 'is-monster-reserve-peaches-n-creme-discontinued', note: 'Distribution reporting and surviving public listings are explained in the full report.' }),
  entry(2026, 'Reserve Orange Dreamsicle', 'Reserve', ['cuts2026', 'us'], { dateLabel: 'Version change reviewed 2026', status: 'format', article: 'is-monster-reserve-orange-dreamsicle-discontinued', note: 'The Reserve version changed; standard Orange Dreamsicle is a separate current product.' }),
  entry(2026, 'Reserve White Pineapple', 'Reserve', ['us', 'uk'], { dateLabel: 'U.S. lineup reviewed 2026', article: 'is-monster-reserve-white-pineapple-discontinued', note: 'Absent from the current U.S. directory, present overseas. No dated brand exit notice verified.' }),
  ...[
    ['Ultra Fantasy Ruby Red', 'Ultra', 'is-monster-ultra-fantasy-ruby-red-being-discontinued'],
    ['Juice Rio Punch', 'Original / Juice', 'is-monster-rio-punch-being-discontinued'],
    ['Rehab Green Tea (2024 return)', 'Rehab / Tea', 'is-monster-rehab-green-tea-being-discontinued'],
    ['Java Cafe Latte', 'Coffee', 'is-java-monster-cafe-latte-being-discontinued'],
    ['Java Irish Creme', 'Coffee'],
    ['Nitro Super Dry', 'Nitrous / MAXX']
  ].map(([name, family, article]) => entry(2026, name, family, ['scheduled', 'us'], {
    dateLabel: 'September 2026 report', status: 'watch', article,
    note: 'Reported for withdrawal before 2027; not independently verified as a completed U.S. exit.'
  }))
];

export function monsterTimelineMarkup(escapeHtml) {
  const escape = escapeHtml;
  const families = [...new Set(monsterArchive.map((item) => item.family))].sort();
  const eras = [[2000, 2009, 'The early experiments'], [2010, 2016, 'New formats, new families'], [2017, 2021, 'Coffee, tea and hydration'], [2022, 2026, 'Recent exits and the watch list']];
  const rows = (items) => items.map((item) => `<article class="monster-timeline-entry" id="monster-${item.id}" data-archive-entry data-family="${escape(item.family)}" data-status="${item.status}"><div class="monster-entry-date">${escape(item.dateLabel)}</div><div class="monster-entry-body"><div class="monster-entry-meta"><span>${escape(item.family)}</span><span class="monster-evidence monster-evidence-${item.status}">${monsterArchiveStatuses[item.status]}</span></div><h3>${escape(item.name)}</h3><p>${escape(item.note)}</p><details><summary>Evidence${item.article ? ' and full report' : ''}</summary><ul>${item.sources.map((key) => `<li><a href="${monsterArchiveSources[key][1]}" target="_blank" rel="noopener noreferrer">${escape(monsterArchiveSources[key][0])}</a></li>`).join('')}</ul>${item.article ? `<a class="text-link" href="journal/${item.article}.html">Read the full status report &rarr;</a>` : ''}</details></div></article>`).join('');
  return `<section class="section monster-archive" id="timeline"><div class="container">
    <div class="section-kicker">The Monster archive</div><h2>A history beyond the current shelf.</h2>
    <p class="monster-archive-intro">Monster launched in 2002. This archive follows discontinued flavors, retired versions and historical lines from the years that followed. <strong>Dates mean exactly what their labels say:</strong> a documented-by year is not an invented launch or retirement date. Recent withdrawal reports appear at the end.</p>
    <p class="monster-archive-note">${monsterArchive.length} records, not ${monsterArchive.length} confirmed discontinuations. Older entries with an unverified U.S. end date stay visibly separate from supported departures. This is an expanding, sourced archive, not a claim that every regional size or formula has been accounted for. <a href="${monsterArchiveSources.origin[1]}">Brand launch source</a>.</p>
    <form class="monster-archive-filters" data-archive-filters hidden role="search" aria-label="Search the Monster archive"><label>Find a flavor<input type="search" name="q" placeholder="Khaos, Java, Ultra Red..." autocomplete="off"></label><label>Product family<select name="family"><option value="">All families</option>${families.map((family) => `<option>${escape(family)}</option>`).join('')}</select></label><label>Evidence<select name="status"><option value="">All records</option>${Object.entries(monsterArchiveStatuses).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label><button type="reset" class="text-link">Reset</button></form>
    <div class="monster-archive-navigation"><nav aria-label="Timeline eras">${eras.map(([start, end]) => `<a href="#monster-era-${start}">${start === 2000 ? '2002' : start}&ndash;${end}</a>`).join('')}</nav><p data-archive-count role="status" aria-live="polite">${monsterArchive.length} archive records</p></div>
    <p data-archive-empty hidden>No matching records. Try a different flavor, family or evidence filter.</p>
    ${eras.map(([start, end, title]) => `<details class="monster-era" id="monster-era-${start}" data-archive-era${start === 2022 ? ' open data-default-open' : ''}><summary><span>${start === 2000 ? '2002' : start}&ndash;${end}</span><h3>${title}</h3></summary><div>${rows(monsterArchive.filter((item) => item.year >= start && item.year <= end))}</div></details>`).join('')}
    <p class="monster-archive-note">Scope: Monster-branded non-alcoholic products with a U.S. historical connection. Other Monster Beverage brands, foreign-only launches, package-size changes and unverified collector-list dates are not silently counted as U.S. flavor discontinuations. Have a dated notice or a missing U.S. can? <a href="contact.html">Send the evidence to the research desk</a>.</p>
  </div></section>`;
}
