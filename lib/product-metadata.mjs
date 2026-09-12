const brandRules = [
  [/^Monster(?: Energy| Juice| Reserve)?\b/i, 'Monster Energy'],
  [/^Red Bull\b/i, 'Red Bull'],
  [/^Alani Nu\b/i, 'Alani Nu'],
  [/^Mountain Dew\b/i, 'Mountain Dew'],
  [/^Pepsi\b/i, 'Pepsi'],
  [/^Sprite\b/i, 'Sprite'],
  [/^Coca-Cola\b/i, 'Coca-Cola'],
  [/^Starry\b/i, 'Starry'],
  [/^Liquid Death\b/i, 'Liquid Death'],
  [/^Penn-Plax\b/i, 'Penn-Plax'],
  [/^Pokemon\b/i, 'Pokemon'],
  [/^Funko\b/i, 'Funko'],
  [/^Etnies\b/i, 'Etnies'],
  [/^Powell Peralta\b/i, 'Powell Peralta'],
  [/^Caress\b/i, 'Caress'],
  [/^Art of Sport\b/i, 'Art of Sport'],
  [/^Softsoap\b/i, 'Softsoap'],
  [/^Suave\b/i, 'Suave'],
  [/^Dial\b/i, 'Dial']
];

const categoryLabels = {
  drinks: 'Food, Beverages & Tobacco > Beverages',
  apparel: 'Apparel & Accessories',
  collectibles: 'Collectibles',
  care: 'Health & Beauty > Personal Care',
  home: 'Home & Garden'
};

export function productBrand(item) {
  const detail = `${item.name} ${item.detail}`;
  if (/\badidas\b/i.test(detail)) return 'adidas';
  if (/\bFanatics\b/i.test(detail)) return 'Fanatics';
  if (/\bNike\b/i.test(detail)) return 'Nike';
  if (/\bJordan\b/i.test(detail)) return 'Jordan';
  return brandRules.find(([pattern]) => pattern.test(item.name))?.[1] || 'Discontinued Club';
}

export function productCondition(item) {
  if (/pre[- ]?owned|used|open box|refurbished/i.test(item.condition || '')) return 'used';
  return item.id === '406834655819' ? 'used' : 'new';
}

export function productConditionLabel(item) {
  return productCondition(item) === 'used' ? 'Pre-owned' : 'New';
}

export function productType(item) {
  return categoryLabels[item.category] || 'Other';
}
