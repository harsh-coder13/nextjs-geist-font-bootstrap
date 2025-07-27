// vendor-list.js
// StreetFoodConnect Vendor List JavaScript
// Handles vendor display, filtering, and search functionality

(function() {
    'use strict';
    
    // Global variables
    let allVendors = [];
    let filteredVendors = [];
    let currentViewMode = 'grid';
    
    // DOM elements
    let vendorsContainer;
    let loadingState;
    let errorState;
    let noVendorsState;
    let vendorsStats;
    let totalCountSpan;
    let showingCountSpan;
    
    // Filter elements
    let cityFilter;
    let cuisineFilter;
    let hygieneFilter;
    let searchInput;
    let sortBySelect;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Vendor List page loaded');
        
        initializeElements();
        setupEventListeners();
        loadVendors();
    });
    
    // Initialize DOM elements
    function initializeElements() {
        vendorsContainer = document.getElementById('vendors-container');
        loadingState = document.getElementById('loading-state');
        errorState = document.getElementById('error-state');
        noVendorsState = document.getElementById('no-vendors');
        vendorsStats = document.getElementById('vendors-stats');
        totalCountSpan = document.getElementById('total-count');
        showingCountSpan = document.getElementById('showing-count');
        
        // Filter elements
        cityFilter = document.getElementById('cityFilter');
        cuisineFilter = document.getElementById('cuisineFilter');
        hygieneFilter = document.getElementById('hygieneFilter');
        searchInput = document.getElementById('searchInput');
        sortBySelect = document.getElementById('sortBy');
        
        console.log('DOM elements initialized');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Filter event listeners
        cityFilter.addEventListener('change', applyFilters);
        cuisineFilter.addEventListener('change', applyFilters);
        hygieneFilter.addEventListener('change', applyFilters);
        sortBySelect.addEventListener('change', applyFilters);
        
        // Search functionality
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        document.getElementById('search-btn').addEventListener('click', applyFilters);
        
        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', clearAllFilters);
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', refreshVendors);
        
        // Retry button
        document.getElementById('retry-btn').addEventListener('click', loadVendors);
        
        // View mode toggle
        document.getElementById('grid-view').addEventListener('change', function() {
            if (this.checked) {
                currentViewMode = 'grid';
                renderVendors(filteredVendors);
            }
        });
        
        document.getElementById('list-view').addEventListener('change', function() {
            if (this.checked) {
                currentViewMode = 'list';
                renderVendors(filteredVendors);
            }
        });
        
        // Contact vendor modal
        document.getElementById('send-inquiry').addEventListener('click', sendVendorInquiry);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('Event listeners setup complete');
    }
    
    // Load vendors from Firebase
    async function loadVendors() {
        showLoadingState();
        
        try {
            if (!window.db) {
                throw new Error('Firebase database not initialized');
            }
            
            const vendorsRef = window.db.ref('vendors');
            
            vendorsRef.on('value', function(snapshot) {
                const vendorsData = snapshot.val();
                
                if (vendorsData) {
                    // Convert Firebase object to array
                    allVendors = Object.keys(vendorsData).map(key => ({
                        id: key,
                        ...vendorsData[key]
                    }));
                    
                    console.log(`Loaded ${allVendors.length} vendors from Firebase`);
                    
                    // Initialize filters with available data
                    populateFilterOptions();
                    
                    // Apply initial filters and display
                    filteredVendors = [...allVendors];
                    applyFilters();
                    
                    showVendorsState();
                } else {
                    // No vendors found
                    allVendors = [];
                    filteredVendors = [];
                    showNoVendorsState();
                }
            }, function(error) {
                console.error('Firebase read error:', error);
                showErrorState();
            });
            
        } catch (error) {
            console.error('Load vendors error:', error);
            showErrorState();
        }
    }
    
    // Populate filter dropdown options based on available data
    function populateFilterOptions() {
        // Get unique cities
        const cities = [...new Set(allVendors.map(vendor => {
            const location = vendor.location || '';
            return location.split(',')[0].trim(); // Get city part
        }).filter(city => city))].sort();
        
        // Get unique cuisines
        const cuisines = [...new Set(allVendors.map(vendor => vendor.cuisine).filter(cuisine => cuisine))].sort();
        
        // Populate city filter
        cityFilter.innerHTML = '<option value="">All Cities</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
        
        // Populate cuisine filter
        cuisineFilter.innerHTML = '<option value="">All Cuisines</option>';
        cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineFilter.appendChild(option);
        });
        
        console.log(`Filter options populated: ${cities.length} cities, ${cuisines.length} cuisines`);
    }
    
    // Apply all filters and search
    function applyFilters() {
        let filtered = [...allVendors];
        
        // Apply city filter
        const selectedCity = cityFilter.value;
        if (selectedCity) {
            filtered = filtered.filter(vendor => 
                vendor.location && vendor.location.toLowerCase().includes(selectedCity.toLowerCase())
            );
        }
        
        // Apply cuisine filter
        const selectedCuisine = cuisineFilter.value;
        if (selectedCuisine) {
            filtered = filtered.filter(vendor => vendor.cuisine === selectedCuisine);
        }
        
        // Apply hygiene filter
        const minHygiene = hygieneFilter.value;
        if (minHygiene) {
            filtered = filtered.filter(vendor => 
                vendor.hygieneScore && vendor.hygieneScore >= parseInt(minHygiene)
            );
        }
        
        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(vendor => {
                const searchableText = [
                    vendor.name || '',
                    vendor.location || '',
                    vendor.cuisine || '',
                    vendor.description || ''
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            });
        }
        
        // Apply sorting
        const sortBy = sortBySelect.value;
        filtered = sortVendors(filtered, sortBy);
        
        filteredVendors = filtered;
        renderVendors(filteredVendors);
        updateStats();
        
        console.log(`Filters applied: ${filteredVendors.length} vendors shown`);
    }
    
    // Sort vendors based on selected criteria
    function sortVendors(vendors, sortBy) {
        const sorted = [...vendors];
        
        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                
            case 'hygiene':
                return sorted.sort((a, b) => (b.hygieneScore || 0) - (a.hygieneScore || 0));
                
            case 'location':
                return sorted.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
                
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
                
            default:
                return sorted;
        }
    }
    
    // Render vendors in the container
    function renderVendors(vendors) {
        if (!vendorsContainer) return;
        
        vendorsContainer.innerHTML = '';
        
        if (vendors.length === 0) {
            showNoVendorsState();
            return;
        }
        
        vendors.forEach(vendor => {
            const vendorCard = createVendorCard(vendor);
            vendorsContainer.appendChild(vendorCard);
        });
        
        // Add animation to cards
        animateCards();
    }
    
    // Create vendor card element
    function createVendorCard(vendor) {
        const cardDiv = document.createElement('div');
        cardDiv.className = currentViewMode === 'grid' ? 'col-lg-4 col-md-6 mb-4' : 'col-12 mb-3';
        
        const hygieneColor = getHygieneScoreColor(vendor.hygieneScore);
        const imageDisplay = vendor.imageUrl && vendor.imageUrl.startsWith('data:') 
            ? `<img src="${vendor.imageUrl}" class="vendor-image" alt="${vendor.name}">`
            : `<div class="vendor-image">${vendor.imageUrl || '🍛'}</div>`;
        
        if (currentViewMode === 'grid') {
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
                        
                        ${vendor.description ? `
                            <p class="text-muted small mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${vendor.description}
                            </p>
                        ` : ''}
                        
                        ${vendor.operatingHours ? `
                            <p class="text-muted small mb-2">
                                🕒 ${vendor.operatingHours}
                            </p>
                        ` : ''}
                        
                        ${vendor.priceRange ? `
                            <p class="text-muted small mb-3">
                                💰 ${vendor.priceRange}
                            </p>
                        ` : ''}
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill" onclick="contactVendor('${vendor.id}')">
                                Contact
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="viewVendorDetails('${vendor.id}')">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // List view
            cardDiv.innerHTML = `
                <div class="card vendor-card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2 text-center">
                                <div style="font-size: 2rem;">${vendor.imageUrl && !vendor.imageUrl.startsWith('data:') ? vendor.imageUrl : '🍛'}</div>
                            </div>
                            <div class="col-md-6">
                                <h5 class="vendor-name mb-1">${vendor.name || 'Unknown Vendor'}</h5>
                                <span class="vendor-cuisine">${vendor.cuisine || 'Mixed'}</span>
                                <p class="text-muted mb-1">📍 ${vendor.location || 'Location not specified'}</p>
                                ${vendor.operatingHours ? `<p class="text-muted small mb-0">🕒 ${vendor.operatingHours}</p>` : ''}
                            </div>
                            <div class="col-md-2 text-center">
                                <div class="hygiene-score">
                                    <span class="score-badge" style="background-color: ${hygieneColor}">
                                        ${vendor.hygieneScore || 'N/A'}/10
                                    </span>
                                    <br>
                                    <small class="text-muted">Hygiene</small>
                                </div>
                            </div>
                            <div class="col-md-2 text-center">
                                <div class="d-flex flex-column gap-1">
                                    <button class="btn btn-primary btn-sm" onclick="contactVendor('${vendor.id}')">
                                        Contact
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm" onclick="viewVendorDetails('${vendor.id}')">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return cardDiv;
    }
    
    // Get color for hygiene score badge
    function getHygieneScoreColor(score) {
        if (!score) return '#6c757d';
        
        if (score >= 8) return '#198754'; // Green
        if (score >= 6) return '#ffc107'; // Yellow
        if (score >= 4) return '#fd7e14'; // Orange
        return '#dc3545'; // Red
    }
    
    // Animate cards on render
    function animateCards() {
        const cards = document.querySelectorAll('.vendor-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    // Contact vendor function (global)
    window.contactVendor = function(vendorId) {
        const vendor = allVendors.find(v => v.id === vendorId);
        if (!vendor) return;
        
        const contactInfo = document.getElementById('vendor-contact-info');
        contactInfo.innerHTML = `
            <div class="card bg-light">
                <div class="card-body">
                    <h6 class="card-title">${vendor.name}</h6>
                    <p class="card-text">
                        <strong>Cuisine:</strong> ${vendor.cuisine}<br>
                        <strong>Location:</strong> ${vendor.location}<br>
                        ${vendor.contactPhone ? `<strong>Phone:</strong> ${vendor.contactPhone}<br>` : ''}
                        ${vendor.contactEmail ? `<strong>Email:</strong> ${vendor.contactEmail}<br>` : ''}
                        ${vendor.operatingHours ? `<strong>Hours:</strong> ${vendor.operatingHours}` : ''}
                    </p>
                </div>
            </div>
        `;
        
        // Store vendor ID for inquiry
        document.getElementById('contactVendorModal').setAttribute('data-vendor-id', vendorId);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('contactVendorModal'));
        modal.show();
    };
    
    // View vendor details function (global)
    window.viewVendorDetails = function(vendorId) {
        const vendor = allVendors.find(v => v.id === vendorId);
        if (!vendor) return;
        
        // Create detailed view (could be a modal or new page)
        const detailsHtml = `
            <div class="modal fade" id="vendorDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${vendor.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-4 text-center">
                                    ${vendor.imageUrl && vendor.imageUrl.startsWith('data:') 
                                        ? `<img src="${vendor.imageUrl}" class="img-fluid rounded" alt="${vendor.name}">`
                                        : `<div style="font-size: 4rem;">${vendor.imageUrl || '🍛'}</div>`
                                    }
                                </div>
                                <div class="col-md-8">
                                    <h6>Vendor Information</h6>
                                    <table class="table table-sm">
                                        <tr><td><strong>Cuisine:</strong></td><td>${vendor.cuisine || 'N/A'}</td></tr>
                                        <tr><td><strong>Location:</strong></td><td>${vendor.location || 'N/A'}</td></tr>
                                        <tr><td><strong>Hygiene Score:</strong></td><td>${vendor.hygieneScore || 'N/A'}/10</td></tr>
                                        <tr><td><strong>Operating Hours:</strong></td><td>${vendor.operatingHours || 'N/A'}</td></tr>
                                        <tr><td><strong>Price Range:</strong></td><td>${vendor.priceRange || 'N/A'}</td></tr>
                                        <tr><td><strong>Phone:</strong></td><td>${vendor.contactPhone || 'N/A'}</td></tr>
                                        <tr><td><strong>Email:</strong></td><td>${vendor.contactEmail || 'N/A'}</td></tr>
                                    </table>
                                </div>
                            </div>
                            ${vendor.description ? `
                                <hr>
                                <h6>Description</h6>
                                <p>${vendor.description}</p>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="contactVendor('${vendor.id}')" data-bs-dismiss="modal">Contact Vendor</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('vendorDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', detailsHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('vendorDetailsModal'));
        modal.show();
        
        // Clean up modal after hiding
        document.getElementById('vendorDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    };
    
    // Send vendor inquiry
    function sendVendorInquiry() {
        const modal = document.getElementById('contactVendorModal');
        const vendorId = modal.getAttribute('data-vendor-id');
        const vendor = allVendors.find(v => v.id === vendorId);
        
        if (!vendor) return;
        
        const inquirerName = document.getElementById('inquirer-name').value.trim();
        const inquirerEmail = document.getElementById('inquirer-email').value.trim();
        const inquiryMessage = document.getElementById('inquiry-message').value.trim();
        
        // Validate form
        if (!inquirerName || !inquirerEmail || !inquiryMessage) {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Please fill in all fields', 'warning');
            }
            return;
        }
        
        if (!validateEmail(inquirerEmail)) {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Please enter a valid email address', 'warning');
            }
            return;
        }
        
        // Prepare inquiry data
        const inquiryData = {
            vendorId: vendorId,
            vendorName: vendor.name,
            inquirerName: inquirerName,
            inquirerEmail: inquirerEmail,
            message: inquiryMessage,
            timestamp: new Date().toISOString(),
            status: 'new'
        };
        
        // Save inquiry to Firebase
        if (window.db) {
            const inquiriesRef = window.db.ref('inquiries').push();
            inquiriesRef.set(inquiryData).then(() => {
                if (typeof window.showAlert === 'function') {
                    window.showAlert('Inquiry sent successfully! The vendor will contact you soon.', 'success');
                }
                
                // Close modal and reset form
                bootstrap.Modal.getInstance(modal).hide();
                document.getElementById('contact-vendor-form').reset();
                
            }).catch((error) => {
                console.error('Error sending inquiry:', error);
                if (typeof window.showAlert === 'function') {
                    window.showAlert('Failed to send inquiry. Please try again.', 'danger');
                }
            });
        }
    }
    
    // Clear all filters
    function clearAllFilters() {
        cityFilter.value = '';
        cuisineFilter.value = '';
        hygieneFilter.value = '';
        searchInput.value = '';
        sortBySelect.value = 'name';
        
        applyFilters();
    }
    
    // Refresh vendors
    function refreshVendors() {
        const refreshIcon = document.getElementById('refresh-icon');
        refreshIcon.style.animation = 'spin 1s linear infinite';
        
        setTimeout(() => {
            loadVendors();
            refreshIcon.style.animation = '';
        }, 1000);
    }
    
    // Update statistics display
    function updateStats() {
        if (totalCountSpan) totalCountSpan.textContent = allVendors.length;
        if (showingCountSpan) showingCountSpan.textContent = filteredVendors.length;
    }
    
    // Show different states
    function showLoadingState() {
        hideAllStates();
        if (loadingState) loadingState.style.display = 'block';
    }
    
    function showVendorsState() {
        hideAllStates();
        if (vendorsStats) vendorsStats.style.display = 'flex';
        if (vendorsContainer) vendorsContainer.style.display = 'flex';
    }
    
    function showNoVendorsState() {
        hideAllStates();
        if (noVendorsState) noVendorsState.style.display = 'block';
    }
    
    function showErrorState() {
        hideAllStates();
        if (errorState) errorState.style.display = 'block';
    }
    
    function hideAllStates() {
        const states = [loadingState, errorState, noVendorsState, vendorsStats];
        states.forEach(state => {
            if (state) state.style.display = 'none';
        });
        if (vendorsContainer) vendorsContainer.style.display = 'none';
    }
    
    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            applyFilters();
        }
    }
    
    // Handle URL parameters for messages
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    
    if (message && type) {
        setTimeout(() => {
            if (typeof window.showAlert === 'function') {
                window.showAlert(decodeURIComponent(message), type);
            }
            
            // Clean up URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }, 1000);
    }
    
})();

// Export for testing
window.StreetFoodConnect = window.StreetFoodConnect || {};
window.StreetFoodConnect.vendorList = {
    getAllVendors: function() {
        return allVendors || [];
    },
    
    getFilteredVendors: function() {
        return filteredVendors || [];
    }
};
