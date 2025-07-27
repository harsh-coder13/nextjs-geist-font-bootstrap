// firebase-init.js
// StreetFoodConnect Firebase Initialization
// This file initializes Firebase services and creates global references

(function() {
    'use strict';
    
    // Check if Firebase config is loaded
    if (typeof window.firebaseConfig === 'undefined') {
        console.error('Firebase config not found! Make sure firebase-config.js is loaded before this script.');
        return;
    }
    
    try {
        // Initialize Firebase with the configuration
        firebase.initializeApp(window.firebaseConfig);
        
        // Create global references for Firebase services
        window.auth = firebase.auth();
        window.db = firebase.database();
        
        // Global variables for authentication state
        window.currentUser = null;
        window.isUserLoggedIn = false;
        
        // Authentication state observer
        window.auth.onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in
                window.currentUser = user;
                window.isUserLoggedIn = true;
                console.log('User signed in:', user.email);
                
                // Update UI elements if they exist
                updateAuthUI(true);
            } else {
                // User is signed out
                window.currentUser = null;
                window.isUserLoggedIn = false;
                console.log('User signed out');
                
                // Update UI elements if they exist
                updateAuthUI(false);
            }
        });
        
        // Function to update authentication-related UI elements
        function updateAuthUI(isLoggedIn) {
            // Update navigation links
            const loginLink = document.querySelector('a[href="login.html"]');
            const dashboardLink = document.querySelector('a[href="dashboard.html"]');
            
            if (loginLink) {
                if (isLoggedIn) {
                    loginLink.textContent = 'Dashboard';
                    loginLink.href = 'dashboard.html';
                } else {
                    loginLink.textContent = 'Login';
                    loginLink.href = 'login.html';
                }
            }
            
            // Add logout functionality if user is logged in
            if (isLoggedIn && !document.getElementById('logout-btn')) {
                addLogoutButton();
            }
        }
        
        // Function to add logout button to navigation
        function addLogoutButton() {
            const navbar = document.querySelector('.navbar-nav');
            if (navbar && window.currentUser) {
                const logoutItem = document.createElement('li');
                logoutItem.className = 'nav-item';
                logoutItem.innerHTML = `
                    <button id="logout-btn" class="nav-link btn btn-link text-light" style="border: none; background: none;">
                        Logout (${window.currentUser.email})
                    </button>
                `;
                navbar.appendChild(logoutItem);
                
                // Add logout functionality
                document.getElementById('logout-btn').addEventListener('click', function() {
                    logout();
                });
            }
        }
        
        // Global logout function
        window.logout = function() {
            window.auth.signOut().then(function() {
                // Sign-out successful
                showAlert('Logged out successfully!', 'success');
                
                // Remove logout button
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.parentElement.remove();
                }
                
                // Redirect to home page if on dashboard
                if (window.location.pathname.includes('dashboard.html')) {
                    window.location.href = 'index.html';
                }
            }).catch(function(error) {
                console.error('Logout error:', error);
                showAlert('Error logging out: ' + error.message, 'danger');
            });
        };
        
        // Global function to check if user is authenticated
        window.requireAuth = function(redirectUrl = 'login.html') {
            if (!window.isUserLoggedIn) {
                showAlert('Please log in to access this page.', 'warning');
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
                return false;
            }
            return true;
        };
        
        // Global function to show alerts
        window.showAlert = function(message, type = 'info', duration = 5000) {
            // Remove existing alerts
            const existingAlerts = document.querySelectorAll('.alert-custom');
            existingAlerts.forEach(alert => alert.remove());
            
            // Create new alert
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
            alertDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            alertDiv.innerHTML = `
                <strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(alertDiv);
            
            // Auto-remove alert after duration
            if (duration > 0) {
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, duration);
            }
        };
        
        // Global function to show loading state
        window.showLoading = function(element, show = true) {
            if (!element) return;
            
            if (show) {
                element.disabled = true;
                const originalText = element.textContent;
                element.setAttribute('data-original-text', originalText);
                element.innerHTML = '<span class="loading-spinner"></span> Loading...';
            } else {
                element.disabled = false;
                const originalText = element.getAttribute('data-original-text');
                if (originalText) {
                    element.textContent = originalText;
                    element.removeAttribute('data-original-text');
                }
            }
        };
        
        // Global function to validate email format
        window.validateEmail = function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        
        // Global function to validate form data
        window.validateForm = function(formData, requiredFields) {
            const errors = [];
            
            requiredFields.forEach(field => {
                if (!formData[field] || formData[field].toString().trim() === '') {
                    errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                }
            });
            
            // Validate email if present
            if (formData.email && !validateEmail(formData.email)) {
                errors.push('Please enter a valid email address');
            }
            
            // Validate hygiene score if present
            if (formData.hygieneScore) {
                const score = parseInt(formData.hygieneScore);
                if (isNaN(score) || score < 1 || score > 10) {
                    errors.push('Hygiene score must be between 1 and 10');
                }
            }
            
            return errors;
        };
        
        // Global function to format timestamp
        window.formatTimestamp = function(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        };
        
        // Initialize dummy data if database is empty (for demo purposes)
        window.initializeDummyData = function() {
            const vendorsRef = window.db.ref('vendors');
            
            vendorsRef.once('value', function(snapshot) {
                if (!snapshot.exists()) {
                    console.log('No vendors found. Adding dummy data...');
                    
                    const dummyVendors = {
                        vendor1: {
                            name: "Raj's Chaat Corner",
                            cuisine: "North Indian",
                            hygieneScore: 9,
                            location: "Mumbai, Maharashtra",
                            imageUrl: "🍛",
                            createdAt: new Date().toISOString(),
                            userId: "demo-user-1"
                        },
                        vendor2: {
                            name: "South Spice Express",
                            cuisine: "South Indian",
                            hygieneScore: 8,
                            location: "Bangalore, Karnataka",
                            imageUrl: "🥘",
                            createdAt: new Date().toISOString(),
                            userId: "demo-user-2"
                        },
                        vendor3: {
                            name: "Delhi Street Delights",
                            cuisine: "Street Food",
                            hygieneScore: 7,
                            location: "Delhi, NCR",
                            imageUrl: "🌮",
                            createdAt: new Date().toISOString(),
                            userId: "demo-user-3"
                        }
                    };
                    
                    vendorsRef.set(dummyVendors).then(() => {
                        console.log('Dummy vendor data added successfully!');
                    }).catch((error) => {
                        console.error('Error adding dummy data:', error);
                    });
                }
            });
        };
        
        console.log('Firebase initialized successfully!');
        console.log('Available services: Auth, Realtime Database');
        
        // Initialize dummy data after a short delay
        setTimeout(() => {
            window.initializeDummyData();
        }, 1000);
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
        
        // Show user-friendly error message
        if (error.code === 'auth/invalid-api-key') {
            console.error('Invalid API key. Please check your Firebase configuration.');
        } else if (error.code === 'auth/project-not-found') {
            console.error('Firebase project not found. Please check your project ID.');
        } else {
            console.error('Firebase initialization failed. Please check your configuration.');
        }
        
        // Show alert to user if showAlert function is available
        if (typeof window.showAlert === 'function') {
            window.showAlert('Firebase initialization failed. Please check the console for details.', 'danger');
        }
    }
})();
