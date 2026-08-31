const DC_CATALOG = [
  { id: '407039382525', category: 'drinks', name: 'Liquid Death x Pop-Tarts Carnage', detail: 'Strawberry sparkling water, limited 6-pack, 12 fl oz cans', price: '$13.99', image: '475e0f8d3f1d0a4e.webp', featured: true, maxQuantity: 2 },
  { id: '406730413999', category: 'drinks', name: 'Mountain Dew Maui Burst', detail: 'Pineapple, full unopened 16 oz can, 2020', price: '$12.99', image: 'e2f98160460fb5d0.webp', featured: true, maxQuantity: 6 },
  { id: '406713894369', category: 'drinks', name: 'Mountain Dew Baja Point Break Punch', detail: 'Tropical punch, 12-pack of 12 oz cans, 2024', price: '$44.99', image: '128614ee19f0144e.webp' },
  { id: '406711385310', category: 'drinks', name: 'Mountain Dew Baja Laguna Lemonade', detail: 'Mango lemonade, 12-pack of 12 oz cans, 2024', price: '$44.99', image: 'a69e24602a28c9e7.webp' },
  { id: '406705689212', category: 'drinks', name: 'Pepsi Soda Shop Cream Soda', detail: '50th Anniversary, full unopened 20 oz bottle, 2021', price: '$9.99', image: '2921ba8f2b1f6017.webp', featured: true },
  { id: '406738017949', category: 'drinks', name: 'Mountain Dew Baja Gold', detail: 'Pineapple, full unopened 20 oz bottle, 2021', price: '$10.99', image: '19902e5673ce650f.webp' },
  { id: '406794914124', category: 'drinks', name: 'Mountain Dew Zero Sugar Frost Bite', detail: 'Black tab, full unopened 12 oz can, 2021', price: '$8.99', image: '4b55cca74675b8ca.webp' },
  { id: '406730391892', category: 'drinks', name: 'Mountain Dew Baja Point Break Punch', detail: 'Tropical punch, full 20 oz bottle, 2024', price: '$11.99', image: '9b5398669bcaea4d.webp' },
  { id: '406738141008', category: 'drinks', name: 'Mountain Dew Baja Laguna Lemonade', detail: 'Mango lemonade, full 12 oz can, 2024', price: '$7.99', image: 'ed8766fc4d8c8e54.webp' },
  { id: '406794860747', category: 'drinks', name: "Mountain Dew Gingerbread Snap'd", detail: 'Full unopened 12 oz can, 2022', price: '$7.99', image: '40ab2123875d4cf0.webp', maxQuantity: 2 },
  { id: '406738058280', category: 'drinks', name: 'Pepsi x Peeps Marshmallow Cola', detail: 'Limited edition, full 20 oz bottle, 2023', price: '$8.99', image: 'a259117f32742e2a.webp' },
  { id: '406735072767', category: 'drinks', name: 'Mountain Dew Voo Dew 2', detail: 'Mystery flavor, four 16.9 oz bottles, 2020', price: '$29.99', image: '9540cd389082cad6.webp' },
  { id: '407085080884', category: 'drinks', name: 'Mountain Dew Baja Deep Dive', detail: 'Rare full unopened 16 oz can, 2023', price: '$41.99', image: 'b4b4e35b7cc955df.webp', featured: true },
  { id: '406738070393', category: 'drinks', name: 'Mountain Dew Baja Caribbean Splash', detail: 'Guava, full 12 oz can, 2023', price: '$4.99', image: 'abe1ed1451f5e5a2.webp' },
  { id: '406717975092', category: 'drinks', name: 'Sprite Lymonade Legacy', detail: 'Celebrating 50 Years of Hip-Hop, full 12 oz can', price: '$8.99', image: '0ac898f36113b476.webp', maxQuantity: 10 },
  { id: '406701613482', category: 'drinks', name: 'Mountain Dew Citrus Cherry', detail: 'USA no-promo design, full unopened 12 oz can, 2019', price: '$49.99', image: 'd2c033419f0b6d8f.webp' },
  { id: '406706330853', category: 'drinks', name: 'Mountain Dew Voo Dew 4 Zero Sugar', detail: 'Full unopened 20 oz bottle, 2022', price: '$9.99', image: '66f1771dc1fa4c18.webp' },
  { id: '406927100578', category: 'drinks', name: 'Mountain Dew Diet Code Red & Diet Caffeine Free', detail: 'Full unopened 12 oz can', price: '$49.99', image: '876985b6f0569440.webp' },
  { id: '406711373393', category: 'drinks', name: 'Mountain Dew Baja Passionfruit Punch', detail: '12-pack of 12 oz cans, 2023', price: '$49.99', image: 'b5dc2b4baaeea74a.webp' },
  { id: '406728820274', category: 'drinks', name: 'Coca-Cola Vanilla Sugar Free', detail: 'China release, full 500 ml bottle, 2025', price: '$10.99', image: '3193597bb70e8693.webp' },
  { id: '406795510403', category: 'drinks', name: 'Starry Zero Sugar Cranberry Blizz', detail: 'Lemon lime, full unopened 12 oz can, 2025', price: '$4.99', image: 'a97889647408e17c.webp', maxQuantity: 3 },
  { id: '406741032490', category: 'drinks', name: "Mountain Dew Flamin' Hot", detail: 'Heat citrus, full 12 oz can, 2022', price: '$8.99', image: 'bcbccb822f6881c7.webp', maxQuantity: 4 },
  { id: '406795016704', category: 'drinks', name: 'Mountain Dew LiveWire', detail: 'Orange old-design can, full unopened 12 oz, 2020', price: '$14.99', image: '0f0f8b1e47eac82d.webp' },

  { id: '407064120905', category: 'apparel', name: 'Florida Panthers Vincent Trocheck Jersey', detail: 'NWT Fanatics NHL jersey, white, men\'s size S', price: '$49.99', image: 'mockups/407064120905.webp' },
  { id: '407119925622', category: 'apparel', name: 'New England Patriots Julian Edelman Jersey', detail: 'NWT Nike Vapor Limited NFL jersey, white, men\'s size L', price: '$249.99', image: '02ac86d4595c4adc.webp', featured: true },
  { id: '406834655819', category: 'apparel', name: 'Etnies x Rockstar Energy Fader Vulc', detail: 'Men\'s black shoes, size 11 with original box, 2012', price: '$99.99', image: '8167a13655984166.webp', featured: true },
  { id: '407063808795', category: 'apparel', name: 'Boston Bruins Taylor Hall Jersey', detail: 'NWT adidas alternate NHL jersey, size 54', price: '$69.99', image: 'mockups/407063808795.webp' },
  { id: '407063633707', category: 'apparel', name: 'Nashville Predators P.K. Subban Jersey', detail: 'NWT Fanatics NHL jersey, gold, men\'s size M', price: '$49.99', image: 'mockups/407063633707.webp' },
  { id: '407117478926', category: 'apparel', name: 'Chicago Bears Mike Ditka Jersey', detail: 'NWT Nike NFL alternate jersey, white, men\'s size L', price: '$149.99', image: '60503c0b5f7d19ce.webp' },
  { id: '406876226806', category: 'apparel', name: 'Powell Peralta Mini-Logo Skateboard', detail: 'Vintage teal 7.875-inch deck with warranty card, 2002', price: '$179.99', image: '3447acd32941fd18.webp', featured: true },
  { id: '407063650804', category: 'apparel', name: 'Nashville Predators P.K. Subban Jersey', detail: 'NWT Fanatics NHL jersey, white, men\'s size M', price: '$49.99', image: 'mockups/407063650804.webp' },
  { id: '407063463950', category: 'apparel', name: 'Columbus Blue Jackets Sergei Bobrovsky Jersey', detail: 'NWT Fanatics NHL jersey, men\'s size M', price: '$49.99', image: 'mockups/407063463950.webp' },
  { id: '407120051396', category: 'apparel', name: 'Michigan Wolverines Jordan Football Jersey', detail: 'Number 1 yellow and blue V-neck, men\'s size S', price: '$49.99', image: '3dd9f435b93f0c64.webp' },
  { id: '407063539708', category: 'apparel', name: 'Buffalo Sabres Jack Eichel Jersey', detail: 'NWT Fanatics NHL jersey, blue, men\'s size L', price: '$49.99', image: 'mockups/407063539708.webp' },
  { id: '407151646374', category: 'apparel', name: 'Pittsburgh Pirates Bell Jersey', detail: 'NWT Nike MLB jersey, black and yellow, men\'s size S', price: '$54.99', image: '4274a8f620dcdfbc.webp' },
  { id: '407117217273', category: 'apparel', name: 'Los Angeles Kings Blank Jersey', detail: 'NWT adidas NHL jersey, black/white/silver, size 52', price: '$69.99', image: 'mockups/407117217273.webp' },
  { id: '407176877843', category: 'apparel', name: 'Anaheim Ducks Drysdale Jersey', detail: 'adidas NHL jersey, black, men\'s size 52', price: '$89.99', image: '45cd4bede45565c5.webp' },
  { id: '407064096234', category: 'apparel', name: "St. Louis Blues Ryan O'Reilly Jersey", detail: 'NWT adidas NHL jersey, blue, size 46', price: '$69.99', image: 'mockups/407064096234.webp' },
  { id: '407086613910', category: 'apparel', name: 'Los Angeles Kings Anze Kopitar Jersey', detail: 'NWT adidas captain NHL jersey, size 46', price: '$149.99', image: 'mockups/407086613910.webp' },

  { id: '407134859583', category: 'collectibles', name: 'Pokemon Destined Rivals Booster Bundle', detail: 'Factory sealed English box with 6 booster packs', price: '$64.99', image: '7ee2bde9fd49cb26.webp', featured: true, maxQuantity: 2 },
  { id: '406760868081', category: 'collectibles', name: 'Funko Pop! Wayne Gretzky #45', detail: 'Los Angeles Kings NHL vinyl figure', price: '$12.99', image: '8da5a3eda84b0bca.webp' },
  { id: '407086892969', category: 'collectibles', name: 'Pokemon Perfect Order Booster Bundle', detail: 'English box with 6 booster packs', price: '$41.99', image: '1c6ab9f4d119bded.webp', maxQuantity: 2 },
  { id: '407134944288', category: 'collectibles', name: 'Pokemon Destined Rivals 20-Pack Lot', detail: 'Scarlet & Violet booster packs, 200 cards total', price: '$189.99', image: '4abf1eaee665ec19.webp' },

  { id: '406763784733', category: 'care', name: 'Caress Shea Butter & Brown Sugar Body Wash', detail: 'Exfoliating and hydrating, 20 fl oz', price: '$9.99', image: '933162e9baba7be6.webp', maxQuantity: 2 },
  { id: '406760474283', category: 'care', name: 'Art of Sport Activated Charcoal Body Wash', detail: 'Compete energizing citrus, 16 fl oz', price: '$29.99', image: '256152db4df7ca68.webp', featured: true },
  { id: '406763456229', category: 'care', name: 'Softsoap Holiday Body Wash', detail: 'Peppermint candy and sugar cookie, 20 fl oz', price: '$29.99', image: '5b78e750ba88fb29.webp' },
  { id: '406763511763', category: 'care', name: 'Suave Coconut Oil Damage Repair Shampoo', detail: 'Suave Professionals, 12.6 fl oz', price: '$9.99', image: '773e3d2aa2065cf1.webp', maxQuantity: 3 },
  { id: '406761145645', category: 'care', name: 'Dial Cocoa Butter Body Wash', detail: 'Exfoliate & Restore with orange extract, 16 fl oz', price: '$7.99', image: '861b2cb7c330d553.webp' }
];

