// Shop page JavaScript
let cart = [];

// Initialize shop page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    setupEventListeners();
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch('../data/products.json');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products
function renderProducts(products) {
    const productGrid = document.getElementById('products-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img src="${product.image || 'https://picsum.photos/seed/' + product.id + '/300/200.jpg'}" 
                 alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-600 mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-pink-600">$${product.price.toFixed(2)}</span>
                    <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                            class="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            // Filter logic here
        });
    });
}

// Add to cart function
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartUI();
    showNotification('Product added to cart!');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('beautyCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('beautyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}