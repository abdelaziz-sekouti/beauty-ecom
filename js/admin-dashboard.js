// Admin Dashboard JavaScript
let adminData = {
    products: [],
    orders: [],
    customers: [],
    settings: {
        storeName: 'Beauty Haven',
        storeEmail: 'hello@beautyhaven.com',
        taxRate: 8,
        shippingCost: 9.99
    }
};

// DOM Elements
const productsTableBody = document.getElementById('products-table-body');
const ordersTableBody = document.getElementById('orders-table-body');
const customersTableBody = document.getElementById('customers-table-body');
const recentOrders = document.getElementById('recent-orders');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadData();
    renderProducts();
    renderOrders();
    renderCustomers();
    updateStats();
    setupSidebarNavigation();
    setupProductForm();
});

// Check admin authentication
function checkAdminAuth() {
    const adminSession = localStorage.getItem('beautyAdminSession') || sessionStorage.getItem('beautyAdminSession');
    if (!adminSession) {
        window.location.href = 'admin.html';
        return;
    }
    
    const sessionData = JSON.parse(adminSession);
    const currentTime = Date.now();
    const hoursSinceLogin = (currentTime - sessionData.timestamp) / (1000 * 60 * 60);
    
    if (hoursSinceLogin >= 24) {
        localStorage.removeItem('beautyAdminSession');
        sessionStorage.removeItem('beautyAdminSession');
        window.location.href = 'admin.html';
        return;
    }
    
    // Update admin username display
    const usernameElement = document.querySelector('.admin-username');
    if (usernameElement) {
        usernameElement.textContent = `Welcome, ${sessionData.username}`;
    }
}

// Load data from localStorage
function loadData() {
    // Load products
    const savedProducts = localStorage.getItem('beautyProducts');
    if (savedProducts) {
        adminData.products = JSON.parse(savedProducts);
    } else {
        // Initialize with default products
        adminData.products = [
            {
                id: 1,
                name: "Vitamin C Brightening Serum",
                category: "skincare",
                price: 45.99,
                stock: 50,
                badge: "Bestseller",
                status: "active"
            },
            {
                id: 2,
                name: "Hydrating Facial Moisturizer",
                category: "skincare", 
                price: 38.50,
                stock: 75,
                badge: "",
                status: "active"
            },
            {
                id: 3,
                name: "Matte Finish Foundation",
                category: "makeup",
                price: 32.00,
                stock: 100,
                badge: "",
                status: "active"
            }
        ];
        saveData();
    }
    
    // Load orders
    const savedOrders = localStorage.getItem('beautyOrders');
    if (savedOrders) {
        adminData.orders = JSON.parse(savedOrders);
    }
    
    // Load customers
    const savedCustomers = localStorage.getItem('beautyCustomers');
    if (savedCustomers) {
        adminData.customers = JSON.parse(savedCustomers);
    }
    
    // Load settings
    const savedSettings = localStorage.getItem('beautyAdminSettings');
    if (savedSettings) {
        adminData.settings = JSON.parse(savedSettings);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('beautyProducts', JSON.stringify(adminData.products));
    localStorage.setItem('beautyOrders', JSON.stringify(adminData.orders));
    localStorage.setItem('beautyCustomers', JSON.stringify(adminData.customers));
    localStorage.setItem('beautyAdminSettings', JSON.stringify(adminData.settings));
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.admin-section');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Update active states
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(`${targetSection}-section`)?.classList.add('active');
        });
    });
}

// Render products table
function renderProducts() {
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = adminData.products.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${product.image || 'https://picsum.photos/seed/' + product.id + '/50/50'}" alt="${product.name}">
                    <span>${product.name}</span>
                </div>
            </td>
            <td><span class="category-badge ${product.category}">${product.category}</span></td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.status}">${product.status}</span></td>
            <td>
                <button class="action-btn edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render orders table
