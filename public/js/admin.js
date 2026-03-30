// ===== Admin Panel JavaScript =====
let categoriesCache = [];
let editingProductId = null;

// ===== NAVIGATION =====
function showSection(section) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  const navEl = document.getElementById('nav-' + section);
  if (navEl) navEl.classList.add('active');

  // Load data for section
  switch (section) {
    case 'dashboard': loadDashboard(); break;
    case 'categories': loadCategories(); break;
    case 'subcategories': loadSubcategories(); break;
    case 'products': loadProducts(); break;
    case 'qrcodes': loadQRPage(); break;
    case 'settings': loadSettings(); break;
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
  sidebar.style.position = 'fixed';
  sidebar.style.zIndex = '200';
}

// ===== TOAST =====
function toast(message, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== MODAL =====
function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('active');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ===== API HELPER =====
async function api(url, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (res.status === 401) { window.location.href = '/admin/login'; return; }
  return res.json();
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const data = await api('/admin/data/dashboard');
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="label">Categories</div><div class="value">${data.totalCategories}</div></div>
    <div class="stat-card"><div class="label">Subcategories</div><div class="value">${data.totalSubcategories}</div></div>
    <div class="stat-card"><div class="label">Total Products</div><div class="value">${data.totalProducts}</div></div>
    <div class="stat-card"><div class="label">In Stock</div><div class="value" style="color:var(--green);">${data.inStock}</div></div>
  `;
  document.getElementById('dashCategoriesTable').innerHTML = data.categories.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.product_count}</td>
      <td><button class="btn btn-sm btn-outline" onclick="showSection('products'); document.getElementById('prodFilterCategory').value='${c.id}'; onProdCategoryFilter();">View Products</button></td>
    </tr>
  `).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--gray-400); padding:30px;">No categories yet. Add your first category!</td></tr>';
}