// Conservative packaged weights keep direct shipping from being undercharged.
const DC_SHIPPING_WEIGHTS_OZ = {
  '407039382525': 96,
  '406730413999': 20,
  '406713894369': 192,
  '406711385310': 192,
  '406705689212': 32,
  '406738017949': 32,
  '406794914124': 16,
  '406730391892': 32,
  '406738141008': 16,
  '406794860747': 16,
  '406738058280': 32,
  '406735072767': 96,
  '407085080884': 20,
  '406738070393': 16,
  '406717975092': 16,
  '406701613482': 16,
  '406706330853': 32,
  '406927100578': 32,
  '406711373393': 192,
  '406728820274': 32,
  '406795510403': 16,
  '406741032490': 16,
  '406795016704': 16,
  '407064120905': 32,
  '407119925622': 32,
  '406834655819': 64,
  '407063808795': 32,
  '407063633707': 32,
  '407117478926': 32,
  '406876226806': 112,
  '407063650804': 32,
  '407063463950': 32,
  '407120051396': 32,
  '407063539708': 32,
  '407151646374': 32,
  '407117217273': 32,
  '407176877843': 32,
  '407064096234': 32,
  '407086613910': 32,
  '407134859583': 24,
  '406760868081': 24,
  '407086892969': 24,
  '407134944288': 32,
  '406763784733': 32,
  '406760474283': 32,
  '406763456229': 32,
  '406763511763': 32,
  '406761145645': 32
};