function renderOrders() {
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = adminData.orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewOrder(${order.id})">View</button>
            </td>
        </tr>
    `).join('');
    
    // Update recent orders
    if (recentOrders) {
        const recentOrdersList = adminData.orders.slice(0, 5);
        if (recentOrdersList.length === 0) {
            recentOrders.innerHTML = '<p class="no-data">No recent orders</p>';
        } else {
            recentOrders.innerHTML = recentOrdersList.map(order => `
                <div class="activity-item">
                    <div class="activity-info">
                        <strong>Order #${order.id}</strong>
                        <span>${order.customer}</span>
                    </div>
                    <div class="activity-meta">
                        <span>$${order.total.toFixed(2)}</span>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Render customers table
function renderCustomers() {
    if (!customersTableBody) return;
    
    customersTableBody.innerHTML = adminData.customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.orders || 0}</td>
            <td>${new Date(customer.joined).toLocaleDateString()}</td>
            <td>
                <button class="action-btn view" onclick="viewCustomer(${customer.id})">View</button>
            </td>
        </tr>
    `).join('');
}

// Update dashboard statistics
function updateStats() {
    const totalProducts = document.getElementById('total-products');
    const totalOrders = document.getElementById('total-orders');
    const totalRevenue = document.getElementById('total-revenue');
    const totalCustomers = document.getElementById('total-customers');
    
    if (totalProducts) totalProducts.textContent = adminData.products.length;
    if (totalOrders) totalOrders.textContent = adminData.orders.length;
    if (totalCustomers) totalCustomers.textContent = adminData.customers.length;
    
    if (totalRevenue) {
        const revenue = adminData.orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);
        totalRevenue.textContent = `$${revenue.toFixed(2)}`;
    }
}

// Product Management
let editingProductId = null;

function addProduct() {
    editingProductId = null;
    document.getElementById('modal-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
    const product = adminData.products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('modal-title').textContent = 'Edit Product';
    
    // Fill form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-badge').value = product.badge || '';
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-description').value = product.description || '';
    
    document.getElementById('productModal').style.display = 'flex';
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        adminData.products = adminData.products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        updateStats();
        showNotification('Product deleted successfully');
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function setupProductForm() {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productData = {
                id: editingProductId || Date.now(),
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                badge: document.getElementById('product-badge').value,
                image: document.getElementById('product-image').value,
                description: document.getElementById('product-description').value,
                status: 'active'
            };
            
            if (editingProductId) {
                // Update existing product
                const index = adminData.products.findIndex(p => p.id === editingProductId);
                if (index > -1) {
                    adminData.products[index] = productData;
                }
                showNotification('Product updated successfully');
            } else {
                // Add new product
                adminData.products.push(productData);
                showNotification('Product added successfully');
            }
            
            saveData();
            renderProducts();
            updateStats();
            closeProductModal();
        });
    }
}

// Order Management
function filterOrders() {
    const filter = document.getElementById('order-filter').value;
    const filteredOrders = filter === 'all' 
        ? adminData.orders 
        : adminData.orders.filter(order => order.status === filter);
    
    ordersTableBody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewOrder(${order.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function viewOrder(id) {
    const order = adminData.orders.find(o => o.id === id);
    if (order) {
        showNotification(`Viewing Order #${id}: Customer: ${order.customer}, Total: $${order.total.toFixed(2)}`);
    }
}

// Customer Management
function searchCustomers(query) {
    const filteredCustomers = query 
        ? adminData.customers.filter(customer => 
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.email.toLowerCase().includes(query.toLowerCase())
          )
        : adminData.customers;
    
    customersTableBody.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.orders || 0}</td>
            <td>${new Date(customer.joined).toLocaleDateString()}</td>
            <td>
                <button class="action-btn view" onclick="viewCustomer(${customer.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function viewCustomer(id) {
    const customer = adminData.customers.find(c => c.id === id);
    if (customer) {
        showNotification(`Viewing Customer: ${customer.name}, Email: ${customer.email}`);
    }
}

// Settings Management
function saveSettings() {
    adminData.settings = {
        storeName: document.getElementById('store-name').value,
        storeEmail: document.getElementById('store-email').value,
        taxRate: parseFloat(document.getElementById('tax-rate').value),
        shippingCost: parseFloat(document.getElementById('shipping-cost').value)
    };
    
    localStorage.setItem('beautyAdminSettings', JSON.stringify(adminData.settings));
    showNotification('Settings saved successfully');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('beautyAdminSession');
        sessionStorage.removeItem('beautyAdminSession');
        window.location.href = 'admin.html';
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4a574;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}