// dashboard.js
// StreetFoodConnect Dashboard JavaScript
// Handles vendor management, statistics, and user dashboard functionality

(function() {
    'use strict';
    
    // Global variables
    let currentUser = null;
    let userVendors = [];
    let userInquiries = [];
    let currentView = 'card';
    
    // DOM elements
    let alertContainer;
    let loadingState;
    let dashboardStats;
    let vendorsSection;
    let vendorsCards;
    let vendorsTable;
    let vendorsTableBody;
    let noVendorsState;
    let inquiriesSection;
    let inquiriesList;
    let noInquiriesState;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Dashboard page loaded');
        
        // Check authentication first
        checkAuthentication();
        
        initializeElements();
        setupEventListeners();
    });
    
    // Check if user is authenticated
    function checkAuthentication() {
        // Wait for Firebase to initialize
        setTimeout(() => {
            if (!window.auth) {
                redirectToLogin('Firebase authentication not available');
                return;
            }
            
            window.auth.onAuthStateChanged(function(user) {
                if (user) {
                    currentUser = user;
                    console.log('User authenticated:', user.email);
                    
                    // Update UI with user info
                    updateUserInfo(user);
                    
                    // Load dashboard data
                    loadDashboardData();
                } else {
                    redirectToLogin('Please log in to access the dashboard');
                }
            });
        }, 1000);
    }
    
    // Redirect to login page
    function redirectToLogin(message) {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${currentUrl}&message=${encodeURIComponent(message)}&type=warning`;
    }
    
    // Initialize DOM elements
    function initializeElements() {
        alertContainer = document.getElementById('alert-container');
        loadingState = document.getElementById('loading-state');
        dashboardStats = document.getElementById('dashboard-stats');
        vendorsSection = document.getElementById('vendors-section');
        vendorsCards = document.getElementById('vendors-cards');
        vendorsTable = document.getElementById('vendors-table');
        vendorsTableBody = document.getElementById('vendors-table-body');
        noVendorsState = document.getElementById('no-vendors');
        inquiriesSection = document.getElementById('inquiries-section');
        inquiriesList = document.getElementById('inquiries-list');
        noInquiriesState = document.getElementById('no-inquiries');
        
        console.log('Dashboard DOM elements initialized');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Logout functionality
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', handleLogout);
        }
        
        // View toggle
        document.getElementById('card-view').addEventListener('change', function() {
            if (this.checked) {
                currentView = 'card';
                toggleView();
            }
        });
        
        document.getElementById('table-view').addEventListener('change', function() {
            if (this.checked) {
                currentView = 'table';
                toggleView();
            }
        });
        
        // Edit vendor modal
        document.getElementById('save-vendor-btn').addEventListener('click', saveVendorChanges);
        
        // Delete confirmation
        document.getElementById('confirm-delete-btn').addEventListener('click', confirmDeleteVendor);
        
        console.log('Dashboard event listeners setup complete');
    }
    
    // Update user info in navigation
    function updateUserInfo(user) {
        const userEmailSpan = document.getElementById('user-email');
        if (userEmailSpan) {
            userEmailSpan.textContent = user.email;
        }
    }
    
    // Load dashboard data
    async function loadDashboardData() {
        showLoadingState();
        
        try {
            // Load user's vendors
            await loadUserVendors();
            
            // Load user's inquiries
            await loadUserInquiries();
            
            // Update statistics
            updateDashboardStats();
            
            // Render vendors
            renderVendors();
            
            // Render inquiries
            renderInquiries();
            
            showDashboardContent();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showAlert('Error loading dashboard data: ' + error.message, 'danger');
        }
    }
    
    // Load user's vendors from Firebase
    async function loadUserVendors() {
        if (!window.db || !currentUser) return;
        
        return new Promise((resolve, reject) => {
            const vendorsRef = window.db.ref('vendors');
            
            vendorsRef.orderByChild('userId').equalTo(currentUser.uid).on('value', function(snapshot) {
                const vendorsData = snapshot.val();
                
                if (vendorsData) {
                    userVendors = Object.keys(vendorsData).map(key => ({
                        id: key,
                        ...vendorsData[key]
                    }));
                } else {
                    userVendors = [];
                }
                
                console.log(`Loaded ${userVendors.length} vendors for user`);
                resolve();
            }, function(error) {
                console.error('Error loading vendors:', error);
                reject(error);
            });
        });
    }
    
    // Load user's inquiries from Firebase
    async function loadUserInquiries() {
        if (!window.db || !currentUser) return;
        
        return new Promise((resolve, reject) => {
            const inquiriesRef = window.db.ref('inquiries');
            
            // Get inquiries for user's vendors
            const userVendorIds = userVendors.map(vendor => vendor.id);
            
            inquiriesRef.on('value', function(snapshot) {
                const inquiriesData = snapshot.val();
                
                if (inquiriesData) {
                    userInquiries = Object.keys(inquiriesData)
                        .map(key => ({
                            id: key,
                            ...inquiriesData[key]
                        }))
                        .filter(inquiry => userVendorIds.includes(inquiry.vendorId))
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                } else {
                    userInquiries = [];
                }
                
                console.log(`Loaded ${userInquiries.length} inquiries for user`);
                resolve();
            }, function(error) {
                console.error('Error loading inquiries:', error);
                reject(error);
            });
        });
    }
    
    // Update dashboard statistics
    function updateDashboardStats() {
        // Total vendors
        document.getElementById('total-vendors').textContent = userVendors.length;
        
        // Total inquiries
        document.getElementById('total-inquiries').textContent = userInquiries.length;
        
        // Average hygiene score
        if (userVendors.length > 0) {
            const avgHygiene = userVendors.reduce((sum, vendor) => sum + (vendor.hygieneScore || 0), 0) / userVendors.length;
            document.getElementById('avg-hygiene').textContent = avgHygiene.toFixed(1);
        } else {
            document.getElementById('avg-hygiene').textContent = '0';
        }
        
        // Days active (since first vendor registration)
        if (userVendors.length > 0) {
            const oldestVendor = userVendors.reduce((oldest, vendor) => {
                const vendorDate = new Date(vendor.createdAt || Date.now());
                const oldestDate = new Date(oldest.createdAt || Date.now());
                return vendorDate < oldestDate ? vendor : oldest;
            });
            
            const daysActive = Math.floor((Date.now() - new Date(oldestVendor.createdAt)) / (1000 * 60 * 60 * 24));
            document.getElementById('days-active').textContent = Math.max(1, daysActive);
        } else {
            document.getElementById('days-active').textContent = '0';
        }
    }
    
    // Render vendors based on current view
    function renderVendors() {
        if (userVendors.length === 0) {
            showNoVendorsState();
            return;
        }
        
        if (currentView === 'card') {
            renderVendorCards();
        } else {
            renderVendorTable();
        }
        
        showVendorsSection();
    }
    
    // Render vendor cards
    function renderVendorCards() {
        vendorsCards.innerHTML = '';
        
        userVendors.forEach(vendor => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'col-lg-4 col-md-6 mb-4';
            
            const hygieneColor = getHygieneScoreColor(vendor.hygieneScore);
            const imageDisplay = vendor.imageUrl && vendor.imageUrl.startsWith('data:') 
                ? `<img src="${vendor.imageUrl}" class="vendor-image" alt="${vendor.name}">`
                : `<div class="vendor-image">${vendor.imageUrl || '🍛'}</div>`;
            
            cardDiv.innerHTML = `
                <div class="vendor-card">
                    ${imageDisplay}
                    <div class="vendor-info">
                        <h5 class="vendor-name">${vendor.name || 'Unknown Vendor'}</h5>
                        <span class="vendor-cuisine">${vendor.cuisine || 'Mixed'}</span>
                        
                        <div class="hygiene-score mt-2">
                            <span class="text-muted">Hygiene Score:</span>
                            <span class="score-badge" style="background-color: ${hygieneColor}">
                                ${vendor.hygieneScore || 'N/A'}/10
                            </span>
                        </div>
                        
                        <p class="text-muted mt-2 mb-2">
                            📍 ${vendor.location || 'Location not specified'}
                        </p>
                        
                        ${vendor.operatingHours ? `
                            <p class="text-muted small mb-2">
                                🕒 ${vendor.operatingHours}
                            </p>
                        ` : ''}
                        
                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-primary btn-sm flex-fill" onclick="editVendor('${vendor.id}')">
                                Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteVendor('${vendor.id}')">
                                Delete
                            </button>
                        </div>
                        
                        <small class="text-muted d-block mt-2">
                            Created: ${formatDate(vendor.createdAt)}
                        </small>
                    </div>
                </div>
            `;
            
            vendorsCards.appendChild(cardDiv);
        });
    }
    
    // Render vendor table
    function renderVendorTable() {
        vendorsTableBody.innerHTML = '';
        
        userVendors.forEach(vendor => {
            const row = document.createElement('tr');
            const hygieneColor = getHygieneScoreColor(vendor.hygieneScore);
            
            row.innerHTML = `
                <td>
                    <strong>${vendor.name || 'Unknown Vendor'}</strong>
                    <br>
                    <small class="text-muted">Created: ${formatDate(vendor.createdAt)}</small>
                </td>
                <td>${vendor.cuisine || 'Mixed'}</td>
                <td>${vendor.location || 'Not specified'}</td>
                <td>
                    <span class="score-badge" style="background-color: ${hygieneColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${vendor.hygieneScore || 'N/A'}/10
                    </span>
                </td>
                <td>
                    <span class="badge bg-success">Active</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editVendor('${vendor.id}')">
                            Edit
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteVendor('${vendor.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            `;
            
            vendorsTableBody.appendChild(row);
        });
    }
    
    // Render inquiries
    function renderInquiries() {
        if (userInquiries.length === 0) {
            noInquiriesState.style.display = 'block';
            inquiriesList.style.display = 'none';
            return;
        }
        
        inquiriesList.innerHTML = '';
        noInquiriesState.style.display = 'none';
        inquiriesList.style.display = 'block';
        
        // Show only recent inquiries (last 10)
        const recentInquiries = userInquiries.slice(0, 10);
        
        recentInquiries.forEach(inquiry => {
            const inquiryDiv = document.createElement('div');
            inquiryDiv.className = 'border-bottom pb-3 mb-3';
            
            inquiryDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">
                            Inquiry for: <strong>${inquiry.vendorName}</strong>
                        </h6>
                        <p class="mb-1">
                            <strong>From:</strong> ${inquiry.inquirerName} (${inquiry.inquirerEmail})
                        </p>
                        <p class="mb-2">${inquiry.message}</p>
                        <small class="text-muted">
                            Received: ${formatDate(inquiry.timestamp)}
                        </small>
                    </div>
                    <div class="ms-3">
                        <span class="badge ${inquiry.status === 'new' ? 'bg-primary' : 'bg-secondary'}">
                            ${inquiry.status || 'new'}
                        </span>
                    </div>
                </div>
            `;
            
            inquiriesList.appendChild(inquiryDiv);
        });
        
        // Add "View All" link if there are more inquiries
        if (userInquiries.length > 10) {
            const viewAllDiv = document.createElement('div');
            viewAllDiv.className = 'text-center pt-3';
            viewAllDiv.innerHTML = `
                <button class="btn btn-outline-primary" onclick="showAllInquiries()">
                    View All ${userInquiries.length} Inquiries
                </button>
            `;
            inquiriesList.appendChild(viewAllDiv);
        }
    }
    
    // Edit vendor function (global)
    window.editVendor = function(vendorId) {
        const vendor = userVendors.find(v => v.id === vendorId);
        if (!vendor) return;
        
        // Populate edit form
        document.getElementById('edit-vendor-id').value = vendorId;
        document.getElementById('edit-vendor-name').value = vendor.name || '';
        document.getElementById('edit-cuisine').value = vendor.cuisine || '';
        document.getElementById('edit-hygiene-score').value = vendor.hygieneScore || '';
        document.getElementById('edit-location').value = vendor.location || '';
        document.getElementById('edit-contact-phone').value = vendor.contactPhone || '';
        document.getElementById('edit-contact-email').value = vendor.contactEmail || '';
        document.getElementById('edit-description').value = vendor.description || '';
        document.getElementById('edit-operating-hours').value = vendor.operatingHours || '';
        document.getElementById('edit-price-range').value = vendor.priceRange || '';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editVendorModal'));
        modal.show();
    };
    
    // Delete vendor function (global)
    window.deleteVendor = function(vendorId) {
        const vendor = userVendors.find(v => v.id === vendorId);
        if (!vendor) return;
        
        // Populate delete confirmation
        document.getElementById('delete-vendor-info').innerHTML = `
            <strong>Vendor Name:</strong> ${vendor.name}<br>
            <strong>Cuisine:</strong> ${vendor.cuisine}<br>
            <strong>Location:</strong> ${vendor.location}
        `;
        
        // Store vendor ID for deletion
        document.getElementById('deleteConfirmModal').setAttribute('data-vendor-id', vendorId);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    };
    
    // Save vendor changes
    async function saveVendorChanges() {
        const saveBtn = document.getElementById('save-vendor-btn');
        showLoading(saveBtn, true);
        
        try {
            const vendorId = document.getElementById('edit-vendor-id').value;
            const form = document.getElementById('edit-vendor-form');
            
            // Validate form
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                showAlert('Please fill in all required fields correctly.', 'danger');
                return;
            }
            
            // Collect form data
            const updatedVendor = {
                name: document.getElementById('edit-vendor-name').value.trim(),
                cuisine: document.getElementById('edit-cuisine').value,
                hygieneScore: parseInt(document.getElementById('edit-hygiene-score').value),
                location: document.getElementById('edit-location').value.trim(),
                contactPhone: document.getElementById('edit-contact-phone').value.trim(),
                contactEmail: document.getElementById('edit-contact-email').value.trim(),
                description: document.getElementById('edit-description').value.trim(),
                operatingHours: document.getElementById('edit-operating-hours').value.trim(),
                priceRange: document.getElementById('edit-price-range').value,
                updatedAt: new Date().toISOString()
            };
            
            // Update in Firebase
            await window.db.ref(`vendors/${vendorId}`).update(updatedVendor);
            
            showAlert('Vendor updated successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editVendorModal'));
            modal.hide();
            
            // Refresh data
            loadDashboardData();
            
        } catch (error) {
            console.error('Error updating vendor:', error);
            showAlert('Error updating vendor: ' + error.message, 'danger');
        } finally {
            showLoading(saveBtn, false);
        }
    }
    
    // Confirm delete vendor
    async function confirmDeleteVendor() {
        const deleteBtn = document.getElementById('confirm-delete-btn');
        showLoading(deleteBtn, true);
        
        try {
            const modal = document.getElementById('deleteConfirmModal');
            const vendorId = modal.getAttribute('data-vendor-id');
            
            if (!vendorId) {
                throw new Error('Vendor ID not found');
            }
            
            // Delete from Firebase
            await window.db.ref(`vendors/${vendorId}`).remove();
            
            showAlert('Vendor deleted successfully!', 'success');
            
            // Close modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Refresh data
            loadDashboardData();
            
        } catch (error) {
            console.error('Error deleting vendor:', error);
            showAlert('Error deleting vendor: ' + error.message, 'danger');
        } finally {
            showLoading(deleteBtn, false);
        }
    }
    
    // Handle logout
    function handleLogout(e) {
        e.preventDefault();
        
        if (window.auth) {
            window.auth.signOut().then(() => {
                showAlert('Logged out successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }).catch((error) => {
                console.error('Logout error:', error);
                showAlert('Error logging out: ' + error.message, 'danger');
            });
        }
    }
    
    // Toggle between card and table view
    function toggleView() {
        if (currentView === 'card') {
            vendorsCards.style.display = 'flex';
            vendorsTable.style.display = 'none';
            renderVendorCards();
        } else {
            vendorsCards.style.display = 'none';
            vendorsTable.style.display = 'block';
            renderVendorTable();
        }
    }
    
    // Show all inquiries function (global)
    window.showAllInquiries = function() {
        // This could open a modal or navigate to a dedicated inquiries page
        // For now, we'll just render all inquiries
        inquiriesList.innerHTML = '';
        
        userInquiries.forEach(inquiry => {
            const inquiryDiv = document.createElement('div');
            inquiryDiv.className = 'border-bottom pb-3 mb-3';
            
            inquiryDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">
                            Inquiry for: <strong>${inquiry.vendorName}</strong>
                        </h6>
                        <p class="mb-1">
                            <strong>From:</strong> ${inquiry.inquirerName} (${inquiry.inquirerEmail})
                        </p>
                        <p class="mb-2">${inquiry.message}</p>
                        <small class="text-muted">
                            Received: ${formatDate(inquiry.timestamp)}
                        </small>
                    </div>
                    <div class="ms-3">
                        <span class="badge ${inquiry.status === 'new' ? 'bg-primary' : 'bg-secondary'}">
                            ${inquiry.status || 'new'}
                        </span>
                    </div>
                </div>
            `;
            
            inquiriesList.appendChild(inquiryDiv);
        });
    };
    
    // Utility functions
    function getHygieneScoreColor(score) {
        if (!score) return '#6c757d';
        
        if (score >= 8) return '#198754'; // Green
        if (score >= 6) return '#ffc107'; // Yellow
        if (score >= 4) return '#fd7e14'; // Orange
        return '#dc3545'; // Red
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    function showLoadingState() {
        hideAllStates();
        if (loadingState) loadingState.style.display = 'block';
    }
    
    function showDashboardContent() {
        hideAllStates();
        if (dashboardStats) dashboardStats.style.display = 'flex';
        if (inquiriesSection) inquiriesSection.style.display = 'block';
    }
    
    function showVendorsSection() {
        if (vendorsSection) vendorsSection.style.display = 'block';
        if (noVendorsState) noVendorsState.style.display = 'none';
    }
    
    function showNoVendorsState() {
        if (vendorsSection) vendorsSection.style.display = 'block';
        if (vendorsCards) vendorsCards.style.display = 'none';
        if (vendorsTable) vendorsTable.style.display = 'none';
        if (noVendorsState) noVendorsState.style.display = 'block';
    }
    
    function hideAllStates() {
        const states = [loadingState];
        states.forEach(state => {
            if (state) state.style.display = 'none';
        });
    }
    
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
        
        // Auto-remove success alerts after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }
    
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
        }, 2000);
    }
    
})();

// Export for testing
window.StreetFoodConnect = window.StreetFoodConnect || {};
window.StreetFoodConnect.dashboard = {
    getCurrentUser: function() {
        return currentUser;
    },
    
    getUserVendors: function() {
        return userVendors || [];
    }
};