DC_CATALOG.forEach((item) => {
  item.shippingWeightOz = DC_SHIPPING_WEIGHTS_OZ[item.id];
});

const DC_CATEGORIES = {
  all: { label: 'All items', count: 48 },
  drinks: { label: 'Rare drinks', count: 23 },
  apparel: { label: 'Sports & apparel', count: 16 },
  collectibles: { label: 'Collectibles & cards', count: 4 },
  care: { label: 'Personal care', count: 5 }
};

const DC_STORE_CONFIG = {
  currency: 'usd',
  directDiscountPercent: 3.5,
  standardShippingCents: 749,
  shippingTiers: [
    { maxWeightOz: 16, amountCents: 749 },
    { maxWeightOz: 48, amountCents: 1199 },
    { maxWeightOz: 96, amountCents: 1699 },
    { maxWeightOz: 160, amountCents: 2299 },
    { maxWeightOz: 240, amountCents: 2999 },
    { maxWeightOz: 400, amountCents: 3999 },
    { maxWeightOz: 640, amountCents: 5499 },
    { maxWeightOz: 1120, amountCents: 7999 }
  ],
  freeShippingThresholdCents: 10000,
  maxCartLines: 20,
  defaultMaxQuantity: 1
};

if (typeof window !== 'undefined') {
  window.DC_CATALOG = DC_CATALOG;
  window.DC_CATEGORIES = DC_CATEGORIES;
  window.DC_STORE_CONFIG = DC_STORE_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    catalog: DC_CATALOG,
    categories: DC_CATEGORIES,
    storeConfig: DC_STORE_CONFIG
  };
}
