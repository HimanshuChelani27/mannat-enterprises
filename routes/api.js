const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const db = require('../database');
const fs = require('fs');

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'public', 'images', 'products');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Upload product images
router.post('/upload-images/:productId', requireAuth, upload.array('images', 10), (req, res) => {
  const productId = req.params.productId;
  const isPrimary = req.body.is_primary === 'true' || req.body.is_primary === '1';

  // Check if product already has a primary image
  const hasPrimary = db.prepare('SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1').get(productId);

  const insertImage = db.prepare('INSERT INTO product_images (product_id, image_path, is_primary, display_order) VALUES (?, ?, ?, ?)');
  const images = [];

  req.files.forEach((file, index) => {
    const imagePath = '/images/products/' + file.filename;
    const primary = (!hasPrimary && index === 0) ? 1 : 0;
    const result = insertImage.run(productId, imagePath, primary, index);
    images.push({ id: result.lastInsertRowid, image_path: imagePath, is_primary: primary });
  });

  res.json({ success: true, images });
});

// Upload category image
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'public', 'images', 'categories');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const categoryUpload = multer({ storage: categoryStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload-category-image/:categoryId', requireAuth, categoryUpload.single('image'), (req, res) => {
  const imagePath = '/images/categories/' + req.file.filename;
  db.prepare('UPDATE categories SET image = ? WHERE id = ?').run(imagePath, req.params.categoryId);
  res.json({ success: true, image_path: imagePath });
});

// Set primary image
router.put('/set-primary-image/:imageId', requireAuth, (req, res) => {
  const image = db.prepare('SELECT * FROM product_images WHERE id = ?').get(req.params.imageId);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(image.product_id);
  db.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ?').run(req.params.imageId);
  res.json({ success: true });
});

// Delete image
router.delete('/delete-image/:imageId', requireAuth, (req, res) => {
  const image = db.prepare('SELECT * FROM product_images WHERE id = ?').get(req.params.imageId);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  // Delete file
  const filePath = path.join(__dirname, '..', 'public', image.image_path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM product_images WHERE id = ?').run(req.params.imageId);
  res.json({ success: true });
});

// Generate QR code for a product
router.get('/qr/product/:slug', async (req, res) => {
  const settings = {};
  db.prepare('SELECT key, value FROM site_settings').all().forEach(r => settings[r.key] = r.value);

  const baseUrl = req.query.base_url || `${req.protocol}://${req.get('host')}`;
  const productUrl = `${baseUrl}/product/${req.params.slug}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1a365d', light: '#ffffff' }
    });
    res.json({ qr: qrDataUrl, url: productUrl });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Generate QR code as downloadable PNG
router.get('/qr/product/:slug/download', async (req, res) => {
  const baseUrl = req.query.base_url || `${req.protocol}://${req.get('host')}`;
  const productUrl = `${baseUrl}/product/${req.params.slug}`;

  try {
    const buffer = await QRCode.toBuffer(productUrl, {
      width: 600,
      margin: 3,
      color: { dark: '#1a365d', light: '#ffffff' }
    });
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename=qr-${req.params.slug}.png`);
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Generate QR for homepage or any URL
router.get('/qr/custom', async (req, res) => {
  const url = req.query.url || `${req.protocol}://${req.get('host')}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#1a365d', light: '#ffffff' }
    });
    res.json({ qr: qrDataUrl, url });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Search products (public)
router.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  const term = `%${q}%`;
  const products = db.prepare(`
    SELECT p.*, pi.image_path as primary_image, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ? OR p.material LIKE ?)
    AND p.in_stock = 1
    ORDER BY p.name LIMIT 20
  `).all(term, term, term, term);
  res.json(products);
});

module.exports = router;
