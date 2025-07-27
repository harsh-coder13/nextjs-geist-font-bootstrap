// login.js
// StreetFoodConnect Login JavaScript
// Handles Firebase authentication (login, signup, password reset)

(function() {
    'use strict';
    
    // DOM elements
    let loginForm;
    let signupForm;
    let forgotPasswordForm;
    let alertContainer;
    let loginBtn;
    let signupBtn;
    let createAccountBtn;
    let sendResetBtn;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Login page loaded');
        
        // Check if user is already logged in
        checkExistingAuth();
        
        initializeElements();
        setupEventListeners();
    });
    
    // Check if user is already authenticated
    function checkExistingAuth() {
        if (typeof window.isUserLoggedIn !== 'undefined' && window.isUserLoggedIn) {
            // User is already logged in, redirect to dashboard
            showAlert('You are already logged in. Redirecting to dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
    }
    
    // Initialize DOM elements
    function initializeElements() {
        loginForm = document.getElementById('login-form');
        signupForm = document.getElementById('signup-form');
        forgotPasswordForm = document.getElementById('forgot-password-form');
        alertContainer = document.getElementById('alert-container');
        loginBtn = document.getElementById('login-btn');
        signupBtn = document.getElementById('signup-btn');
        createAccountBtn = document.getElementById('create-account-btn');
        sendResetBtn = document.getElementById('send-reset-btn');
        
        console.log('Login DOM elements initialized');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Signup form submission
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', handleSignup);
        }
        
        // Forgot password
        if (document.getElementById('forgot-password-link')) {
            document.getElementById('forgot-password-link').addEventListener('click', function(e) {
                e.preventDefault();
                showForgotPasswordModal();
            });
        }
        
        if (sendResetBtn) {
            sendResetBtn.addEventListener('click', handlePasswordReset);
        }
        
        // Show signup modal
        if (signupBtn) {
            signupBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('signupModal'));
                modal.show();
            });
        }
        
        // Password visibility toggle
        const togglePasswordBtn = document.getElementById('toggle-password');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
        }
        
        // Demo credentials button
        const useDemoBtn = document.getElementById('use-demo-btn');
        if (useDemoBtn) {
            useDemoBtn.addEventListener('click', useDemoCredentials);
        }
        
        // Form validation
        setupFormValidation();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('Login event listeners setup complete');
    }
    
    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        
        // Show loading state
        showLoading(loginBtn, true);
        clearAlerts();
        
        try {
            // Get form data
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Validate form
            if (!loginForm.checkValidity()) {
                loginForm.classList.add('was-validated');
                showAlert('Please fill in all required fields correctly.', 'danger');
                return;
            }
            
            // Validate email format
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address.', 'danger');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long.', 'danger');
                return;
            }
            
            // Check if Firebase Auth is available
            if (!window.auth) {
                throw new Error('Firebase authentication not initialized');
            }
            
            // Set persistence based on remember me
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await window.auth.setPersistence(persistence);
            
            // Sign in with email and password
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('User signed in successfully:', user.email);
            
            // Show success message
            showAlert('Login successful! Redirecting to dashboard...', 'success');
            
            // Clear form
            loginForm.reset();
            loginForm.classList.remove('was-validated');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                const redirectUrl = getRedirectUrl();
                window.location.href = redirectUrl;
            }, 2000);
            
        } catch (error) {
            console.error('Login error:', error);
            handleAuthError(error);
        } finally {
            showLoading(loginBtn, false);
        }
    }
    
    // Handle signup form submission
    async function handleSignup() {
        // Show loading state
        showLoading(createAccountBtn, true);
        
        try {
            // Get form data
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const agreeTerms = document.getElementById('agree-terms').checked;
            
            // Validate form
            if (!signupForm.checkValidity()) {
                signupForm.classList.add('was-validated');
                showAlert('Please fill in all required fields correctly.', 'danger');
                return;
            }
            
            // Validate email format
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address.', 'danger');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long.', 'danger');
                return;
            }
            
            // Validate password confirmation
            if (password !== confirmPassword) {
                showAlert('Passwords do not match.', 'danger');
                document.getElementById('confirm-password').classList.add('is-invalid');
                return;
            }
            
            // Validate terms agreement
            if (!agreeTerms) {
                showAlert('You must agree to the terms and conditions.', 'danger');
                return;
            }
            
            // Check if Firebase Auth is available
            if (!window.auth) {
                throw new Error('Firebase authentication not initialized');
            }
            
            // Create user account
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('User account created successfully:', user.email);
            
            // Send email verification
            await user.sendEmailVerification();
            
            // Show success message
            showAlert('Account created successfully! Please check your email for verification.', 'success');
            
            // Clear form and close modal
            signupForm.reset();
            signupForm.classList.remove('was-validated');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
            modal.hide();
            
            // Auto-login after successful signup
            setTimeout(() => {
                window.location.href = 'dashboard.html?message=Welcome! Your account has been created successfully.&type=success';
            }, 3000);
            
        } catch (error) {
            console.error('Signup error:', error);
            handleAuthError(error);
        } finally {
            showLoading(createAccountBtn, false);
        }
    }
    
    // Handle password reset
    async function handlePasswordReset() {
        // Show loading state
        showLoading(sendResetBtn, true);
        
        try {
            // Get email
            const email = document.getElementById('reset-email').value.trim();
            
            // Validate form
            if (!forgotPasswordForm.checkValidity()) {
                forgotPasswordForm.classList.add('was-validated');
                showAlert('Please enter a valid email address.', 'danger');
                return;
            }
            
            // Validate email format
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address.', 'danger');
                return;
            }
            
            // Check if Firebase Auth is available
            if (!window.auth) {
                throw new Error('Firebase authentication not initialized');
            }
            
            // Send password reset email
            await window.auth.sendPasswordResetEmail(email);
            
            console.log('Password reset email sent to:', email);
            
            // Show success message
            showAlert('Password reset email sent! Please check your inbox.', 'success');
            
            // Clear form and close modal
            forgotPasswordForm.reset();
            forgotPasswordForm.classList.remove('was-validated');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
            modal.hide();
            
        } catch (error) {
            console.error('Password reset error:', error);
            handleAuthError(error);
        } finally {
            showLoading(sendResetBtn, false);
        }
    }
    
    // Handle authentication errors
    function handleAuthError(error) {
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
            default:
                errorMessage = error.message || errorMessage;
        }
        
        showAlert(errorMessage, 'danger');
    }
    
    // Setup form validation
    function setupFormValidation() {
        // Real-time validation for login form
        const loginInputs = loginForm.querySelectorAll('input');
        loginInputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
        
        // Real-time validation for signup form
        if (signupForm) {
            const signupInputs = signupForm.querySelectorAll('input');
            signupInputs.forEach(input => {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', clearFieldError);
            });
            
            // Password confirmation validation
            const confirmPasswordInput = document.getElementById('confirm-password');
            const passwordInput = document.getElementById('signup-password');
            
            if (confirmPasswordInput && passwordInput) {
                confirmPasswordInput.addEventListener('input', function() {
                    if (this.value !== passwordInput.value) {
                        this.classList.add('is-invalid');
                        this.setCustomValidity('Passwords do not match');
                    } else {
                        this.classList.remove('is-invalid');
                        this.setCustomValidity('');
                    }
                });
            }
        }
    }
    
    // Validate individual field
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        // Remove existing error styling
        field.classList.remove('is-invalid');
        
        // Validate based on field type
        let isValid = true;
        
        if (field.type === 'email') {
            isValid = validateEmail(value);
        } else if (field.type === 'password') {
            isValid = value.length >= 6;
        }
        
        // Show validation feedback
        if (!isValid && value) {
            field.classList.add('is-invalid');
        }
    }
    
    // Clear field error styling
    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('is-invalid');
        field.setCustomValidity('');
    }
    
    // Toggle password visibility
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('toggle-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }
    
    // Use demo credentials
    function useDemoCredentials() {
        document.getElementById('email').value = 'demo@streetfoodconnect.com';
        document.getElementById('password').value = 'demo123456';
        
        showAlert('Demo credentials filled. Click Login to continue.', 'info');
    }
    
    // Show forgot password modal
    function showForgotPasswordModal() {
        const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
        modal.show();
    }
    
    // Get redirect URL from query parameters or default
    function getRedirectUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        if (redirect) {
            return decodeURIComponent(redirect);
        }
        
        return 'dashboard.html';
    }
    
    // Show alert message
    function showAlert(message, type = 'info') {
        if (!alertContainer) return;
        
        // Remove existing alerts
        alertContainer.innerHTML = '';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Scroll to alert
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-remove success/info alerts after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }
    
    // Clear all alerts
    function clearAlerts() {
        if (alertContainer) {
            alertContainer.innerHTML = '';
        }
    }
    
    // Show loading state on button
    function showLoading(button, show = true) {
        if (!button) return;
        
        if (show) {
            button.disabled = true;
            const originalText = button.textContent;
            button.setAttribute('data-original-text', originalText);
            button.innerHTML = '<span class="loading-spinner"></span> Loading...';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }
    
    // Email validation function
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Enter key to submit login form
        if (e.key === 'Enter' && document.activeElement.form === loginForm) {
            e.preventDefault();
            handleLogin(e);
        }
        
        // Escape key to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }
    }
    
    // Handle URL parameters for messages
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    
    if (message && type) {
        setTimeout(() => {
            showAlert(decodeURIComponent(message), type);
            
            // Clean up URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }, 1000);
    }
    
    // Create demo account if it doesn't exist
    function createDemoAccount() {
        if (window.auth) {
            window.auth.createUserWithEmailAndPassword('demo@streetfoodconnect.com', 'demo123456')
                .then(() => {
                    console.log('Demo account created successfully');
                })
                .catch((error) => {
                    if (error.code !== 'auth/email-already-in-use') {
                        console.error('Error creating demo account:', error);
                    }
                });
        }
    }
    
    // Initialize demo account after Firebase is ready
    setTimeout(createDemoAccount, 2000);
    
})();

// Export for testing purposes
window.StreetFoodConnect = window.StreetFoodConnect || {};
window.StreetFoodConnect.login = {
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};
