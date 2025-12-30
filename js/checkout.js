// Checkout Page JavaScript
let cart = [];
let currentStep = 1;
let shippingCost = 0;
let taxRate = 0.08;
let promoDiscount = 0;

// DOM Elements
const summaryItems = document.getElementById('summary-items');
const reviewItems = document.getElementById('review-items');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const reviewSubtotalEl = document.getElementById('review-subtotal');
const reviewShippingEl = document.getElementById('review-shipping');
const reviewTaxEl = document.getElementById('review-tax');
const reviewTotalEl = document.getElementById('review-total');

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    renderSummary();
    setupPaymentToggle();
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('beautyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('beautyCart', JSON.stringify(cart));
}

// Render order summary
function renderSummary() {
    if (!summaryItems) return;
    
    if (cart.length === 0) {
        summaryItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-info">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-details">Quantity: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    updateTotals();
}

// Render review items
function renderReviewItems() {
    if (!reviewItems) return;
    
    reviewItems.innerHTML = cart.map(item => `
        <div class="review-item">
            <div class="review-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="review-item-details">
                <div class="review-item-name">${item.name}</div>
                <div class="review-item-meta">Quantity: ${item.quantity} | Price: $${item.price.toFixed(2)}</div>
            </div>
            <div class="review-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
}

// Update totals
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAfterDiscount = subtotal - promoDiscount;
    const tax = totalAfterDiscount * taxRate;
    const total = totalAfterDiscount + tax + shippingCost;
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shippingCost.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    if (reviewSubtotalEl) reviewSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (reviewShippingEl) reviewShippingEl.textContent = `$${shippingCost.toFixed(2)}`;
    if (reviewTaxEl) reviewTaxEl.textContent = `$${tax.toFixed(2)}`;
    if (reviewTotalEl) reviewTotalEl.textContent = `$${total.toFixed(2)}`;
}

// Navigation between steps
function goToStep(step) {
    // Validate current step before proceeding
    if (step > currentStep && !validateCurrentStep()) {
        return;
    }
    
    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach(progressStep => {
        progressStep.classList.remove('active');
    });
    
    for (let i = 1; i <= step; i++) {
        document.querySelector(`#step-${i === 1 ? 'contact' : i === 2 ? 'shipping' : i === 3 ? 'payment' : 'review'}-step`)?.classList.add('active');
    }
    
    // Show/hide form sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${step === 1 ? 'contact-info' : step === 2 ? 'shipping' : step === 3 ? 'payment' : 'review'}-section`)?.classList.add('active');
    
    // Special handling for review step
    if (step === 4) {
        renderReviewItems();
        updateTotals();
    }
    
    currentStep = step;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current step
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            const contactForm = document.getElementById('contact-form');
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                showNotification('Please fill in all required contact information');
                return false;
            }
            break;
        case 2:
            const shippingForm = document.getElementById('shipping-form');
            if (!shippingForm.checkValidity()) {
                shippingForm.reportValidity();
                showNotification('Please fill in all required shipping information');
                return false;
            }
            // Calculate shipping based on state
            const state = document.getElementById('state').value;
            shippingCost = state === 'NY' || state === 'CA' ? 0 : 9.99;
            updateTotals();
            break;
        case 3:
            const paymentForm = document.getElementById('payment-form');
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            if (paymentMethod === 'card') {
                if (!paymentForm.checkValidity()) {
                    paymentForm.reportValidity();
                    showNotification('Please fill in all required payment information');
                    return false;
                }
            }
            break;
    }
    return true;
}

// Setup payment method toggle
function setupPaymentToggle() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardForm = document.getElementById('card-form');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const method = this.dataset.method;
            if (cardForm) {
                cardForm.style.display = method === 'card' ? 'block' : 'none';
            }
        });
    });
}

// Apply promo code
function applyPromo() {
    const promoCode = document.getElementById('promo-code').value.trim();
    const promoMessage = document.getElementById('promo-message');
    
    if (!promoCode) {
        showNotification('Please enter a promo code');
        return;
    }
    
    // Sample promo codes
    const validPromos = {
        'BEAUTY10': 0.1,
        'SAVE15': 0.15,
        'WELCOME20': 0.20
    };
    
    if (validPromos[promoCode]) {
        promoDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * validPromos[promoCode];
        updateTotals();
        promoMessage.innerHTML = `<span style="color: green;">Promo code applied! You saved $${promoDiscount.toFixed(2)}</span>`;
        showNotification(`Promo code ${promoCode} applied successfully!`);
    } else {
        promoMessage.innerHTML = '<span style="color: red;">Invalid promo code</span>';
        showNotification('Invalid promo code');
    }
}

// Place order
function placeOrder() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Show processing message
    showNotification('Processing your order...');
    
    // Simulate order processing
    setTimeout(() => {
        // Generate random order number
        const orderNumber = 'BH' + Date.now();
        document.getElementById('orderNumber').textContent = orderNumber;
        
        // Show success modal
        document.getElementById('successModal').style.display = 'flex';
        
        // Clear cart
        cart = [];
        saveCart();
        
        // Update cart count in header
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = '0';
        }
        
        showNotification('Order placed successfully!');
    }, 2000);
}

// Continue shopping
function continueShopping() {
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
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

// Add mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        showNotification(`Thank you for subscribing with ${email}!`);
        e.target.reset();
    });
}