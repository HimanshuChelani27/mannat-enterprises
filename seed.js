const db = require('./database');

// Helper to create slugs
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

function ensureUniqueSlug(slug) {
  let finalSlug = slug;
  let counter = 1;
  while (db.prepare('SELECT id FROM products WHERE slug = ?').get(finalSlug)) {
    finalSlug = slug + '-' + counter++;
  }
  return finalSlug;
}

// Clear existing data
db.exec('DELETE FROM custom_attributes');
db.exec('DELETE FROM product_images');
db.exec('DELETE FROM products');
db.exec('DELETE FROM subcategories');
db.exec('DELETE FROM categories');

console.log('Cleared existing data...');

// ===== CATEGORIES =====
const insertCat = db.prepare('INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?)');
const insertSubcat = db.prepare('INSERT INTO subcategories (name, slug, category_id, display_order) VALUES (?, ?, ?, ?)');
const insertProduct = db.prepare(`
  INSERT INTO products (name, slug, category_id, subcategory_id, description, brand, price, price_unit, size, finish, material, color, weight, in_stock, featured)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
`);
const insertAttr = db.prepare('INSERT INTO custom_attributes (product_id, attr_name, attr_value) VALUES (?, ?, ?)');

// Create categories
const cat1 = insertCat.run('PTMT Fittings', 'ptmt-fittings', 1).lastInsertRowid;
const cat2 = insertCat.run('Sanitary Ware', 'sanitary-ware', 2).lastInsertRowid;
const cat3 = insertCat.run('Tiles Patti', 'tiles-patti', 3).lastInsertRowid;
const cat4 = insertCat.run('Bathroom Accessories', 'bathroom-accessories', 4).lastInsertRowid;
const cat5 = insertCat.run('Table Top Basins', 'table-top-basins', 5).lastInsertRowid;
const cat6 = insertCat.run('Poster Tiles', 'poster-tiles', 6).lastInsertRowid;

console.log('Categories created...');

// ===== SUBCATEGORIES =====

// PTMT Fittings subcategories
const sub_nexa = insertSubcat.run('Nexa White Series (15mm)', slugify('nexa-white-series'), cat1, 1).lastInsertRowid;
const sub_mcrystal = insertSubcat.run('M Series Crystal (15mm)', slugify('m-series-crystal'), cat1, 2).lastInsertRowid;
const sub_ludo = insertSubcat.run('Ludo Next Series (15mm)', slugify('ludo-next-series'), cat1, 3).lastInsertRowid;
const sub_cubix = insertSubcat.run('Cubix Series (20mm)', slugify('cubix-series'), cat1, 4).lastInsertRowid;
const sub_shower = insertSubcat.run('Showers & Health Faucets', slugify('showers-health-faucets'), cat1, 5).lastInsertRowid;

// Sanitary Ware subcategories
const sub_pans = insertSubcat.run('Pans (Indian Toilets)', slugify('pans-indian-toilets'), cat2, 1).lastInsertRowid;
const sub_ewc = insertSubcat.run('Water Closets (EWC)', slugify('water-closets-ewc'), cat2, 2).lastInsertRowid;
const sub_floormount = insertSubcat.run('Floormount Closets', slugify('floormount-closets'), cat2, 3).lastInsertRowid;
const sub_halfbasin = insertSubcat.run('Half Single Piece Basins', slugify('half-single-piece-basins'), cat2, 4).lastInsertRowid;
const sub_nanobasin = insertSubcat.run('Nano Wash Basins', slugify('nano-wash-basins'), cat2, 5).lastInsertRowid;
const sub_minibasin = insertSubcat.run('Mini Wash Basins', slugify('mini-wash-basins'), cat2, 6).lastInsertRowid;
const sub_tabletop_safari = insertSubcat.run('Table Top Basins (Safari)', slugify('table-top-basins-safari'), cat2, 7).lastInsertRowid;

// Tiles Patti subcategories
const sub_10mm = insertSubcat.run('10mm Border Strips', slugify('10mm-border-strips'), cat3, 1).lastInsertRowid;
const sub_1inch = insertSubcat.run('1 Inch (20mm) Borders', slugify('1-inch-borders'), cat3, 2).lastInsertRowid;
const sub_sparkle = insertSubcat.run('Sparkle / Glitter Borders', slugify('sparkle-glitter-borders'), cat3, 3).lastInsertRowid;
const sub_2inch = insertSubcat.run('2 Inch Decorative Borders', slugify('2-inch-decorative-borders'), cat3, 4).lastInsertRowid;
const sub_25inch = insertSubcat.run('2.5 Inch Decorative Borders', slugify('25-inch-decorative-borders'), cat3, 5).lastInsertRowid;
const sub_4inch = insertSubcat.run('4 Inch Decorative Borders', slugify('4-inch-decorative-borders'), cat3, 6).lastInsertRowid;

// Bathroom Accessories subcategories
const sub_drainers = insertSubcat.run('Drainers & Jalis', slugify('drainers-jalis'), cat4, 1).lastInsertRowid;
const sub_health_faucet = insertSubcat.run('Health Faucets', slugify('health-faucets-acc'), cat4, 2).lastInsertRowid;
const sub_overheadshower = insertSubcat.run('Overhead Showers', slugify('overhead-showers'), cat4, 3).lastInsertRowid;
const sub_700series = insertSubcat.run('700 Series (Premium)', slugify('700-series-premium'), cat4, 4).lastInsertRowid;
const sub_800series = insertSubcat.run('800 Series', slugify('800-series'), cat4, 5).lastInsertRowid;
const sub_600series = insertSubcat.run('600 Series', slugify('600-series'), cat4, 6).lastInsertRowid;
const sub_500series = insertSubcat.run('500 Series', slugify('500-series'), cat4, 7).lastInsertRowid;
const sub_allied = insertSubcat.run('Allied / Plumbing Accessories', slugify('allied-plumbing-acc'), cat4, 8).lastInsertRowid;
const sub_shelves = insertSubcat.run('Shelves & Corners', slugify('shelves-corners'), cat4, 9).lastInsertRowid;

// Table Top Basins subcategories
const sub_glossy = insertSubcat.run('Glossy Basins', slugify('glossy-basins'), cat5, 1).lastInsertRowid;
const sub_matte = insertSubcat.run('Matte Basins', slugify('matte-basins'), cat5, 2).lastInsertRowid;
const sub_premium = insertSubcat.run('Premium / Gold Finish', slugify('premium-gold-finish'), cat5, 3).lastInsertRowid;

// Poster Tiles subcategories
const sub_2x2 = insertSubcat.run('2x2 Feet Tiles', slugify('2x2-feet-tiles'), cat6, 1).lastInsertRowid;
const sub_2x3 = insertSubcat.run('2x3 Feet Tiles', slugify('2x3-feet-tiles'), cat6, 2).lastInsertRowid;
const sub_2x4 = insertSubcat.run('2x4 Feet Tiles', slugify('2x4-feet-tiles'), cat6, 3).lastInsertRowid;

