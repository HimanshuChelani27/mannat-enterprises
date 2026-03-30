// ===== Mannat Enterprises - Frontend App =====
const app = document.getElementById('app');
let siteSettings = {};

// Router
function getRoute() {
  const path = window.location.pathname;
  if (path === '/') return { page: 'home' };
  if (path.startsWith('/category/')) return { page: 'category', slug: path.split('/category/')[1] };
  if (path.startsWith('/product/')) return { page: 'product', slug: path.split('/product/')[1] };
  if (path === '/contact') return { page: 'contact' };
  if (path === '/about') return { page: 'about' };
  return { page: 'home' };
}

// Navigate without reload
function navigate(url, e) {
  if (e) e.preventDefault();
  history.pushState(null, '', url);
  loadPage();
}
window.addEventListener('popstate', loadPage);

// Load page based on route
async function loadPage() {
  const route = getRoute();
  app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  switch (route.page) {
    case 'home': await renderHome(); break;
    case 'category': await renderCategory(route.slug); break;
    case 'product': await renderProduct(route.slug); break;
    case 'contact': await renderContact(); break;
    case 'about': await renderAbout(); break;
  }

  // Update active nav
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === window.location.pathname);
  });
  window.scrollTo(0, 0);
}

// ===== HOME PAGE =====
async function renderHome() {
  const res = await fetch('/data/home');
  const data = await res.json();
  siteSettings = data.settings;
  updateSiteInfo();
  buildNav(data.categories);

  let html = `
    <section class="hero">
      <h1>Welcome to <span>Mannat Enterprises</span></h1>
      <p>${data.settings.tagline || ''}</p>
      <a href="https://wa.me/${(data.settings.whatsapp || '').replace(/[^0-9]/g, '')}" class="hero-cta" target="_blank">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Chat on WhatsApp
      </a>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Our Categories</h2>
        <div class="categories-grid">
          ${data.categories.length ? data.categories.map(c => `
            <a href="/category/${c.slug}" class="category-card" onclick="navigate('/category/${c.slug}', event)">
              <div class="category-card-img">
                ${c.image ? `<img src="${c.image}" alt="${c.name}">` : `<div class="placeholder-icon">&#128204;</div>`}
              </div>
              <h3>${c.name}</h3>
            </a>
          `).join('') : '<div class="empty-state"><div class="icon">&#128230;</div><p>No categories yet. Admin can add categories.</p></div>'}
        </div>
      </div>
    </section>
  `;

  if (data.featuredProducts.length > 0) {
    html += `
      <section class="section" style="background: var(--white);">
        <div class="container">
          <h2 class="section-title">Featured Products</h2>
          <div class="products-grid">
            ${data.featuredProducts.map(p => productCard(p)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  app.innerHTML = html;
}

// ===== CATEGORY PAGE =====
async function renderCategory(slug) {
  const params = new URLSearchParams(window.location.search);
  const subcategory = params.get('subcategory') || '';
  const brand = params.get('brand') || '';

  const res = await fetch(`/data/category/${slug}?subcategory=${subcategory}&brand=${brand}`);
  if (!res.ok) { app.innerHTML = '<div class="empty-state"><div class="icon">&#128533;</div><p>Category not found</p></div>'; return; }
  const data = await res.json();
  siteSettings = data.settings;
  updateSiteInfo();

  let filtersHtml = `
    <button class="filter-btn ${!subcategory ? 'active' : ''}" onclick="navigate('/category/${slug}', event)">All</button>
    ${data.subcategories.map(s => `
      <button class="filter-btn ${subcategory === s.slug ? 'active' : ''}" onclick="navigate('/category/${slug}?subcategory=${s.slug}', event)">${s.name}</button>
    `).join('')}
  `;

  let brandFilter = '';
  if (data.brands.length > 0) {
    brandFilter = `
      <div style="margin-top: 10px;">
        <select onchange="if(this.value) navigate('/category/${slug}?brand='+this.value, event); else navigate('/category/${slug}', event);" style="padding: 8px 14px; border: 1px solid var(--gray-200); border-radius: 20px; font-size: 0.85rem; background: white;">
          <option value="">All Brands</option>
          ${data.brands.map(b => `<option value="${b}" ${brand === b ? 'selected' : ''}>${b}</option>`).join('')}
        </select>
      </div>
    `;
  }

  app.innerHTML = `
    <div class="container">
      <div class="breadcrumb">
        <a href="/" onclick="navigate('/', event)">Home</a> &raquo; ${data.category.name}
      </div>
      <h2 class="section-title">${data.category.name}</h2>
      <div class="filters-bar">${filtersHtml}</div>
      ${brandFilter}
      <div class="products-grid" style="margin-top: 20px;">
        ${data.products.length ? data.products.map(p => productCard(p)).join('') : '<div class="empty-state"><div class="icon">&#128230;</div><p>No products in this category yet.</p></div>'}
      </div>
    </div>
  `;
}

// ===== PRODUCT PAGE =====
async function renderProduct(slug) {
  const res = await fetch(`/data/product/${slug}`);
  if (!res.ok) { app.innerHTML = '<div class="empty-state"><div class="icon">&#128533;</div><p>Product not found</p></div>'; return; }
  const data = await res.json();
  siteSettings = data.settings;
  updateSiteInfo();

  const mainImage = data.images.length > 0 ? data.images[0].image_path : '';
  const whatsappNum = (data.settings.whatsapp || '').replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in: ${data.product.name}${data.product.price ? ' (Rs ' + data.product.price + ' ' + data.product.price_unit + ')' : ''}`);

  // Build specs table
  let specsRows = '';
  if (data.product.size) specsRows += `<tr><td>Size</td><td>${data.product.size}</td></tr>`;
  if (data.product.material) specsRows += `<tr><td>Material</td><td>${data.product.material}</td></tr>`;
  if (data.product.finish) specsRows += `<tr><td>Finish</td><td>${data.product.finish}</td></tr>`;
  if (data.product.color) specsRows += `<tr><td>Color</td><td>${data.product.color}</td></tr>`;
  if (data.product.weight) specsRows += `<tr><td>Weight</td><td>${data.product.weight}</td></tr>`;
  if (data.product.brand) specsRows += `<tr><td>Brand</td><td>${data.product.brand}</td></tr>`;
  data.attributes.forEach(a => {
    specsRows += `<tr><td>${a.attr_name}</td><td>${a.attr_value}</td></tr>`;
  });

  app.innerHTML = `
    <div class="container">
      <div class="breadcrumb">
        <a href="/" onclick="navigate('/', event)">Home</a> &raquo;
        <a href="/category/${data.product.category_slug}" onclick="navigate('/category/${data.product.category_slug}', event)">${data.product.category_name}</a> &raquo;
        ${data.product.name}
      </div>
      <div class="product-detail">
        <div class="product-detail-grid">
          <div class="product-gallery">
            <div class="product-main-image">
              ${mainImage ? `<img src="${mainImage}" alt="${data.product.name}" id="mainImg">` : '<div class="placeholder-icon" style="font-size:5rem;">&#128247;</div>'}
            </div>
            ${data.images.length > 1 ? `
              <div class="product-thumbs">
                ${data.images.map((img, i) => `<img src="${img.image_path}" alt="thumb" class="${i === 0 ? 'active' : ''}" onclick="changeImage(this, '${img.image_path}')">`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="product-info">
            <h1>${data.product.name}</h1>
            ${data.product.brand ? `<div class="brand-name">${data.product.brand}</div>` : ''}
            ${data.product.price ? `
              <div class="price-tag">
                Rs ${Number(data.product.price).toLocaleString('en-IN')}
                <span class="unit">${data.product.price_unit || 'per piece'}</span>
              </div>
            ` : '<div class="price-tag" style="font-size:1rem; color:var(--gray-500);">Contact for price</div>'}
            ${!data.product.in_stock ? '<div style="color:var(--accent); font-weight:600; margin-bottom:10px;">Out of Stock</div>' : ''}
            ${data.product.description ? `<p style="margin-bottom:20px; color:var(--gray-600);">${data.product.description}</p>` : ''}
            ${specsRows ? `
              <div class="product-specs">
                <table>${specsRows}</table>
              </div>
            ` : ''}
            <a href="https://wa.me/${whatsappNum}?text=${whatsappMsg}" class="whatsapp-btn" target="_blank">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enquire on WhatsApp
            </a>
            <div class="qr-section" id="qrSection"></div>
          </div>
        </div>
      </div>

      ${data.related.length > 0 ? `
        <section class="section">
          <h2 class="section-title">Related Products</h2>
          <div class="products-grid">
            ${data.related.map(p => productCard(p)).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;

  // Load QR code
  loadQR(slug);
}

// ===== CONTACT PAGE =====
async function renderContact() {
  const res = await fetch('/data/home');
  const data = await res.json();
  siteSettings = data.settings;
  updateSiteInfo();

  const s = data.settings;
  const whatsappNum = (s.whatsapp || '').replace(/[^0-9]/g, '');

  app.innerHTML = `
    <div class="container">
      <div class="breadcrumb"><a href="/" onclick="navigate('/', event)">Home</a> &raquo; Contact Us</div>
      <div class="contact-section">
        <h2 class="section-title">Contact Us</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
          <div>
            <h3 style="color: var(--primary); margin-bottom: 15px;">Get in Touch</h3>
            <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${s.phone || ''}</p>
            <p style="margin-bottom: 10px;"><strong>Email:</strong> ${s.email || ''}</p>
            <p style="margin-bottom: 20px;"><strong>Address:</strong> ${s.address || ''}</p>
            <a href="https://wa.me/${whatsappNum}" class="hero-cta" target="_blank" style="display: inline-flex;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
          <div id="qrHomeSection" style="text-align:center;"></div>
        </div>
      </div>
    </div>
  `;

  // Load homepage QR
  const qrRes = await fetch('/api/qr/custom?url=' + encodeURIComponent(window.location.origin));
  const qrData = await qrRes.json();
  document.getElementById('qrHomeSection').innerHTML = `
    <h3 style="color: var(--primary); margin-bottom: 15px;">Scan to Visit Our Website</h3>
    <img src="${qrData.qr}" alt="QR Code" style="width: 200px; border: 1px solid var(--gray-200); border-radius: 8px;">
    <p style="font-size: 0.8rem; color: var(--gray-400); margin-top: 8px;">Share this QR code with customers</p>
  `;
}

// ===== ABOUT PAGE =====
async function renderAbout() {
  const res = await fetch('/data/home');
  const data = await res.json();
  siteSettings = data.settings;
  updateSiteInfo();

  app.innerHTML = `
    <div class="container">
      <div class="breadcrumb"><a href="/" onclick="navigate('/', event)">Home</a> &raquo; About Us</div>
      <div class="about-section">
        <h2 class="section-title">About Mannat Enterprises</h2>
        <p style="font-size: 1.05rem; line-height: 1.8; color: var(--gray-600); margin-bottom: 20px;">
          <strong>Mannat Enterprises</strong> is your trusted partner for all building and construction material needs.
          We deal in a wide range of products including Tiles, CP Fittings, Tiles Patti (Profiles & Trims),
          Plumbing Items, and Brass Items from top brands.
        </p>
        <p style="font-size: 1.05rem; line-height: 1.8; color: var(--gray-600); margin-bottom: 20px;">
          We are committed to providing the best quality products at competitive prices, with excellent customer service.
          Whether you're building a new home or renovating, we have everything you need under one roof.
        </p>
        <h3 style="color: var(--primary); margin-top: 30px; margin-bottom: 15px;">Why Choose Us?</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">&#127942;</div>
            <h4 style="color: var(--primary);">Quality Products</h4>
            <p style="font-size: 0.9rem; color: var(--gray-500);">Only genuine, top-brand products</p>
          </div>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">&#128176;</div>
            <h4 style="color: var(--primary);">Best Prices</h4>
            <p style="font-size: 0.9rem; color: var(--gray-500);">Competitive wholesale & retail prices</p>
          </div>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">&#128666;</div>
            <h4 style="color: var(--primary);">Wide Range</h4>
            <p style="font-size: 0.9rem; color: var(--gray-500);">Tiles, CP, Plumbing, Brass & more</p>
          </div>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">&#129309;</div>
            <h4 style="color: var(--primary);">Trusted Service</h4>
            <p style="font-size: 0.9rem; color: var(--gray-500);">Customer satisfaction is our priority</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== HELPERS =====
function productCard(p) {
  return `
    <a href="/product/${p.slug}" class="product-card" onclick="navigate('/product/${p.slug}', event)">
      <div class="product-card-img">
        ${p.primary_image ? `<img src="${p.primary_image}" alt="${p.name}">` : '<div class="placeholder-icon">&#128247;</div>'}
        ${!p.in_stock ? '<div class="product-badge out-of-stock">Out of Stock</div>' : ''}
        ${p.featured ? '<div class="product-badge">Featured</div>' : ''}
      </div>
      <div class="product-card-body">
        <h3>${p.name}</h3>
        ${p.brand ? `<div class="brand">${p.brand}</div>` : ''}
        <div class="specs">${[p.size, p.finish, p.material].filter(Boolean).join(' | ')}</div>
        ${p.price ? `<div class="price">Rs ${Number(p.price).toLocaleString('en-IN')} <span class="price-unit">${p.price_unit || ''}</span></div>` : '<div class="price" style="font-size:0.85rem; color:var(--gray-400);">Contact for price</div>'}
      </div>
    </a>
  `;
}

function buildNav(categories) {
  const navLinks = document.getElementById('navLinks');
  navLinks.innerHTML = `<a href="/" onclick="navigate('/', event)" class="${window.location.pathname === '/' ? 'active' : ''}">Home</a>`;
  categories.forEach(c => {
    navLinks.innerHTML += `<a href="/category/${c.slug}" onclick="navigate('/category/${c.slug}', event)" class="${window.location.pathname === '/category/' + c.slug ? 'active' : ''}">${c.name}</a>`;
  });

  // Footer links
  const footerLinks = document.getElementById('footerLinks');
  footerLinks.innerHTML = categories.map(c => `<a href="/category/${c.slug}" onclick="navigate('/category/${c.slug}', event)" style="display:block; padding: 3px 0;">${c.name}</a>`).join('');
}

function updateSiteInfo() {
  const s = siteSettings;
  const whatsappNum = (s.whatsapp || '').replace(/[^0-9]/g, '');
  document.getElementById('whatsappFloat').href = `https://wa.me/${whatsappNum}`;
  document.getElementById('footerTagline').textContent = s.tagline || '';
  document.getElementById('footerContact').innerHTML = `
    <span style="display:block; padding: 3px 0;">Phone: ${s.phone || ''}</span>
    <span style="display:block; padding: 3px 0;">Email: ${s.email || ''}</span>
    <span style="display:block; padding: 3px 0;">${s.address || ''}</span>
  `;
}

function changeImage(thumb, src) {
  document.getElementById('mainImg').src = src;
  document.querySelectorAll('.product-thumbs img').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

async function loadQR(slug) {
  const qrSection = document.getElementById('qrSection');
  const res = await fetch(`/api/qr/product/${slug}`);
  const data = await res.json();
  qrSection.innerHTML = `
    <h4 style="color: var(--primary); margin-bottom: 8px; font-size: 0.9rem;">QR Code for this Product</h4>
    <img src="${data.qr}" alt="QR Code">
    <p>Scan to view this product</p>
    <a href="/api/qr/product/${slug}/download" download style="display:inline-block; margin-top:8px; padding: 6px 16px; background: var(--primary); color: white; border-radius: 15px; font-size: 0.8rem;">Download QR</a>
  `;
}

// ===== SEARCH =====
let searchTimeout;
function setupSearch(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (q.length < 2) { hideSearchResults(); return; }
    searchTimeout = setTimeout(() => searchProducts(q), 300);
  });
  input.addEventListener('blur', () => setTimeout(hideSearchResults, 200));
}

async function searchProducts(q) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const products = await res.json();
  const container = document.getElementById('searchResults');
  if (!container) return;
  if (products.length === 0) {
    container.innerHTML = '<div style="padding:15px; text-align:center; color:var(--gray-400);">No products found</div>';
  } else {
    container.innerHTML = products.map(p => `
      <a href="/product/${p.slug}" class="search-result-item" onclick="navigate('/product/${p.slug}', event)">
        ${p.primary_image ? `<img src="${p.primary_image}" alt="">` : '<div style="width:40px;height:40px;background:var(--gray-100);border-radius:4px;display:flex;align-items:center;justify-content:center;">&#128247;</div>'}
        <div class="sr-info">
          <div class="sr-name">${p.name}</div>
          <div class="sr-cat">${p.category_name || ''} ${p.price ? '| Rs ' + Number(p.price).toLocaleString('en-IN') : ''}</div>
        </div>
      </a>
    `).join('');
  }
  container.classList.add('active');
}

function hideSearchResults() {
  const container = document.getElementById('searchResults');
  if (container) container.classList.remove('active');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadPage();
  setupSearch('searchInput');
  setupSearch('mobileSearchInput');
});
