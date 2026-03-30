const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../database');

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) return next();
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/admin/login');
}

// Login page
router.get('/login', (req, res) => {
  if (req.session && req.session.adminId) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, '..', 'public', 'admin-login.html'));
});

// Login API
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  req.session.adminId = admin.id;
  res.json({ success: true });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Admin dashboard
router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Admin data
router.get('/data/dashboard', requireAuth, (req, res) => {
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const totalSubcategories = db.prepare('SELECT COUNT(*) as count FROM subcategories').get().count;
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const inStock = db.prepare('SELECT COUNT(*) as count FROM products WHERE in_stock = 1').get().count;
  const outOfStock = totalProducts - inStock;
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.display_order, c.name
  `).all();
  res.json({ totalCategories, totalSubcategories, totalProducts, inStock, outOfStock, categories });
});

// ===== CATEGORIES =====
router.get('/data/categories', requireAuth, (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.display_order, c.name
  `).all();
  res.json(categories);
});

router.post('/data/categories', requireAuth, (req, res) => {
  const { name, display_order } = req.body;
  const slug = slugify(name);
  try {
    const result = db.prepare('INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?)').run(name, slug, display_order || 0);
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (e) {
    res.status(400).json({ error: 'Category already exists or invalid data' });
  }
});

router.put('/data/categories/:id', requireAuth, (req, res) => {
  const { name, display_order } = req.body;
  const slug = slugify(name);
  try {
    db.prepare('UPDATE categories SET name = ?, slug = ?, display_order = ? WHERE id = ?').run(name, slug, display_order || 0, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.delete('/data/categories/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== SUBCATEGORIES =====
router.get('/data/subcategories', requireAuth, (req, res) => {
  const categoryId = req.query.category_id;
  let subcategories;
  if (categoryId) {
    subcategories = db.prepare(`
      SELECT s.*, c.name as category_name
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      WHERE s.category_id = ?
      ORDER BY s.display_order, s.name
    `).all(categoryId);
  } else {
    subcategories = db.prepare(`
      SELECT s.*, c.name as category_name
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.display_order, s.name
    `).all();
  }
  res.json(subcategories);
});

router.post('/data/subcategories', requireAuth, (req, res) => {
  const { name, category_id, display_order } = req.body;
  const slug = slugify(name + '-' + category_id);
  try {
    const result = db.prepare('INSERT INTO subcategories (name, slug, category_id, display_order) VALUES (?, ?, ?, ?)').run(name, slug, category_id, display_order || 0);
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (e) {
    res.status(400).json({ error: 'Subcategory already exists or invalid data' });
  }
});

router.put('/data/subcategories/:id', requireAuth, (req, res) => {
  const { name, category_id, display_order } = req.body;
  const slug = slugify(name + '-' + category_id);
  try {
    db.prepare('UPDATE subcategories SET name = ?, slug = ?, category_id = ?, display_order = ? WHERE id = ?').run(name, slug, category_id, display_order || 0, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.delete('/data/subcategories/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== PRODUCTS =====
router.get('/data/products', requireAuth, (req, res) => {
  const { category_id, subcategory_id, search } = req.query;
  let query = `
    SELECT p.*, pi.image_path as primary_image, c.name as category_name, s.name as subcategory_name
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (category_id) { query += ' AND p.category_id = ?'; params.push(category_id); }
  if (subcategory_id) { query += ' AND p.subcategory_id = ?'; params.push(subcategory_id); }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY p.updated_at DESC';
  const products = db.prepare(query).all(...params);
  res.json(products);
});

router.get('/data/products/:id', requireAuth, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order').all(product.id);
  const attributes = db.prepare('SELECT * FROM custom_attributes WHERE product_id = ?').all(product.id);
  res.json({ ...product, images, attributes });
});

router.post('/data/products', requireAuth, (req, res) => {
  const { name, category_id, subcategory_id, description, brand, price, price_unit, size, finish, material, color, weight, in_stock, featured, attributes } = req.body;
  let slug = slugify(name);
  // Ensure unique slug
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
  if (existing) slug = slug + '-' + Date.now();

  try {
    const result = db.prepare(`
      INSERT INTO products (name, slug, category_id, subcategory_id, description, brand, price, price_unit, size, finish, material, color, weight, in_stock, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, category_id, subcategory_id || null, description || '', brand || '', price || null, price_unit || 'per piece', size || '', finish || '', material || '', color || '', weight || '', in_stock !== undefined ? in_stock : 1, featured || 0);

    // Save custom attributes
    if (attributes && attributes.length > 0) {
      const insertAttr = db.prepare('INSERT INTO custom_attributes (product_id, attr_name, attr_value) VALUES (?, ?, ?)');
      attributes.forEach(attr => {
        if (attr.name && attr.value) insertAttr.run(result.lastInsertRowid, attr.name, attr.value);
      });
    }

    res.json({ id: result.lastInsertRowid, slug, success: true });
  } catch (e) {
    res.status(400).json({ error: 'Failed to create product: ' + e.message });
  }
});

router.put('/data/products/:id', requireAuth, (req, res) => {
  const { name, category_id, subcategory_id, description, brand, price, price_unit, size, finish, material, color, weight, in_stock, featured, attributes } = req.body;

  try {
    db.prepare(`
      UPDATE products SET name=?, category_id=?, subcategory_id=?, description=?, brand=?, price=?, price_unit=?, size=?, finish=?, material=?, color=?, weight=?, in_stock=?, featured=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(name, category_id, subcategory_id || null, description || '', brand || '', price || null, price_unit || 'per piece', size || '', finish || '', material || '', color || '', weight || '', in_stock !== undefined ? in_stock : 1, featured || 0, req.params.id);

    // Update custom attributes
    if (attributes) {
      db.prepare('DELETE FROM custom_attributes WHERE product_id = ?').run(req.params.id);
      const insertAttr = db.prepare('INSERT INTO custom_attributes (product_id, attr_name, attr_value) VALUES (?, ?, ?)');
      attributes.forEach(attr => {
        if (attr.name && attr.value) insertAttr.run(req.params.id, attr.name, attr.value);
      });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Update failed: ' + e.message });
  }
});

router.delete('/data/products/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM product_images WHERE product_id = ?').run(req.params.id);
  db.prepare('DELETE FROM custom_attributes WHERE product_id = ?').run(req.params.id);
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== SETTINGS =====
router.get('/data/settings', requireAuth, (req, res) => {
  const settings = {};
  db.prepare('SELECT key, value FROM site_settings').all().forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

router.put('/data/settings', requireAuth, (req, res) => {
  const update = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  Object.entries(req.body).forEach(([key, value]) => {
    update.run(key, value);
  });
  res.json({ success: true });
});

// ===== CHANGE PASSWORD =====
router.put('/data/change-password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.session.adminId);
  if (!bcrypt.compareSync(current_password, admin.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  const hashed = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE admin SET password = ? WHERE id = ?').run(hashed, admin.id);
  res.json({ success: true });
});

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

module.exports = router;
