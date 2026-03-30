const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../database');

// ===== API ROUTES (must come before SPA routes) =====

// API: Get home page data
router.get('/data/home', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY display_order, name').all();
  const featuredProducts = db.prepare(`
    SELECT p.*, pi.image_path as primary_image, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.featured = 1 AND p.in_stock = 1
    ORDER BY p.updated_at DESC LIMIT 8
  `).all();
  const settings = {};
  db.prepare('SELECT key, value FROM site_settings').all().forEach(r => settings[r.key] = r.value);
  res.json({ categories, featuredProducts, settings });
});

// API: Get category with products
router.get('/data/category/:slug', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const subcategories = db.prepare('SELECT * FROM subcategories WHERE category_id = ? ORDER BY display_order, name').all(category.id);

  const subcatSlug = req.query.subcategory;
  const brand = req.query.brand;
  const search = req.query.search;

  let query = `
    SELECT p.*, pi.image_path as primary_image, s.name as subcategory_name
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.category_id = ?
  `;
  const params = [category.id];

  if (subcatSlug) {
    const subcat = db.prepare('SELECT id FROM subcategories WHERE slug = ?').get(subcatSlug);
    if (subcat) {
      query += ' AND p.subcategory_id = ?';
      params.push(subcat.id);
    }
  }
  if (brand) {
    query += ' AND p.brand = ?';
    params.push(brand);
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY p.featured DESC, p.name';
  const products = db.prepare(query).all(...params);

  const brands = db.prepare("SELECT DISTINCT brand FROM products WHERE category_id = ? AND brand IS NOT NULL AND brand != ''").all(category.id).map(r => r.brand);

  const settings = {};
  db.prepare('SELECT key, value FROM site_settings').all().forEach(r => settings[r.key] = r.value);

  res.json({ category, subcategories, products, brands, settings });
});

// API: Get single product
router.get('/data/product/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, s.name as subcategory_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.slug = ?
  `).get(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order').all(product.id);
  const attributes = db.prepare('SELECT * FROM custom_attributes WHERE product_id = ?').all(product.id);

  const related = db.prepare(`
    SELECT p.*, pi.image_path as primary_image
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    WHERE p.category_id = ? AND p.id != ? AND p.in_stock = 1
    ORDER BY RANDOM() LIMIT 4
  `).all(product.category_id, product.id);

  const settings = {};
  db.prepare('SELECT key, value FROM site_settings').all().forEach(r => settings[r.key] = r.value);

  res.json({ product, images, attributes, related, settings });
});

// ===== SPA ROUTES (serve index.html for client-side routing) =====

// Home page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/category/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/product/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = router;