console.log('Subcategories created...');

// ===== PRODUCTS =====
function addProduct(name, catId, subcatId, opts = {}) {
  const slug = ensureUniqueSlug(slugify(name));
  const result = insertProduct.run(
    name, slug, catId, subcatId || null,
    opts.description || '', opts.brand || '', opts.price || null,
    opts.price_unit || 'per piece', opts.size || '', opts.finish || '',
    opts.material || '', opts.color || '', opts.weight || '',
    opts.featured ? 1 : 0
  );
  const pid = result.lastInsertRowid;
  if (opts.attrs) {
    opts.attrs.forEach(([k, v]) => insertAttr.run(pid, k, v));
  }
  return pid;
}

// ========================================
// 1. PTMT FITTINGS - NEXA WHITE SERIES
// ========================================
addProduct('Bib Cock with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 920, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW001'], ['Packing', '24 Pcs / 216 Pcs']] });
addProduct('Bib Cock Long Body with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 920, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW002']] });
addProduct('Angle Cock with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW003'], ['Packing', '48 Pcs / 288 Pcs']] });
addProduct('Pillar Cock - Nexa White', cat1, sub_nexa, { brand: 'Zitap', material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW004']] });
addProduct('2 in 1 Bib Cock with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 450, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW005']] });
addProduct('2 Way Angle Cock with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 650, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW006']] });
addProduct('Mini Sink Cock with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 550, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW007']] });
addProduct('Swan Neck (T/M) with Flange - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 650, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW008']] });
addProduct('Wall Mixer with L-Bend - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 2250, material: 'PTMT', size: '15mm', color: 'White', featured: true, attrs: [['Cat No', 'NW009']] });
addProduct('Sink Mixer - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 1650, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW010']] });
addProduct('Bibcock Foam Flow - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 225, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW011']] });
addProduct('Nozzle Bibcock with Flange (Adjustable) - Nexa White', cat1, sub_nexa, { brand: 'Zitap', price: 260, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'NW012']] });

// ========================================
// M SERIES CRYSTAL
// ========================================
addProduct('Bib Cock with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 190, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC101'], ['Warranty', '3 Years']] });
addProduct('Bib Cock Long Body with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 225, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC102']] });
addProduct('Angle Cock with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 180, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC103']] });
addProduct('Pillar Cock - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 280, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC104']] });
addProduct('2 in 1 Bib Cock with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 400, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC105']] });
addProduct('2 Way Angle Cock with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 450, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC106']] });
addProduct('Mini Sink Cock with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 540, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC107']] });
addProduct('Swan Neck (T/M) with Flange - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 550, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC108']] });
addProduct('Bibcock Foam Flow - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 200, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC111']] });
addProduct('Nozzle Bibcock with Flange (Adjustable) - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 225, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'MC115']] });
addProduct('Wall Mixer - M Crystal', cat1, sub_mcrystal, { brand: 'Zitap', price: 2250, material: 'PTMT', size: '15mm', featured: true, attrs: [['Warranty', '3 Years']] });

// ========================================
// LUDO NEXT SERIES
// ========================================
addProduct('Bib Cock with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 280, material: 'PTMT', size: '15mm', color: 'White', attrs: [['Cat No', 'LN002']] });
addProduct('Bib Cock Long Body with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 330, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN001']] });
addProduct('Angle Cock with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 250, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN003']] });
addProduct('Pillar Cock - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 380, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN004']] });
addProduct('2 in 1 Bib Cock with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 525, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN005']] });
addProduct('2 Way Angle Cock with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 485, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN006']] });
addProduct('Sink Cock with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 600, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN007']] });
addProduct('Swan Neck (T/M) with Flange - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 650, material: 'PTMT', size: '15mm', attrs: [['Cat No', 'LN008']] });
addProduct('Wall Mixer with L-Bend - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 2500, material: 'PTMT', size: '20mm', featured: true, attrs: [['Cat No', 'EN4209']] });
addProduct('Sink Mixer - Ludo Next', cat1, sub_ludo, { brand: 'Zitap', price: 1650, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'EN4213']] });

