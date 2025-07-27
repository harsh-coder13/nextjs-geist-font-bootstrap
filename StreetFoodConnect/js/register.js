// register.js
// StreetFoodConnect Vendor Registration JavaScript
// Handles vendor registration form submission and Firebase integration

(function() {
    'use strict';
    
    let registrationForm;
    let submitButton;
    let alertContainer;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Vendor Registration page loaded');
        
        // Initialize form elements
        registrationForm = document.getElementById('vendor-registration-form');
        submitButton = document.getElementById('submit-btn');
        alertContainer = document.getElementById('alert-container');
        
        if (registrationForm) {
            initializeForm();
            setupFormValidation();
            setupImagePreview();
        }
    });
    
    // Initialize form functionality
    function initializeForm() {
        // Add form submission handler
        registrationForm.addEventListener('submit', handleFormSubmission);
        
        // Add real-time validation
        const inputs = registrationForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
        
        // Add phone number formatting
        const phoneInput = document.getElementById('contactPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhoneNumber);
        }
        
        // Add file size validation
        const imageInput = document.getElementById('vendorImage');
        if (imageInput) {
            imageInput.addEventListener('change', validateImageFile);
        }
        
        console.log('Registration form initialized');
    }
    
    // Setup form validation
    function setupFormValidation() {
        // Custom validation messages
        const validationMessages = {
            vendorName: 'Please enter a valid vendor name (2-50 characters)',
            cuisine: 'Please select a cuisine type',
            hygieneScore: 'Please select a hygiene score between 1-10',
            location: 'Please enter your location (city, state)',
            contactPhone: 'Please enter a valid phone number',
            contactEmail: 'Please enter a valid email address',
            agreeTerms: 'You must agree to the terms and conditions'
        };
        
        // Set custom validation messages
        Object.keys(validationMessages).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('invalid', function() {
                    this.setCustomValidity(validationMessages[fieldName]);
                });
                
                field.addEventListener('input', function() {
                    this.setCustomValidity('');
                });
            }
        });
    }
    
    // Setup image preview functionality
    function setupImagePreview() {
        const imageInput = document.getElementById('vendorImage');
        if (!imageInput) return;
        
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.id = 'image-preview-container';
        previewContainer.className = 'mt-2';
        previewContainer.style.display = 'none';
        
        imageInput.parentNode.appendChild(previewContainer);
        
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                displayImagePreview(file, previewContainer);
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
    
    // Display image preview
    function displayImagePreview(file, container) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            container.innerHTML = `
                <div class="card" style="max-width: 200px;">
                    <img src="${e.target.result}" class="card-img-top" alt="Preview" style="height: 150px; object-fit: cover;">
                    <div class="card-body p-2">
                        <small class="text-muted">${file.name}</small>
                        <br>
                        <small class="text-muted">${formatFileSize(file.size)}</small>
                    </div>
                </div>
            `;
            container.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Format file size for display
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Handle form submission
    async function handleFormSubmission(e) {
        e.preventDefault();
        
        // Show loading state
        showLoading(submitButton, true);
        clearAlerts();
        
        try {
            // Validate form
            if (!registrationForm.checkValidity()) {
                registrationForm.classList.add('was-validated');
                showAlert('Please fill in all required fields correctly.', 'danger');
                return;
            }
            
            // Collect form data
            const formData = collectFormData();
            
            // Validate form data
            const validationErrors = validateFormData(formData);
            if (validationErrors.length > 0) {
                showAlert('Please correct the following errors:<br>• ' + validationErrors.join('<br>• '), 'danger');
                return;
            }
            
            // Handle image upload if present
            let imageUrl = '🍛'; // Default emoji if no image
            const imageFile = document.getElementById('vendorImage').files[0];
            if (imageFile) {
                imageUrl = await handleImageUpload(imageFile);
            }
            
            // Prepare vendor data for Firebase
            const vendorData = {
                name: formData.vendorName,
                cuisine: formData.cuisine,
                hygieneScore: parseInt(formData.hygieneScore),
                location: formData.location,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail || '',
                description: formData.description || '',
                operatingHours: formData.operatingHours || '',
                priceRange: formData.priceRange || '',
                imageUrl: imageUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active',
                userId: window.currentUser ? window.currentUser.uid : 'anonymous-' + Date.now()
            };
            
            // Save to Firebase
            await saveVendorToFirebase(vendorData);
            
            // Show success message
            showAlert('Vendor registered successfully! 🎉', 'success');
            
            // Reset form after successful submission
            setTimeout(() => {
                registrationForm.reset();
                registrationForm.classList.remove('was-validated');
                document.getElementById('image-preview-container').style.display = 'none';
                
                // Redirect to vendor list or dashboard
                setTimeout(() => {
                    if (window.isUserLoggedIn) {
                        window.location.href = 'dashboard.html?message=Vendor registered successfully!&type=success';
                    } else {
                        window.location.href = 'vendor-list.html?message=Vendor registered successfully!&type=success';
                    }
                }, 2000);
            }, 1000);
            
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Registration failed: ' + error.message, 'danger');
        } finally {
            showLoading(submitButton, false);
        }
    }
    
    // Collect form data
    function collectFormData() {
        const formData = new FormData(registrationForm);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key !== 'vendorImage') { // Handle image separately
                data[key] = value.toString().trim();
            }
        }
        
        return data;
    }
    
    // Validate form data
    function validateFormData(data) {
        const errors = [];
        
        // Required field validation
        const requiredFields = ['vendorName', 'cuisine', 'hygieneScore', 'location', 'contactPhone'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field] === '') {
                errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
            }
        });
        
        // Vendor name validation
        if (data.vendorName && (data.vendorName.length < 2 || data.vendorName.length > 50)) {
            errors.push('Vendor name must be between 2 and 50 characters');
        }
        
        // Hygiene score validation
        if (data.hygieneScore) {
            const score = parseInt(data.hygieneScore);
            if (isNaN(score) || score < 1 || score > 10) {
                errors.push('Hygiene score must be between 1 and 10');
            }
        }
        
        // Phone number validation
        if (data.contactPhone && !isValidPhoneNumber(data.contactPhone)) {
            errors.push('Please enter a valid phone number');
        }
        
        // Email validation (if provided)
        if (data.contactEmail && !validateEmail(data.contactEmail)) {
            errors.push('Please enter a valid email address');
        }
        
        // Terms agreement validation
        if (!data.agreeTerms) {
            errors.push('You must agree to the terms and conditions');
        }
        
        return errors;
    }
    
    // Validate phone number format
    function isValidPhoneNumber(phone) {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Check if it's a valid Indian phone number (10 digits) or international format
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }
    
    // Format phone number as user types
    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Format as Indian phone number
        if (value.length <= 10) {
            if (value.length > 5) {
                value = value.replace(/(\d{5})(\d{0,5})/, '$1-$2');
            }
        }
        
        e.target.value = value;
    }
    
    // Validate image file
    function validateImageFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (file.size > maxSize) {
            showAlert('Image file size must be less than 5MB', 'warning');
            e.target.value = '';
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showAlert('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'warning');
            e.target.value = '';
            return false;
        }
        
        return true;
    }
    
    // Handle image upload (convert to base64 for simplicity)
    async function handleImageUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // For demo purposes, we'll use base64
                // In production, you might want to upload to Firebase Storage
                resolve(e.target.result);
            };
            
            reader.onerror = function() {
                reject(new Error('Failed to read image file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Save vendor data to Firebase
    async function saveVendorToFirebase(vendorData) {
        if (!window.db) {
            throw new Error('Firebase database not initialized');
        }
        
        try {
            // Generate a unique key for the vendor
            const vendorRef = window.db.ref('vendors').push();
            
            // Save vendor data
            await vendorRef.set(vendorData);
            
            console.log('Vendor saved to Firebase with ID:', vendorRef.key);
            return vendorRef.key;
            
        } catch (error) {
            console.error('Firebase save error:', error);
            throw new Error('Failed to save vendor data: ' + error.message);
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
        let errorMessage = '';
        
        switch (field.id) {
            case 'vendorName':
                isValid = value.length >= 2 && value.length <= 50;
                errorMessage = 'Vendor name must be between 2 and 50 characters';
                break;
                
            case 'contactPhone':
                isValid = isValidPhoneNumber(value);
                errorMessage = 'Please enter a valid phone number';
                break;
                
            case 'contactEmail':
                if (value) { // Email is optional
                    isValid = validateEmail(value);
                    errorMessage = 'Please enter a valid email address';
                }
                break;
        }
        
        // Show validation feedback
        if (!isValid && value) {
            field.classList.add('is-invalid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = errorMessage;
            }
        }
    }
    
    // Clear field error styling
    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('is-invalid');
        field.setCustomValidity('');
    }
    
    // Show alert message
    function showAlert(message, type = 'info') {
        if (!alertContainer) return;
        
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
            button.innerHTML = '<span class="loading-spinner"></span> Registering...';
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
    
    // Handle page unload (warn about unsaved changes)
    window.addEventListener('beforeunload', function(e) {
        if (registrationForm && isFormDirty()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
    // Check if form has unsaved changes
    function isFormDirty() {
        const inputs = registrationForm.querySelectorAll('input, select, textarea');
        for (let input of inputs) {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked !== input.defaultChecked) return true;
            } else if (input.value !== input.defaultValue) {
                return true;
            }
        }
        return false;
    }
    
})();

// Export for testing purposes
window.StreetFoodConnect = window.StreetFoodConnect || {};
window.StreetFoodConnect.register = {
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhoneNumber: function(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }
};
