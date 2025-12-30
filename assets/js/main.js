// Beauty E-commerce Website JavaScript

// Product data
let products = [];
let cart = [];
let wishlist = [];

// DOM Elements
const productGrid = document.getElementById('productGrid') || document.getElementById('featured-products');
const cartCount = document.getElementById('cart-count');
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const cartModal = document.getElementById('cartModal') || document.getElementById('cart-modal');
const cartItems = document.getElementById('cartItems') || document.getElementById('cart-items');
const cartTotal = document.getElementById('cartTotal') || document.getElementById('cart-total');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts().then(() => {
        loadCart();
        loadWishlist();
        
        // Check which page we're on
        if (document.getElementById('productGrid') || document.getElementById('featured-products')) {
            renderProducts();
            loadFeaturedProducts();
        }
        if (document.getElementById('shop-products')) {
            renderShopProducts();
        }
        
        setupEventListeners();
    });
});

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('../data/products.json');
        products = await response.json();
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback products if JSON fails to load
        products = [
            {
                id: 1,
                name: "Vitamin C Serum",
                brand: "GlowLab",
                category: "skincare",
                price: 45.99,
                image: "🧴",
                badge: "Bestseller",
                description: "Brightening vitamin C serum"
            }
        ];
        return products;
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('beautyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Load wishlist from localStorage
function loadWishlist() {
    const savedWishlist = localStorage.getItem('beautyWishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('beautyCart', JSON.stringify(cart));
    updateCartCount();
}

// Save wishlist to localStorage
function saveWishlist() {
    localStorage.setItem('beautyWishlist', JSON.stringify(wishlist));
}

// Update cart count display
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Render products to the grid
function renderProducts(productsToRender = products) {
    productGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productGrid.innerHTML = '<div class="no-products"><p>No products found matching your criteria.</p></div>';
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image}
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
            <div class="product-brand">${product.brand}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn-add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                <button class="btn-wishlist ${isInWishlist ? 'in-wishlist' : ''}" onclick="toggleWishlist(${product.id})">
                    ${isInWishlist ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// Toggle wishlist
function toggleWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const index = wishlist.findIndex(item => item.id === productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification(`${product.name} removed from wishlist!`);
    } else {
        wishlist.push(product);
        showNotification(`${product.name} added to wishlist!`);
    }
    
    saveWishlist();
    renderProducts(getFilteredProducts());
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    
    // Filter functionality
    categoryFilter.addEventListener('change', handleFilter);
    sortFilter.addEventListener('change', handleSort);
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', showCart);
    }
    
    // Account button
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', showAccount);
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', showWishlist);
    }
    
    // Cart modal close button
    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', hideCart);
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
    
    // Close cart when clicking outside
    window.addEventListener('click', (e) => {
        const cartModal = document.getElementById('cartModal');
        if (cartModal && e.target === cartModal) {
            hideCart();
        }
    });
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

// Handle filter
function handleFilter() {
    renderProducts(getFilteredProducts());
}

// Handle sort
function handleSort() {
    const sortValue = sortFilter.value;
    let sorted = [...getFilteredProducts()];
    
    switch (sortValue) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'featured':
        default:
            sorted.sort((a, b) => {
                if (a.badge && !b.badge) return -1;
                if (!a.badge && b.badge) return 1;
                return 0;
            });
            break;
    }
    
    renderProducts(sorted);
}

// Get filtered products
function getFilteredProducts() {
    const categoryValue = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    let filtered = products;
    
    // Filter by category
    if (categoryValue) {
        filtered = filtered.filter(product => product.category === categoryValue);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

// Handle newsletter submission
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification(`Thank you for subscribing with ${email}!`);
    e.target.reset();
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b9d;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Show cart modal
function showCart() {
    const cartModal = document.getElementById('cartModal') || document.getElementById('cart-modal');
    if (cartModal) {
        renderCartItems();
        updateCartTotal();
        cartModal.classList.remove('hidden');
        cartModal.style.display = 'block';
    } else {
        showNotification('Cart feature coming soon!');
    }
}

// Show account (placeholder for future implementation)
function showAccount() {
    showNotification('Account feature coming soon!');
}

// Show wishlist (placeholder for future implementation)
function showWishlist() {
    showNotification('Wishlist feature coming soon!');
}

// Hide cart modal
function hideCart() {
    const cartModal = document.getElementById('cartModal') || document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.add('hidden');
        cartModal.style.display = 'none';
    }
}

// Render cart items in modal
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartItems();
            updateCartTotal();
        }
    }
}

// Update cart total
function updateCartTotal() {
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = total.toFixed(2);
    }
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (confirm(`Proceed to checkout?\n\nItems: ${itemCount}\nTotal: $${total.toFixed(2)}`)) {
        // In a real application, this would redirect to a checkout page
        showNotification('Processing checkout... (Demo mode)');
        setTimeout(() => {
            cart = [];
            saveCart();
            updateCartCount();
            renderCartItems();
            updateCartTotal();
            hideCart();
            showNotification('Thank you for your purchase!');
        }, 2000);
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Functions for shop page compatibility
function openCart() {
    showCart();
}

// Render products for shop page
function renderShopProducts() {
    const shopProducts = document.getElementById('shop-products');
    if (shopProducts) {
        shopProducts.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div class="relative">
                    <img src="https://picsum.photos/seed/${product.id}/400/300.jpg" 
                         alt="${product.name}" class="w-full h-64 object-cover">
                    ${product.badge ? `<span class="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">${product.badge}</span>` : ''}
                </div>
                <div class="p-6">
                    <div class="text-sm text-gray-500 mb-1">${product.brand}</div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${product.name}</h3>
                    <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-bold text-pink-600">$${product.price.toFixed(2)}</span>
                        <button onclick="addToCart(${product.id})" 
                                class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header') || document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
});

// Load products for featured section
function loadFeaturedProducts() {
    const featuredProducts = document.getElementById('featured-products');
    if (featuredProducts && products.length > 0) {
        const featured = products.slice(0, 6); // Show first 6 products as featured
        featuredProducts.innerHTML = featured.map(product => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow" data-aos="fade-up">
                <img src="https://picsum.photos/seed/${product.id}/400/300.jpg" 
                     alt="${product.name}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="text-sm text-gray-500 mb-1">${product.brand}</div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${product.name}</h3>
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold text-pink-600">$${product.price.toFixed(2)}</span>
                        <button onclick="addToCart(${product.id})" 
                                class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}