// ========================================
// CUBIX SERIES (20mm)
// ========================================
addProduct('Bib Cock with Flange - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 400, material: 'PTMT', size: '20mm', color: 'Cream/White', attrs: [['Cat No', 'QN001']] });
addProduct('Bib Cock Long Body with Flange - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 475, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN0011']] });
addProduct('Angle Cock with Flange - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 334, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN003']] });
addProduct('Pillar Cock (45/90 Degree) - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 500, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN01A/QN01B']] });
addProduct('2 in 1 Bib Cock with Flange - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 570, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN005']] });
addProduct('2 Way Angle Cock with Flange - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 725, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN006A']] });
addProduct('Sink Cock with Flange - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 715, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN007']] });
addProduct('Swan Neck - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 770, material: 'PTMT', size: '20mm', attrs: [['Cat No', 'QN008']] });
addProduct('Wall Mixer with L-Bend - Cubix', cat1, sub_cubix, { brand: 'Zitap', price: 2500, material: 'PTMT', size: '20mm', featured: true, attrs: [['Cat No', 'QN009']] });

// ========================================
// SHOWERS & HEALTH FAUCETS
// ========================================
addProduct('AQUA Shower 5" with Arm & Flange', cat1, sub_shower, { brand: 'Zitap', price: 450, material: 'PTMT', size: '5 inch', attrs: [['Cat No', 'ABSW01'], ['Warranty', '3 Years']] });
addProduct('NOVA Shower 5" with Arm & Flange', cat1, sub_shower, { brand: 'Zitap', price: 575, material: 'PTMT', size: '5 inch', attrs: [['Cat No', 'NBSW01']] });
addProduct('ALPHA Shower 5" with Arm & Flange', cat1, sub_shower, { brand: 'Zitap', price: 575, material: 'PTMT', size: '5 inch' });
addProduct('ELITE 5 Inch Shower', cat1, sub_shower, { brand: 'Zitap', price: 499, material: 'PTMT', size: '5 inch', attrs: [['Cat No', 'EBSW04']] });
addProduct('EXPERT FLAT 5 Inch Shower', cat1, sub_shower, { brand: 'Zitap', price: 525, material: 'PTMT', size: '5 inch', attrs: [['Cat No', 'EBSW05']] });
addProduct('NEO BLUE Health Faucet (1 Mtr)', cat1, sub_shower, { brand: 'Zitap', price: 435, material: 'PTMT', attrs: [['Cat No', 'NBHF01'], ['Tube Length', '1 Meter']] });
addProduct('NEO BLUE Health Faucet (1.5 Mtr)', cat1, sub_shower, { brand: 'Zitap', price: 550, material: 'PTMT', attrs: [['Cat No', 'NBHF01'], ['Tube Length', '1.5 Meter']] });
addProduct('PRIME BLUE Health Faucet (1 Mtr)', cat1, sub_shower, { brand: 'Zitap', price: 500, material: 'PTMT', attrs: [['Cat No', 'PBHF02']] });
addProduct('PRIME BLUE Health Faucet (1.5 Mtr)', cat1, sub_shower, { brand: 'Zitap', price: 580, material: 'PTMT' });
addProduct('ICON Health Faucet (1 Mtr)', cat1, sub_shower, { brand: 'Zitap', price: 410, material: 'PTMT', attrs: [['Cat No', 'XWH01']] });
addProduct('GALAXY BLUE Hand Shower (1 Mtr)', cat1, sub_shower, { brand: 'Zitap', price: 500, material: 'PTMT', attrs: [['Cat No', 'GBHS05']] });
addProduct('REPID Floor Grating', cat1, sub_shower, { brand: 'Zitap', price: 180, material: 'PTMT', attrs: [['Cat No', 'RPFG01']] });

console.log('PTMT Fittings added...');

// ========================================
// 2. SANITARY WARE - SAFARI
// ========================================
addProduct('ORISSA PAN 20"', cat2, sub_pans, { brand: 'Safari', price: 1733, material: 'Ceramic', size: '515x415x240mm (20"x17")', weight: '14 Kg', color: 'White/Ivory/Pink/Brown/Blue', featured: true });
addProduct('CITY PAN 20"', cat2, sub_pans, { brand: 'Safari', price: 1733, material: 'Ceramic', size: '515x420x200mm (20"x17")', weight: '13 Kg' });
addProduct('ORISSA PAN 23"', cat2, sub_pans, { brand: 'Safari', price: 2199, material: 'Ceramic', size: '590x470x305mm (23"x19")', weight: '18 Kg' });
addProduct('RIMLESS ORISSA PAN 20"', cat2, sub_pans, { brand: 'Safari', price: 2199, material: 'Ceramic', size: '520x425x250mm (20")', weight: '14 Kg', description: 'Rimless design' });
addProduct('AQUA PAN 23"', cat2, sub_pans, { brand: 'Safari', price: 2599, material: 'Ceramic', size: '590x445x285mm (23"x18")', weight: '16 Kg' });
addProduct('CITY PAN 23"', cat2, sub_pans, { brand: 'Safari', price: 2599, material: 'Ceramic', size: '605x435x205mm (23"x17")', weight: '16 Kg' });
addProduct('RIMLESS ORISSA PAN 23"', cat2, sub_pans, { brand: 'Safari', price: 2599, material: 'Ceramic', size: '605x455x285mm (23")', weight: '18 Kg', description: 'Rimless design' });

addProduct('CONCEALED EWC-S', cat2, sub_ewc, { brand: 'Safari', price: 3666, material: 'Ceramic', size: '540x370x410mm', weight: '19 Kg', description: 'Concealed type, S-Trap', featured: true });
addProduct('EWC-S (S-Trap)', cat2, sub_ewc, { brand: 'Safari', price: 2666, material: 'Ceramic', size: '530x375x420mm', weight: '16 Kg' });
addProduct('EWC-P (P-Trap)', cat2, sub_ewc, { brand: 'Safari', price: 2666, material: 'Ceramic', size: '555x380x405mm', weight: '16 Kg' });
addProduct('ANGLO INDIAN-S (S-Trap)', cat2, sub_ewc, { brand: 'Safari', price: 4666, material: 'Ceramic', size: '600x475x395mm', weight: '20 Kg' });
addProduct('ANGLO INDIAN-P (P-Trap)', cat2, sub_ewc, { brand: 'Safari', price: 4666, material: 'Ceramic', size: '590x475x400mm', weight: '20 Kg' });

addProduct('ORIENT EWC S&P - Floormount', cat2, sub_floormount, { brand: 'Safari', price: 8333, material: 'Ceramic', size: '535x350x400mm', weight: '29 Kg', description: 'Back to wall, S-Trap 100mm, P-Trap 180mm, Soft Close Seat Cover', featured: true });
addProduct('OZON EWC S&P - Floormount Rimless', cat2, sub_floormount, { brand: 'Safari', price: 8333, material: 'Ceramic', size: '540x360x400mm', weight: '32 Kg', description: 'Rimless design, Soft Close Seat Cover' });

addProduct('BERLIN Half Single Piece Basin', cat2, sub_halfbasin, { brand: 'Lomza', price: 3333, material: 'Ceramic', size: '455x410x295mm (18"x16")', weight: '15 Kg' });
addProduct('KUBICA Half Single Piece Basin', cat2, sub_halfbasin, { brand: 'Safari', price: 3333, material: 'Ceramic', size: '415x405x295mm (16"x16")', weight: '14 Kg' });
addProduct('SACMI Half Single Piece Basin', cat2, sub_halfbasin, { brand: 'Safari', price: 3333, material: 'Ceramic', size: '415x375x260mm (16"x15")', weight: '12 Kg' });

addProduct('BABY Nano Wash Basin', cat2, sub_nanobasin, { brand: 'Safari', price: 1266, material: 'Ceramic', size: '360x245x140mm (14"x9")', weight: '6 Kg' });
addProduct('CIPLA Nano Wash Basin', cat2, sub_nanobasin, { brand: 'Safari', price: 1266, material: 'Ceramic', size: '415x240x120mm (16"x10")', weight: '6 Kg' });
addProduct('MATIZ Nano Wash Basin', cat2, sub_nanobasin, { brand: 'Lomza', price: 1266, material: 'Ceramic', size: '270x315x120mm (11"x12")', weight: '7 Kg' });

addProduct('ALIENT Mini Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '460x370x140mm (18"x14")', weight: '11 Kg', color: 'White/Ivory' });
addProduct('AMAY CORNER Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '340x340x155mm (14"x14")', weight: '8 Kg' });
addProduct('NEO Mini Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '450x355x145mm (18"x14")', weight: '10 Kg', color: 'White/Ivory' });
addProduct('SMALL CORNER Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '350x350x130mm (12"x12")', weight: '6 Kg' });
addProduct('SPIRIT Mini Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '415x335x130mm (17"x13")', weight: '10 Kg' });
addProduct('STAR Mini Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '460x315x175mm (18"x12")', weight: '9 Kg', color: 'White/Ivory/Pink/Brown/Blue' });
addProduct('ANGEL Corner Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '420x420x155mm (16"x16")', weight: '8 Kg' });
addProduct('DOLLY Mini Wash Basin', cat2, sub_minibasin, { brand: 'Safari', price: 1533, material: 'Ceramic', size: '450x330x160mm (18"x13")', weight: '10 Kg' });

addProduct('ECCO Table Top Basin (Slim Rim)', cat2, sub_tabletop_safari, { brand: 'Safari', price: 3666, material: 'Ceramic', size: '450x325x155mm (18"x13")', weight: '11 Kg', featured: true });
addProduct('GRACY Table Top Basin', cat2, sub_tabletop_safari, { brand: 'Safari', price: 4999, material: 'Ceramic', size: '560x365x160mm (22"x14")', weight: '10 Kg' });
addProduct('APPLE Table Top Basin (Slim Rim)', cat2, sub_tabletop_safari, { brand: 'Safari', price: 3666, material: 'Ceramic', size: '500x325x150mm (20"x13")', weight: '11 Kg' });
addProduct('CASIO Table Top Basin', cat2, sub_tabletop_safari, { brand: 'Safari', price: 3666, material: 'Ceramic', size: '410x315x135mm (16"x12")', weight: '8 Kg' });

console.log('Sanitary Ware added...');

// ========================================
// 3. TILES PATTI - BORDER STRIPS
// ========================================
// 10mm borders
['Gold (G-21)', 'Silver (S-21)', 'Copper (C-21)'].forEach(c => {
  addProduct(`10mm Round Border Strip - ${c.split(' (')[0]}`, cat3, sub_10mm, { size: '10x600mm', finish: 'Round Profile', color: c.split(' (')[0], attrs: [['Code', c.split('(')[1]?.replace(')', '') || '']] });
});
['Gold (G-22)', 'Silver (S-22)', 'Copper (C-22)', 'Black (DI-22 B)'].forEach(c => {
  addProduct(`10mm Flat Border Strip - ${c.split(' (')[0]}`, cat3, sub_10mm, { size: '10x600mm', finish: 'Flat Profile', color: c.split(' (')[0], attrs: [['Code', c.split('(')[1]?.replace(')', '') || '']] });
});

// Sparkle borders
['Copper', 'Gold', 'Violet', 'Pink', 'Dark Blue', 'Sparkle', 'Black Sparkle', 'Cyan', 'Red', 'Green', 'Silver'].forEach(c => {
  addProduct(`10mm Sparkle Glitter Border - ${c}`, cat3, sub_sparkle, { size: '10x600mm', finish: 'Sparkle/Glitter', color: c });
});

// 1 inch borders - sample designs
addProduct('1 Inch Gold Flat Border Strip', cat3, sub_1inch, { size: '20x600mm', color: 'Gold', attrs: [['Code', 'G-14']] });
addProduct('1 Inch Silver Flat Border Strip', cat3, sub_1inch, { size: '20x600mm', color: 'Silver', attrs: [['Code', 'S-14']] });
addProduct('1 Inch Black Glossy Full Body Border', cat3, sub_1inch, { size: '20x600mm', color: 'Black', finish: 'Glossy', attrs: [['Code', '14-B']] });
addProduct('1 Inch Shakkarpada Design - Red Gold', cat3, sub_1inch, { size: '20mm', color: 'Red Gold', finish: 'Shakkarpada Design', attrs: [['Code', 'G-109-RED']] });
addProduct('1 Inch Shakkarpada Design - Black Gold', cat3, sub_1inch, { size: '20mm', color: 'Black Gold', finish: 'Shakkarpada Design', attrs: [['Code', 'G-113-BLACK']] });
addProduct('1 Inch Greek Key Border - Silver', cat3, sub_1inch, { size: '20mm', color: 'Silver', finish: 'Greek Key Pattern', attrs: [['Code', 'SL-23101']] });
addProduct('1 Inch Greek Key Border - Gold', cat3, sub_1inch, { size: '20mm', color: 'Gold', finish: 'Greek Key Pattern', attrs: [['Code', 'GL-23102']] });
addProduct('1 Inch CUT Checkered - Black White', cat3, sub_1inch, { size: '1 inch', color: 'Black & White', finish: 'CUT Design', attrs: [['Code', '128-B.W.']] });
addProduct('1 Inch CUT Rope Twist - Gold', cat3, sub_1inch, { size: '1 inch', color: 'Gold', finish: 'CUT Rope Design', attrs: [['Code', '31-G']] });
addProduct('1 Inch CUT Triangle - Gold', cat3, sub_1inch, { size: '1 inch', color: 'Gold', finish: 'CUT Triangle', attrs: [['Code', '77-G']] });
addProduct('1 Inch PUNCH Square Stud - Gold', cat3, sub_1inch, { size: '1 inch', color: 'Gold', finish: 'PUNCH Design', attrs: [['Code', '48-G']] });

// 2 inch borders
const twoInchDesigns = [
  ['Floral Scroll - Red Gold', '201'], ['Floral Scroll - Black Gold', '203'], ['Floral Scroll - White Gold', '205'],
  ['Leaf Vine - White Gold', '501'], ['Leaf Vine - Black Gold', '503'], ['Leaf Vine - Blue Gold', '507'],
  ['Wave Pattern - White Silver', 'SL-326'], ['Wave Pattern - White Gold', 'GL-325'], ['Wave Pattern - Black Gold', 'GL-323'],
  ['Diamond Floral - White Gold', 'GL-315'], ['Diamond Floral - Black Gold', 'GL-313'], ['Diamond Floral - Red Gold', 'GL-311'],
  ['Paisley Swirl - White Gold', 'GL-335'], ['Paisley Swirl - Black Gold', 'GL-333'],
  ['Circular Scroll - Red Gold', '121'], ['Circular Scroll - Black Gold', '123'], ['Circular Scroll - White Gold', '125'],
  ['3D Stud Pattern - Red Gold', '221'], ['3D Stud Pattern - Black Gold', '223'], ['3D Stud Pattern - White Gold', '225'],
];
twoInchDesigns.forEach(([name, code]) => {
  addProduct(`2 Inch Border - ${name}`, cat3, sub_2inch, { size: '2 inch (24" length)', color: name.split(' - ')[1], finish: name.split(' - ')[0], attrs: [['Code', code]] });
});

// 2.5 inch borders
const twoHalfDesigns = [
  ['Kundan Mosaic Diamond', '181', 'Gold Multicolor'], ['Kundan Mosaic Diamond', '182', 'Gold Cream'],
  ['Ornate Floral - White Gold', 'GL-257'], ['Ornate Floral - Black Gold', 'GL-255'], ['Ornate Floral - Blue Gold', 'GL-263'],
  ['Wave Scroll - White Gold', 'GL-241'], ['Wave Scroll - Black Gold', 'GL-237'],
  ['Chain Paisley - White Gold', 'GL-235'], ['Chain Paisley - Black Gold', 'GL-231'],
  ['Cross Floral - White Gold', 'GL-229'], ['Cross Floral - Black Gold', 'GL-225'],
  ['Gold Square Studs - White', 'G-401-WHITE'], ['Gold Square Studs - Black', 'G-403-BLACK'],
];
twoHalfDesigns.forEach(([name, code, color]) => {
  addProduct(`2.5 Inch Border - ${name}`, cat3, sub_25inch, { size: '2.5 inch (24" length)', color: color || name.split(' - ')[1] || '', finish: name.split(' - ')[0], attrs: [['Code', code]] });
});

// 4 inch borders
['Brown Silver', 'White Silver', 'Black Silver', 'Brown Gold', 'White Gold', 'Blue Gold', 'Blue Silver', 'Red Gold', 'Red Silver'].forEach((color, i) => {
  addProduct(`4 Inch Well Floral Scroll Border - ${color}`, cat3, sub_4inch, { size: '4 inch (24" length)', color, finish: 'Well Floral Scroll', attrs: [['Code', (401 + i).toString()]] });
});

// 24"x2" Golden & Silver Tiles
addProduct('Om Symbol Repeating Border - White Gold', cat3, sub_2inch, { size: '600x50mm (24"x2")', color: 'White Gold', finish: 'Om Symbol', attrs: [['Code', '20193-W']] });
addProduct('Swastik Symbol Repeating Border - White Gold', cat3, sub_2inch, { size: '600x50mm (24"x2")', color: 'White Gold', finish: 'Swastik Symbol', attrs: [['Code', '20197-W']] });

console.log('Tiles Patti added...');

// ========================================
// 4. BATHROOM ACCESSORIES - AHUJA
// ========================================
// Health Faucets
addProduct('ABS Square Health Faucet with 1 Mtr Tube & Stand', cat4, sub_health_faucet, { brand: 'Ahuja', price: 465, material: 'ABS', attrs: [['Code', '356']] });
addProduct('Health Faucet Brass with 1 Mtr Tube & Stand', cat4, sub_health_faucet, { brand: 'Ahuja', price: 610, material: 'Brass', attrs: [['Code', '353']] });
addProduct('Health Faucet ABS with 1 Mtr Tube & Stand', cat4, sub_health_faucet, { brand: 'Ahuja', price: 425, material: 'ABS', attrs: [['Code', '354']] });
addProduct('Health Faucet Premium Brass with 1 Mtr Tube & Stand', cat4, sub_health_faucet, { brand: 'Ahuja', price: 745, material: 'Brass', attrs: [['Code', '358']] });
addProduct('Hand Shower Square with 1.5 Mtr Tube & Stand', cat4, sub_health_faucet, { brand: 'Ahuja', price: 645, attrs: [['Code', '333']] });
addProduct('Hand Shower Round with 1.5 Mtr Tube & Stand', cat4, sub_health_faucet, { brand: 'Ahuja', price: 590, attrs: [['Code', '331']] });
addProduct('Jet Spray Multi 1 Meter', cat4, sub_health_faucet, { brand: 'Ahuja', price: 150, size: '1 Meter', attrs: [['Code', '447-1M']] });
addProduct('Jet Spray Multi 1.5 Meter', cat4, sub_health_faucet, { brand: 'Ahuja', price: 175, size: '1.5 Meter', attrs: [['Code', '447-1.5M']] });

// Overhead Showers
addProduct('Ultra Slim Shower 4x4', cat4, sub_overheadshower, { brand: 'Ahuja', price: 260, size: '4x4 inch' });
addProduct('Ultra Slim Shower 6x6', cat4, sub_overheadshower, { brand: 'Ahuja', price: 350, size: '6x6 inch' });
addProduct('Ultra Slim Shower 8x8', cat4, sub_overheadshower, { brand: 'Ahuja', price: 510, size: '8x8 inch' });
addProduct('Sandwich Shower 4x4', cat4, sub_overheadshower, { brand: 'Ahuja', price: 325, size: '4x4 inch', attrs: [['Code', '301']] });
addProduct('Sandwich Shower 6x6', cat4, sub_overheadshower, { brand: 'Ahuja', price: 420, size: '6x6 inch', attrs: [['Code', '301']] });
addProduct('Sandwich Shower 8x8', cat4, sub_overheadshower, { brand: 'Ahuja', price: 585, size: '8x8 inch', attrs: [['Code', '301']] });
addProduct('Shower ABS 4x4', cat4, sub_overheadshower, { brand: 'Ahuja', price: 170, size: '4x4 inch', material: 'ABS', attrs: [['Code', '304']] });
addProduct('Curve Shower 4x4', cat4, sub_overheadshower, { brand: 'Ahuja', price: 530, size: '4x4 inch', attrs: [['Code', '318']] });
addProduct('Curve Shower 6x6', cat4, sub_overheadshower, { brand: 'Ahuja', price: 805, size: '6x6 inch', attrs: [['Code', '318']] });
addProduct('Curve Shower 8x8', cat4, sub_overheadshower, { brand: 'Ahuja', price: 1060, size: '8x8 inch', attrs: [['Code', '318']] });

// Drainers & Jalis
addProduct('Floor Trap 6x6 SS304', cat4, sub_drainers, { brand: 'Ahuja', price: 350, material: 'SS 304 Stainless Steel', size: '6x6 inch', attrs: [['Code', '1016']] });
addProduct('Frame Jali 6x6 SS304', cat4, sub_drainers, { brand: 'Ahuja', price: 316, material: 'SS 304 Stainless Steel', size: '6x6 inch', attrs: [['Code', '1017']] });
addProduct('Lock Jali Round 5"', cat4, sub_drainers, { brand: 'Ahuja', price: 60, material: 'Stainless Steel', size: '5 inch' });
addProduct('Square Jali 4"', cat4, sub_drainers, { brand: 'Ahuja', price: 36, material: 'Stainless Steel', size: '4 inch' });
addProduct('Square Jali 5"', cat4, sub_drainers, { brand: 'Ahuja', price: 48, material: 'Stainless Steel', size: '5 inch' });
addProduct('Square Jali 6"', cat4, sub_drainers, { brand: 'Ahuja', price: 61, material: 'Stainless Steel', size: '6 inch' });
addProduct('Square Cockroach Jali 5"', cat4, sub_drainers, { brand: 'Ahuja', price: 200, size: '5 inch', attrs: [['Code', '1011-5']] });
addProduct('Round Jali with Dome 3"', cat4, sub_drainers, { brand: 'Ahuja', price: 200, size: '3 inch' });
addProduct('Round Jali with Dome 4"', cat4, sub_drainers, { brand: 'Ahuja', price: 290, size: '4 inch' });
addProduct('Round Jali with Dome 5"', cat4, sub_drainers, { brand: 'Ahuja', price: 340, size: '5 inch' });
addProduct('Cockroach Trap', cat4, sub_drainers, { brand: 'Ahuja', price: 260, attrs: [['Code', '1020']] });

// 700 Series
addProduct('Soap Dish with Tumbler - 700 Series', cat4, sub_700series, { brand: 'Ahuja', price: 660, attrs: [['Code', '706']] });
addProduct('Double Soap Dish - 700 Series', cat4, sub_700series, { brand: 'Ahuja', price: 540, attrs: [['Code', '707']] });
addProduct('Tumbler Holder - 700 Series', cat4, sub_700series, { brand: 'Ahuja', price: 435, attrs: [['Code', '709']] });
addProduct('Napkin Ring - 700 Series', cat4, sub_700series, { brand: 'Ahuja', price: 360, attrs: [['Code', '703']] });
addProduct('Robe Hook - 700 Series', cat4, sub_700series, { brand: 'Ahuja', price: 185, attrs: [['Code', '705']] });
addProduct('Folding Towel Rack - 700 Series', cat4, sub_700series, { brand: 'Ahuja', price: 1650, attrs: [['Code', '700']], featured: true });

// 800 Series
addProduct('Double Soap Dish - 800 Series', cat4, sub_800series, { brand: 'Ahuja', price: 555, attrs: [['Code', '807']] });
addProduct('Napkin Ring - 800 Series', cat4, sub_800series, { brand: 'Ahuja', price: 353, attrs: [['Code', '803']] });
addProduct('Robe Hook - 800 Series', cat4, sub_800series, { brand: 'Ahuja', price: 190, attrs: [['Code', '805']] });
addProduct('Soap Dish - 800 Series', cat4, sub_800series, { brand: 'Ahuja', price: 315, attrs: [['Code', '808']] });

// 600 Series
addProduct('Soap Dish with Tumbler - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 330, attrs: [['Code', '606']] });
addProduct('Napkin Ring - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 170, attrs: [['Code', '603']] });
addProduct('Tumbler Holder - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 185, attrs: [['Code', '609']] });
addProduct('Soap Dish - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 145, attrs: [['Code', '608']] });
addProduct('Robe Hook - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 85, attrs: [['Code', '605']] });
addProduct('Double Soap Dish - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 285, attrs: [['Code', '607']] });
addProduct('Towel Rod - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 303, attrs: [['Code', '602']] });
addProduct('Towel Rack - 600 Series', cat4, sub_600series, { brand: 'Ahuja', price: 785, attrs: [['Code', '601']] });

// 500 Series
addProduct('Napkin Ring - 500 Series', cat4, sub_500series, { brand: 'Ahuja', price: 180, attrs: [['Code', '504']] });
addProduct('Soap Dish - 500 Series', cat4, sub_500series, { brand: 'Ahuja', price: 163, attrs: [['Code', '508']] });
addProduct('Double Soap Dish - 500 Series', cat4, sub_500series, { brand: 'Ahuja', price: 325, attrs: [['Code', '507']] });
addProduct('Towel Rod - 500 Series', cat4, sub_500series, { brand: 'Ahuja', price: 315, attrs: [['Code', '502']] });
addProduct('Towel Rack - 500 Series', cat4, sub_500series, { brand: 'Ahuja', price: 785, attrs: [['Code', '501']] });

// Allied
addProduct('Spreader', cat4, sub_allied, { brand: 'Ahuja', price: 370, attrs: [['Code', '468']] });
addProduct('Basin Bolt', cat4, sub_allied, { brand: 'Ahuja', price: 85, attrs: [['Code', '482']] });
addProduct('L Bend (Wall Mixer)', cat4, sub_allied, { brand: 'Ahuja', price: 380, material: 'Brass', attrs: [['Code', '434']] });
addProduct('Hex Nipple 15mm', cat4, sub_allied, { brand: 'Ahuja', price: 55, size: '15mm', attrs: [['Code', '465']] });
addProduct('Wall Mixer Leg', cat4, sub_allied, { brand: 'Ahuja', price: 375, material: 'Brass', attrs: [['Code', '435']] });
addProduct('Bottle Trap', cat4, sub_allied, { brand: 'Ahuja', price: 1045, material: 'Brass', attrs: [['Code', '453']] });
addProduct('SS Flange Round', cat4, sub_allied, { brand: 'Ahuja', price: 18, material: 'Stainless Steel', attrs: [['Code', '431']] });
addProduct('SS Flange Square', cat4, sub_allied, { brand: 'Ahuja', price: 40, material: 'Stainless Steel', attrs: [['Code', '432']] });
addProduct('Coupling 3"', cat4, sub_allied, { brand: 'Ahuja', price: 210, material: 'Brass', size: '3 inch', attrs: [['Code', '431-3']] });
addProduct('Coupling 5"', cat4, sub_allied, { brand: 'Ahuja', price: 290, material: 'Brass', size: '5 inch', attrs: [['Code', '431-5']] });
addProduct('Bath Spout with Button & Flange', cat4, sub_allied, { brand: 'Ahuja', price: 965, attrs: [['Code', '106']] });
addProduct('Bath Spout with Flange', cat4, sub_allied, { brand: 'Ahuja', price: 520, attrs: [['Code', '103']] });
addProduct('Bath Spout Premium with Flange', cat4, sub_allied, { brand: 'Ahuja', price: 840, attrs: [['Code', '107']] });

// Extension Nipples
[['1"', 37], ['1.5"', 56], ['2"', 74], ['2.5"', 93], ['3"', 110], ['4"', 150], ['5"', 190], ['6"', 220]].forEach(([sz, pr]) => {
  addProduct(`Extension Nipple ${sz}`, cat4, sub_allied, { brand: 'Ahuja', price: pr, material: 'Brass', size: sz, description: 'Fixed Rate, No Discount' });
});

// Shelves
addProduct('Acrylic Shelf 12x6', cat4, sub_shelves, { brand: 'Ahuja', price: 335, material: 'Acrylic', size: '12x6 inch', attrs: [['Code', '921']] });
addProduct('Acrylic Shelf 15x6', cat4, sub_shelves, { brand: 'Ahuja', price: 370, material: 'Acrylic', size: '15x6 inch', attrs: [['Code', '922']] });
addProduct('Acrylic Shelf 8x10', cat4, sub_shelves, { brand: 'Ahuja', price: 340, material: 'Acrylic', size: '8x10 inch', attrs: [['Code', '925']] });
addProduct('Acrylic Corner 8x8', cat4, sub_shelves, { brand: 'Ahuja', price: 275, material: 'Acrylic', size: '8x8 inch', attrs: [['Code', '916']] });
addProduct('Acrylic Corner 10x10', cat4, sub_shelves, { brand: 'Ahuja', price: 330, material: 'Acrylic', size: '10x10 inch', attrs: [['Code', '917']] });
addProduct('Acrylic Corner 12x12', cat4, sub_shelves, { brand: 'Ahuja', price: 395, material: 'Acrylic', size: '12x12 inch', attrs: [['Code', '918']] });

console.log('Bathroom Accessories added...');

// ========================================
// 5. TABLE TOP BASINS (DOC PDF)
// ========================================
const basinProducts = [
  ['OPEL-809 Table Top Basin', sub_glossy, 3000, '495x350x135mm', 'Glossy', 'IN-Glossy, OUT-Matte'],
  ['OPEL-807 Table Top Basin', sub_glossy, 2200, '495x350x135mm', 'Glossy', 'IN-Glossy, OUT-Matte'],
  ['ALPHA-S.023 Table Top Basin', sub_glossy, 3000, '415x310x125mm', 'Glossy', 'IN-Glossy, OUT-Matte'],
  ['ALPHA-S.025 Table Top Basin', sub_glossy, 3200, '415x310x125mm', 'Glossy', ''],
  ['AQUA-1001 Square Basin', sub_glossy, 3000, '400x400x120mm', 'Glossy', ''],
  ['STAR-653 Round Basin', sub_glossy, 3000, '420x420x160mm', 'Glossy', ''],
  ['DREAM WOOD-605 Art Basin', sub_glossy, 3000, '410x410x150mm', 'Glossy', 'Wood Finish Design'],
  ['CLAY-457 Round Basin', sub_glossy, 3000, '400x400x160mm', 'Glossy', ''],
  ['CLAY-461 Round Basin', sub_glossy, 4000, '16x16 inch', 'Glossy', ''],
  ['SUN-107 Round Basin', sub_glossy, 3000, '400x400x160mm', 'Glossy', ''],
  ['SUN-103 Round Basin', sub_glossy, 3000, '400x400x160mm', 'Glossy', ''],
  ['GAMMA-S.008 Basin', sub_glossy, 2800, '400x300x140mm', 'Glossy', 'IN-Glossy, OUT-Glossy'],
  ['GAMMA-S.012 Basin', sub_matte, 2800, '400x300x140mm', 'Matte', 'IN-Matte, OUT-Matte'],
  ['GAMMA-S.014 Basin', sub_matte, 2800, '400x300x140mm', 'Matte', 'IN-Matte, OUT-Matte'],
  ['GAMMA-1151 Basin', sub_matte, 3000, '450x325x145mm', 'Matte', 'IN-Matte, OUT-Matte'],
  ['GAMMA-1153 Basin', sub_glossy, 3000, '400x300x140mm', 'Glossy', ''],
  ['NEO-1051 Basin', sub_matte, 3000, '450x325x130mm', 'Matte', ''],
  ['NEO-1052 Basin', sub_matte, 3000, '450x325x130mm', 'Matte', ''],
  ['NEO-1053 Basin', sub_matte, 3000, '450x325x130mm', 'Matte', ''],
  ['NEO-1055 Basin', sub_glossy, 3000, '450x325x130mm', 'Glossy', ''],
  ['NEO-1056 Basin', sub_glossy, 3000, '450x325x130mm', 'Glossy', 'IN-Glossy, OUT-Matte'],
  ['NEO-1057 Basin', sub_glossy, 3000, '450x325x130mm', 'Glossy', ''],
  ['NEO-1058 Basin', sub_matte, 3000, '450x325x130mm', 'Matte', ''],
  ['NEO-1065 Basin', sub_glossy, 3000, '450x325x130mm', 'Glossy', ''],
  ['NEO-1072 Basin', sub_glossy, 3000, '450x325x130mm', 'Glossy', ''],
  ['BETA-1082 Basin', sub_matte, 3000, '450x325x145mm', 'Matte', ''],
  ['ANTINA 204 Oval Basin', sub_glossy, 3000, '28x15 inch', 'Glossy', ''],
  ['ANTINA 202 Oval Basin', sub_glossy, 3000, '28x15 inch', 'Glossy', ''],
  ['MEGA 305 Round Basin', sub_glossy, 2200, '15x15 inch', 'Glossy', ''],
  ['MEGA 306 Round Basin', sub_glossy, 3200, '15x15 inch', 'Glossy', ''],
  ['SOLO 358 Oval Basin', sub_glossy, 1000, '17x14 inch', 'Glossy', ''],
  ['CORAL 405 Square Basin', sub_glossy, 3000, '14x14 inch', 'Glossy', ''],
  ['CORAL 402 Square Basin', sub_glossy, 3000, '14x14 inch', 'Glossy', ''],
  ['CITIZEN 554 Oval Basin', sub_glossy, 3500, '21x13 inch', 'Glossy', ''],
  ['EVA 702 Square Basin', sub_glossy, 3200, '16x16 inch', 'Glossy', ''],
  ['EVA 705 Square Basin', sub_glossy, 3200, '16x16 inch', 'Glossy', ''],
  ['CANOVA 751 Slim Basin', sub_glossy, 3000, '12x24 inch', 'Glossy', ''],
  ['CANOVA 753 Slim Basin', sub_glossy, 3000, '12x24 inch', 'Glossy', ''],
  ['SLIM 910 Basin', sub_glossy, 3000, '20x14 inch', 'Glossy', ''],
  ['SLIM EM 912 Embossed Basin', sub_glossy, 3800, '20x14 inch', 'Glossy', 'Embossed Design'],
  ['TITANIC-1502 Large Oval Basin', sub_glossy, 3400, '700x380x140mm', 'Glossy', '', true],
  ['RECT EM 1302 Embossed Basin', sub_glossy, 3200, '19x14 inch', 'Glossy', 'Embossed'],
  ['HEXAGON EM 1201 Basin', sub_glossy, 3200, '490x380x130mm', 'Glossy', 'Hexagonal Embossed'],
  ['TORO TOP 02 Basin', sub_glossy, 2800, '460x330x135mm (13x18 inch)', 'Glossy', ''],
  ['TORO TOP 01 Basin', sub_glossy, 2800, '460x330x135mm', 'Glossy', ''],
  ['SHALLOW TOP 01 Basin', sub_glossy, 2800, '330x410x140mm (13x16 inch)', 'Glossy', ''],
  ['CAPSULE TOP 09 Basin', sub_matte, 3400, '500x330x140mm (13x20 inch)', 'Matte', ''],
  ['CAPSULE TOP 02 Basin', sub_glossy, 3400, '500x330x140mm', 'Glossy', ''],
  ['FLORA TOP 09 Basin', sub_glossy, 3200, '480x360x125mm (15x19 inch)', 'Glossy', ''],
  ['BENZ TOP 02 Basin', sub_glossy, 2800, '400x290x125mm (12x16 inch)', 'Glossy', ''],
  ['NINA TOP 04 Basin', sub_glossy, 3600, '500x380x140mm (16x20 inch)', 'Glossy', ''],
  ['OVAL TOP 02 Large Basin', sub_glossy, 4000, '615x385x130mm (16x24 inch)', 'Glossy', ''],
  ['DOLCE TOP 02 Basin', sub_glossy, 2800, '400x300x135mm (12x16 inch)', 'Glossy', ''],
];

basinProducts.forEach(([name, subcatId, price, size, finish, desc, feat]) => {
  addProduct(name, cat5, subcatId, { brand: 'Lifon Sanitary', price, material: 'Ceramic', size, finish, description: desc || '', featured: feat ? true : false });
});

// Premium / Gold Finish
addProduct('IMP 65 Gold Finish Basin', cat5, sub_premium, { brand: 'Lifon Sanitary', price: 4400, material: 'Ceramic', size: '455x320x135mm', finish: 'Metallic Gold', featured: true });
addProduct('IMP 24 Gold Finish Basin', cat5, sub_premium, { brand: 'Lifon Sanitary', price: 4400, material: 'Ceramic', size: '410x340x145mm', finish: 'Metallic Gold' });
addProduct('IMP 19 Gold Finish Basin', cat5, sub_premium, { brand: 'Lifon Sanitary', price: 4400, material: 'Ceramic', size: '405x405x180mm', finish: 'Metallic Gold' });
addProduct('TOP 1011 Gold White Basin', cat5, sub_premium, { brand: 'Lifon Sanitary', price: 4400, material: 'Ceramic', size: '460x330x135mm', finish: 'Gold/White Decorative' });
addProduct('TOP 1006 Gold White Basin', cat5, sub_premium, { brand: 'Lifon Sanitary', price: 4400, material: 'Ceramic', size: '460x330x135mm', finish: 'Gold/White Decorative' });
addProduct('TOP 1009 Gold White Basin', cat5, sub_premium, { brand: 'Lifon Sanitary', price: 4400, material: 'Ceramic', size: '460x330x135mm', finish: 'Gold/White Decorative' });

console.log('Table Top Basins added...');

// ========================================
// 6. POSTER TILES
// ========================================
const posterTiles2x2 = [
  ['Sai Baba', 'SG-647'], ['Khatu Shyam Ji', 'SG-690'], ['Lakshmi-Saraswati-Ganesh', 'SG-626'],
  ['Goddess Lakshmi', 'SG-624'], ['Dr. B.R. Ambedkar', 'SG-651'], ['Chhatrapati Shivaji Maharaj', 'SG-637'],
  ['Panchmukhi Hanuman', 'SG-619'], ['Hanuman Ji', 'SG-618'], ['Krishna & Sudama', 'SG-617'],
  ['Lord Shiva', 'SG-616'], ['Shiv Parivar', 'SG-614'], ['Radha Krishna with Cow', 'SG-611'],
  ['Radha Krishna', 'SG-609'], ['Radha Krishna Close-up', 'SG-608'], ['Ganesh Ji (Throne)', 'SG-603'],
  ['Ganesh Ji (Lotus)', 'SG-606'], ['Ganesh Ji (Modern Art)', 'SG-604'], ['Ganesh Ji (Diyas)', 'SG-601'],
  ['Kamdhenu Cow & Calf', 'SG-633'], ['Ram Darbar', 'SG-627'], ['Tirupati Balaji', 'SG-630'],
];

posterTiles2x2.forEach(([name, code]) => {
  addProduct(`${name} - 2x2 Poster Tile`, cat6, sub_2x2, { material: 'Ceramic (Printed)', size: '2x2 feet', description: `Decorative poster tile - ${name}`, attrs: [['Code', code]] });
});

const posterTiles2x3 = [
  ['Ganesh Ji Golden', 'SS-188'], ['Ganesh Ji Dagdusheth', 'SS-201'], ['Ganesh Ji Modern Art', 'SS-242'],
  ['Radha Krishna', 'SS-6'], ['Radha Krishna with Cow', 'SS-246'], ['Bal Krishna', 'SS-19'],
  ['Lakshmi-Saraswati-Ganesh', 'SS-62'], ['Goddess Lakshmi', 'SS-221'], ['Panchmukhi Hanuman', 'SS-50'],
  ['Hanuman Ji', 'SS-56'], ['Lord Buddha', 'SS-88'], ['Radha Krishna Blue Frame', 'SS-208'],
  ['Lord Dattatreya', 'SS-289'], ['Vitthal Panduranga', 'SS-293'], ['Vitthal & Rukmini', 'SS-294'],
  ['Ram Lalla Ayodhya', 'SS-527'], ['Shiv Parivar', 'SS-42'], ['Lakshmi Green Sari', 'SS-46'],
  ['Ram Darbar', 'SS-171'], ['Ganesh Ji Ornate', 'SS-167'], ['Ganesh Ji Turban', 'SS-132'],
  ['Ganesh Ji Traditional', 'SS-4'], ['Dr. Ambedkar Parliament', 'SS-328'], ['Dr. Ambedkar Maroon', 'SS-410'],
  ['Shiv Parivar Om', 'SS-170'], ['Kamdhenu Cow & Calf', 'SS-352'], ['Ram Darbar Golden', 'SS-48'],
  ['Seven Running Horses', 'SS-101'], ['Maharana Pratap on Horse', 'SS-530'],
  ['Shivaji Maharaj with Seal', 'SS-531'], ['Shivaji Coronation', 'SS-216'],
  ['Raja Shiv Chhatrapati', 'SS-67'], ['Shivaji Court Darbar', 'SS-222'], ['Shivaji on Horseback', 'SS-258'],
];

posterTiles2x3.forEach(([name, code]) => {
  addProduct(`${name} - 2x3 Poster Tile`, cat6, sub_2x3, { material: 'Ceramic (Printed)', size: '2x3 feet', description: `Decorative poster tile - ${name}`, attrs: [['Code', code]] });
});

const posterTiles2x4 = [
  ['Shivaji Coronation', 'HG-12017'], ['Shivaji Maharaj Orange', 'HG-12016'], ['Shivaji Maharaj White', 'HG-12015'],
  ['Ganesh Ji Red Blue', 'HG-12003'], ['Ganesh Ji Teal', 'HG-12004'], ['Radha Krishna Flute', 'HG-12007'],
  ['Kitchen Tile Vegetables', 'HG-12039'], ['Kitchen Tile Fruits', 'HG-12038'],
  ['Kitchen Tile Tea Set', 'HG-12037'], ['Kitchen Tile Coffee', 'HG-12036'],
];

posterTiles2x4.forEach(([name, code]) => {
  addProduct(`${name} - 2x4 Large Panel`, cat6, sub_2x4, { material: 'Ceramic (Printed)', size: '2x4 feet', description: `Large format decorative panel - ${name}`, featured: code === 'HG-12007', attrs: [['Code', code]] });
});

console.log('Poster Tiles added...');

// ===== FINAL COUNT =====
const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
const totalSubcategories = db.prepare('SELECT COUNT(*) as count FROM subcategories').get().count;
const totalAttrs = db.prepare('SELECT COUNT(*) as count FROM custom_attributes').get().count;

console.log('\n===== SEED COMPLETE =====');
console.log(`Categories: ${totalCategories}`);
console.log(`Subcategories: ${totalSubcategories}`);
console.log(`Products: ${totalProducts}`);
console.log(`Custom Attributes: ${totalAttrs}`);
console.log('========================\n');