// ===== CATEGORIES =====
async function loadCategories() {
  const categories = await api('/admin/data/categories');
  categoriesCache = categories;
  updateCategoryDropdowns();

  document.getElementById('categoriesTable').innerHTML = categories.map(c => `
    <tr>
      <td>${c.image ? `<img src="${c.image}" alt="">` : '<span style="color:var(--gray-300);">No image</span>'}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.display_order}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="openCategoryModal(${c.id}, '${c.name.replace(/'/g, "\\'")}', ${c.display_order})">Edit</button>
        <button class="btn btn-sm btn-outline" onclick="uploadCategoryImage(${c.id})">Image</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}')">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--gray-400); padding:30px;">No categories yet</td></tr>';
}

function openCategoryModal(id = null, name = '', order = 0) {
  openModal(`
    <h3>${id ? 'Edit' : 'Add'} Category</h3>
    <div class="form-group">
      <label>Category Name</label>
      <input type="text" id="catName" value="${name}" placeholder="e.g., Tiles, CP Fittings">
    </div>
    <div class="form-group">
      <label>Display Order</label>
      <input type="number" id="catOrder" value="${order}" placeholder="0">
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCategory(${id})">${id ? 'Update' : 'Create'}</button>
    </div>
  `);
}

async function saveCategory(id) {
  const name = document.getElementById('catName').value.trim();
  const display_order = parseInt(document.getElementById('catOrder').value) || 0;
  if (!name) { toast('Please enter category name', 'error'); return; }

  if (id) {
    await api(`/admin/data/categories/${id}`, 'PUT', { name, display_order });
    toast('Category updated');
  } else {
    await api('/admin/data/categories', 'POST', { name, display_order });
    toast('Category created');
  }
  closeModal();
  loadCategories();
}

async function deleteCategory(id, name) {
  if (!confirm(`Delete category "${name}" and ALL its products?`)) return;
  await api(`/admin/data/categories/${id}`, 'DELETE');
  toast('Category deleted');
  loadCategories();
}

function uploadCategoryImage(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const formData = new FormData();
    formData.append('image', input.files[0]);
    const res = await fetch(`/api/upload-category-image/${id}`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) { toast('Image uploaded'); loadCategories(); }
  };
  input.click();
}

// ===== SUBCATEGORIES =====
async function loadSubcategories() {
  const categoryId = document.getElementById('subcatFilterCategory').value;
  const url = categoryId ? `/admin/data/subcategories?category_id=${categoryId}` : '/admin/data/subcategories';
  const subcategories = await api(url);

  document.getElementById('subcategoriesTable').innerHTML = subcategories.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.category_name}</td>
      <td>${s.display_order}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="openSubcategoryModal(${s.id}, '${s.name.replace(/'/g, "\\'")}', ${s.category_id}, ${s.display_order})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSubcategory(${s.id}, '${s.name.replace(/'/g, "\\'")}')">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--gray-400); padding:30px;">No subcategories yet</td></tr>';
}

function openSubcategoryModal(id = null, name = '', categoryId = '', order = 0) {
  const catOptions = categoriesCache.map(c => `<option value="${c.id}" ${c.id === categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
  openModal(`
    <h3>${id ? 'Edit' : 'Add'} Subcategory</h3>
    <div class="form-group">
      <label>Category</label>
      <select id="subcatCategory">${catOptions}</select>
    </div>
    <div class="form-group">
      <label>Subcategory Name</label>
      <input type="text" id="subcatName" value="${name}" placeholder="e.g., Floor Tiles, Basin Faucets">
    </div>
    <div class="form-group">
      <label>Display Order</label>
      <input type="number" id="subcatOrder" value="${order}">
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveSubcategory(${id})">${id ? 'Update' : 'Create'}</button>
    </div>
  `);
}

async function saveSubcategory(id) {
  const name = document.getElementById('subcatName').value.trim();
  const category_id = document.getElementById('subcatCategory').value;
  const display_order = parseInt(document.getElementById('subcatOrder').value) || 0;
  if (!name || !category_id) { toast('Please fill all fields', 'error'); return; }

  if (id) {
    await api(`/admin/data/subcategories/${id}`, 'PUT', { name, category_id, display_order });
    toast('Subcategory updated');
  } else {
    await api('/admin/data/subcategories', 'POST', { name, category_id, display_order });
    toast('Subcategory created');
  }
  closeModal();
  loadSubcategories();
}

async function deleteSubcategory(id, name) {
  if (!confirm(`Delete subcategory "${name}"?`)) return;
  await api(`/admin/data/subcategories/${id}`, 'DELETE');
  toast('Subcategory deleted');
  loadSubcategories();
}

// ===== PRODUCTS =====
async function loadProducts() {
  const categoryId = document.getElementById('prodFilterCategory').value;
  const subcategoryId = document.getElementById('prodFilterSubcategory').value;
  const search = document.getElementById('prodSearchInput').value;

  let url = '/admin/data/products?';
  if (categoryId) url += `category_id=${categoryId}&`;
  if (subcategoryId) url += `subcategory_id=${subcategoryId}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;

  const products = await api(url);

  document.getElementById('productsList').innerHTML = `
    <div class="table-container">
      <table>
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.primary_image ? `<img src="${p.primary_image}" alt="">` : '<span style="color:var(--gray-300);">No img</span>'}</td>
              <td>
                <strong>${p.name}</strong>
                ${p.brand ? `<br><small style="color:var(--gray-400);">${p.brand}</small>` : ''}
              </td>
              <td>${p.category_name || ''}${p.subcategory_name ? '<br><small>' + p.subcategory_name + '</small>' : ''}</td>
              <td>${p.price ? 'Rs ' + Number(p.price).toLocaleString('en-IN') + '<br><small>' + (p.price_unit || '') + '</small>' : '-'}</td>
              <td><span style="color:${p.in_stock ? 'var(--green)' : 'var(--red)'};">${p.in_stock ? 'In Stock' : 'Out'}</span></td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-sm btn-outline" onclick="showProductQR('${p.slug}', '${p.name.replace(/'/g, "\\'")}')">QR</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="6" style="text-align:center; color:var(--gray-400); padding:30px;">No products yet</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

async function onProdCategoryFilter() {
  const categoryId = document.getElementById('prodFilterCategory').value;
  const subcatSelect = document.getElementById('prodFilterSubcategory');
  subcatSelect.innerHTML = '<option value="">All Subcategories</option>';
  if (categoryId) {
    const subcats = await api(`/admin/data/subcategories?category_id=${categoryId}`);
    subcats.forEach(s => {
      subcatSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
  }
  loadProducts();
}

function openProductForm(product = null) {
  editingProductId = product ? product.id : null;
  const catOptions = categoriesCache.map(c => `<option value="${c.id}" ${product && product.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('');

  const priceUnits = ['per piece', 'per sq ft', 'per box', 'per foot', 'per meter', 'per kg', 'per set'];
  const unitOptions = priceUnits.map(u => `<option value="${u}" ${product && product.price_unit === u ? 'selected' : ''}>${u}</option>`).join('');

  let attrsHtml = '';
  if (product && product.attributes) {
    product.attributes.forEach((a, i) => {
      attrsHtml += attrRowHtml(a.attr_name, a.attr_value, i);
    });
  }

  document.getElementById('productFormContainer').style.display = 'block';
  document.getElementById('productFormContainer').innerHTML = `
    <div class="form-card">
      <h3 style="margin-bottom: 20px;">${product ? 'Edit' : 'Add New'} Product</h3>
      <div class="form-grid">
        <div class="form-group full">
          <label>Product Name *</label>
          <input type="text" id="prodName" value="${product ? product.name : ''}" placeholder="e.g., Kajaria Floor Tile 600x600">
        </div>
        <div class="form-group">
          <label>Category *</label>
          <select id="prodCategory" onchange="loadProdSubcats()">${catOptions}</select>
        </div>
        <div class="form-group">
          <label>Subcategory</label>
          <select id="prodSubcategory"><option value="">None</option></select>
        </div>
        <div class="form-group">
          <label>Brand</label>
          <input type="text" id="prodBrand" value="${product ? product.brand || '' : ''}" placeholder="e.g., Kajaria, Jaquar">
        </div>
        <div class="form-group">
          <label>Size</label>
          <input type="text" id="prodSize" value="${product ? product.size || '' : ''}" placeholder="e.g., 600x600mm, 15mm">
        </div>
        <div class="form-group">
          <label>Price</label>
          <input type="number" id="prodPrice" value="${product ? product.price || '' : ''}" placeholder="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Price Unit</label>
          <select id="prodPriceUnit">${unitOptions}</select>
        </div>
        <div class="form-group">
          <label>Finish</label>
          <input type="text" id="prodFinish" value="${product ? product.finish || '' : ''}" placeholder="e.g., Glossy, Matte, Chrome">
        </div>
        <div class="form-group">
          <label>Material</label>
          <input type="text" id="prodMaterial" value="${product ? product.material || '' : ''}" placeholder="e.g., Ceramic, Brass, CPVC">
        </div>
        <div class="form-group">
          <label>Color</label>
          <input type="text" id="prodColor" value="${product ? product.color || '' : ''}" placeholder="e.g., White, Silver, Gold">
        </div>
        <div class="form-group">
          <label>Weight</label>
          <input type="text" id="prodWeight" value="${product ? product.weight || '' : ''}" placeholder="e.g., 500g, 2kg">
        </div>
        <div class="form-group full">
          <label>Description</label>
          <textarea id="prodDescription" placeholder="Product description...">${product ? product.description || '' : ''}</textarea>
        </div>
        <div class="form-group">
          <label>In Stock</label>
          <div class="toggle-wrapper">
            <div class="toggle ${!product || product.in_stock ? 'active' : ''}" id="prodInStock" onclick="this.classList.toggle('active')"></div>
            <span id="stockLabel">${!product || product.in_stock ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Featured</label>
          <div class="toggle-wrapper">
            <div class="toggle ${product && product.featured ? 'active' : ''}" id="prodFeatured" onclick="this.classList.toggle('active')"></div>
            <span>Show on homepage</span>
          </div>
        </div>
      </div>

      <!-- Custom Attributes -->
      <h4 style="margin: 20px 0 10px; color: var(--primary);">Custom Attributes</h4>
      <p style="font-size: 0.8rem; color: var(--gray-400); margin-bottom: 10px;">Add any extra details like Box Coverage, Pieces per Box, Warranty, etc.</p>
      <div id="customAttrs">${attrsHtml}</div>
      <button class="btn btn-sm btn-outline" onclick="addAttrRow()" style="margin-bottom: 20px;">+ Add Attribute</button>

      <!-- Images -->
      ${product ? `
        <h4 style="margin: 20px 0 10px; color: var(--primary);">Product Images</h4>
        <div class="image-preview-grid" id="existingImages">
          ${product.images ? product.images.map(img => `
            <div class="image-preview-item" id="img-${img.id}">
              <img src="${img.image_path}" alt="">
              ${img.is_primary ? '<div class="primary-badge">Primary</div>' : `<button class="remove-img" onclick="setPrimaryImage(${img.id})" title="Set as primary" style="background:var(--green);">&#9733;</button>`}
              <button class="remove-img" onclick="deleteImage(${img.id})" style="top:${img.is_primary ? '2' : '24'}px;">&#10005;</button>
            </div>
          `).join('') : ''}
        </div>
      ` : ''}
      <div class="image-upload-area" onclick="document.getElementById('imageInput').click()">
        <p style="color:var(--gray-400);">Click to upload images (max 10MB each)</p>
        <input type="file" id="imageInput" multiple accept="image/*" style="display:none;" onchange="previewImages(this)">
      </div>
      <div class="image-preview-grid" id="newImagePreviews"></div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button class="btn btn-primary" onclick="saveProduct()">Save Product</button>
        <button class="btn btn-outline" onclick="cancelProductForm()">Cancel</button>
      </div>
    </div>
  `;

  // Load subcategories for selected category
  if (product) loadProdSubcats(product.subcategory_id);
  else loadProdSubcats();

  // Scroll to form
  document.getElementById('productFormContainer').scrollIntoView({ behavior: 'smooth' });
}

function cancelProductForm() {
  document.getElementById('productFormContainer').style.display = 'none';
  editingProductId = null;
}

async function loadProdSubcats(selectedId = null) {
  const categoryId = document.getElementById('prodCategory').value;
  const subcatSelect = document.getElementById('prodSubcategory');
  subcatSelect.innerHTML = '<option value="">None</option>';
  if (categoryId) {
    const subcats = await api(`/admin/data/subcategories?category_id=${categoryId}`);
    subcats.forEach(s => {
      subcatSelect.innerHTML += `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${s.name}</option>`;
    });
  }
}

async function saveProduct() {
  const name = document.getElementById('prodName').value.trim();
  const category_id = parseInt(document.getElementById('prodCategory').value);
  if (!name || !category_id) { toast('Name and Category are required', 'error'); return; }

  const product = {
    name,
    category_id,
    subcategory_id: parseInt(document.getElementById('prodSubcategory').value) || null,
    brand: document.getElementById('prodBrand').value.trim(),
    size: document.getElementById('prodSize').value.trim(),
    price: parseFloat(document.getElementById('prodPrice').value) || null,
    price_unit: document.getElementById('prodPriceUnit').value,
    finish: document.getElementById('prodFinish').value.trim(),
    material: document.getElementById('prodMaterial').value.trim(),
    color: document.getElementById('prodColor').value.trim(),
    weight: document.getElementById('prodWeight').value.trim(),
    description: document.getElementById('prodDescription').value.trim(),
    in_stock: document.getElementById('prodInStock').classList.contains('active') ? 1 : 0,
    featured: document.getElementById('prodFeatured').classList.contains('active') ? 1 : 0,
    attributes: getCustomAttributes()
  };

  let result;
  if (editingProductId) {
    result = await api(`/admin/data/products/${editingProductId}`, 'PUT', product);
  } else {
    result = await api('/admin/data/products', 'POST', product);
  }

  if (result.success || result.id) {
    const productId = editingProductId || result.id;
    // Upload new images
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files.length > 0) {
      const formData = new FormData();
      for (let f of imageInput.files) formData.append('images', f);
      await fetch(`/api/upload-images/${productId}`, { method: 'POST', body: formData });
    }
    toast(editingProductId ? 'Product updated' : 'Product created');
    cancelProductForm();
    loadProducts();
  } else {
    toast(result.error || 'Failed to save', 'error');
  }
}

async function editProduct(id) {
  const product = await api(`/admin/data/products/${id}`);
  openProductForm(product);
}

async function deleteProduct(id, name) {
  if (!confirm(`Delete product "${name}"?`)) return;
  await api(`/admin/data/products/${id}`, 'DELETE');
  toast('Product deleted');
  loadProducts();
}

// Image helpers
function previewImages(input) {
  const container = document.getElementById('newImagePreviews');
  container.innerHTML = '';
  for (let f of input.files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      container.innerHTML += `<div class="image-preview-item"><img src="${e.target.result}" alt=""></div>`;
    };
    reader.readAsDataURL(f);
  }
}

async function setPrimaryImage(imageId) {
  await fetch(`/api/set-primary-image/${imageId}`, { method: 'PUT' });
  toast('Primary image updated');
  if (editingProductId) editProduct(editingProductId);
}

async function deleteImage(imageId) {
  if (!confirm('Delete this image?')) return;
  await fetch(`/api/delete-image/${imageId}`, { method: 'DELETE' });
  document.getElementById('img-' + imageId)?.remove();
  toast('Image deleted');
}

// Custom attributes
let attrCounter = 0;
function attrRowHtml(name = '', value = '', index = null) {
  const i = index !== null ? index : attrCounter++;
  return `
    <div class="attr-row" id="attr-${i}">
      <input type="text" placeholder="Attribute name (e.g., Box Coverage)" value="${name}" class="attr-name">
      <input type="text" placeholder="Value (e.g., 4 sq ft)" value="${value}" class="attr-value">
      <button class="remove-attr" onclick="document.getElementById('attr-${i}').remove()">&#10005;</button>
    </div>
  `;
}

function addAttrRow() {
  document.getElementById('customAttrs').insertAdjacentHTML('beforeend', attrRowHtml());
}

function getCustomAttributes() {
  const rows = document.querySelectorAll('.attr-row');
  const attrs = [];
  rows.forEach(row => {
    const name = row.querySelector('.attr-name').value.trim();
    const value = row.querySelector('.attr-value').value.trim();
    if (name && value) attrs.push({ name, value });
  });
  return attrs;
}

// ===== QR CODES =====
async function loadQRPage() {
  const products = await api('/admin/data/products');
  const select = document.getElementById('qrProductSelect');
  select.innerHTML = '<option value="">Select a product</option>';
  products.forEach(p => {
    select.innerHTML += `<option value="${p.slug}">${p.name}</option>`;
  });
  document.getElementById('qrBaseUrl').value = window.location.origin;
}

async function generateCustomQR() {
  const url = document.getElementById('qrBaseUrl').value.trim() || window.location.origin;
  const res = await fetch(`/api/qr/custom?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  document.getElementById('qrHomeResult').innerHTML = `
    <img src="${data.qr}" alt="QR Code" style="width: 250px; border: 1px solid var(--gray-200); border-radius: 8px;">
    <p style="margin-top: 10px; color: var(--gray-500);">URL: ${data.url}</p>
    <p style="margin-top: 5px;"><a href="${data.qr}" download="qr-homepage.png" class="btn btn-sm btn-primary">Download QR Image</a></p>
  `;
}

async function generateProductQR() {
  const slug = document.getElementById('qrProductSelect').value;
  if (!slug) return;
  const baseUrl = document.getElementById('qrBaseUrl').value.trim() || window.location.origin;
  const res = await fetch(`/api/qr/product/${slug}?base_url=${encodeURIComponent(baseUrl)}`);
  const data = await res.json();
  document.getElementById('qrProductResult').innerHTML = `
    <img src="${data.qr}" alt="QR Code" style="width: 250px; border: 1px solid var(--gray-200); border-radius: 8px;">
    <p style="margin-top: 10px; color: var(--gray-500);">URL: ${data.url}</p>
    <p style="margin-top: 5px;">
      <a href="${data.qr}" download="qr-${slug}.png" class="btn btn-sm btn-primary">Download QR Image</a>
      <a href="/api/qr/product/${slug}/download?base_url=${encodeURIComponent(baseUrl)}" class="btn btn-sm btn-success" download>Download HD QR</a>
    </p>
  `;
}

function showProductQR(slug, name) {
  openModal(`
    <div class="qr-display">
      <h3>QR Code: ${name}</h3>
      <div id="modalQR"><div class="loading"><div class="spinner" style="width:30px;height:30px;border-width:3px;"></div></div></div>
    </div>
  `);
  fetch(`/api/qr/product/${slug}`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('modalQR').innerHTML = `
        <img src="${data.qr}" alt="QR">
        <p style="color:var(--gray-500); font-size: 0.85rem; margin-top: 5px;">${data.url}</p>
        <p style="margin-top: 10px;"><a href="/api/qr/product/${slug}/download" download class="btn btn-sm btn-primary">Download HD QR</a></p>
      `;
    });
}

// ===== SETTINGS =====
async function loadSettings() {
  const settings = await api('/admin/data/settings');
  document.getElementById('set_business_name').value = settings.business_name || '';
  document.getElementById('set_phone').value = settings.phone || '';
  document.getElementById('set_whatsapp').value = settings.whatsapp || '';
  document.getElementById('set_email').value = settings.email || '';
  document.getElementById('set_address').value = settings.address || '';
  document.getElementById('set_tagline').value = settings.tagline || '';
}

async function saveSettings() {
  const settings = {
    business_name: document.getElementById('set_business_name').value,
    phone: document.getElementById('set_phone').value,
    whatsapp: document.getElementById('set_whatsapp').value,
    email: document.getElementById('set_email').value,
    address: document.getElementById('set_address').value,
    tagline: document.getElementById('set_tagline').value
  };
  await api('/admin/data/settings', 'PUT', settings);
  toast('Settings saved');
}

async function changePassword() {
  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  if (!current || !newPass) { toast('Please fill both fields', 'error'); return; }
  if (newPass.length < 4) { toast('Password too short', 'error'); return; }
  const res = await api('/admin/data/change-password', 'PUT', { current_password: current, new_password: newPass });
  if (res.success) {
    toast('Password changed');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
  } else {
    toast(res.error || 'Failed', 'error');
  }
}

// ===== CATEGORY DROPDOWNS =====
function updateCategoryDropdowns() {
  const selects = ['subcatFilterCategory', 'prodFilterCategory'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const currentVal = el.value;
    el.innerHTML = '<option value="">All Categories</option>';
    categoriesCache.forEach(c => {
      el.innerHTML += `<option value="${c.id}" ${c.id == currentVal ? 'selected' : ''}>${c.name}</option>`;
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  loadCategories(); // to cache categories
});
