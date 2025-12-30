// Admin Login JavaScript
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// DOM Elements
const adminLoginForm = document.getElementById('adminLoginForm');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
    checkExistingSession();
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleLogin);
    }
});

// Check for existing admin session
function checkExistingSession() {
    const adminSession = localStorage.getItem('beautyAdminSession');
    if (adminSession) {
        const sessionData = JSON.parse(adminSession);
        // Check if session is still valid (24 hours)
        const sessionTime = sessionData.timestamp;
        const currentTime = Date.now();
        const hoursSinceLogin = (currentTime - sessionTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Session expired, remove it
            localStorage.removeItem('beautyAdminSession');
        }
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    // Validate credentials
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Create admin session
        const sessionData = {
            username: username,
            loginTime: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Store session
        if (rememberMe) {
            localStorage.setItem('beautyAdminSession', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('beautyAdminSession', JSON.stringify(sessionData));
        }
        
        // Redirect to dashboard
        window.location.href = 'admin-dashboard.html';
        
    } else {
        // Show error
        showError('Invalid username or password. Please try again.');
    }
}

// Show error modal
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    if (errorModal) {
        errorModal.style.display = 'flex';
    }
}

// Close error modal
function closeErrorModal() {
    if (errorModal) {
        errorModal.style.display = 'none';
    }
}

// Close error modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === errorModal) {
        closeErrorModal();
    }
});

// Clear form on input focus
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('focus', function() {
            this.classList.remove('error');
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            this.classList.remove('error');
        });
    }
});