// contact.js
// StreetFoodConnect Contact JavaScript
// Handles contact form submission and Firebase integration

(function() {
    'use strict';
    
    let contactForm;
    let submitButton;
    let alertContainer;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Contact page loaded');
        
        // Initialize form elements
        contactForm = document.getElementById('contact-form');
        submitButton = document.getElementById('submit-btn');
        alertContainer = document.getElementById('alert-container');
        
        if (contactForm) {
            initializeForm();
            setupFormValidation();
            prefillUserData();
        }
    });
    
    // Initialize form functionality
    function initializeForm() {
        // Add form submission handler
        contactForm.addEventListener('submit', handleFormSubmission);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
        
        // Add phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhoneNumber);
        }
        
        // Add character counter for message
        const messageTextarea = document.getElementById('message');
        if (messageTextarea) {
            addCharacterCounter(messageTextarea);
        }
        
        console.log('Contact form initialized');
    }
    
    // Setup form validation
    function setupFormValidation() {
        // Custom validation messages
        const validationMessages = {
            name: 'Please enter your full name (2-50 characters)',
            email: 'Please enter a valid email address',
            subject: 'Please select a subject for your message',
            message: 'Please provide your message (minimum 10 characters)'
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
    
    // Prefill user data if logged in
    function prefillUserData() {
        // Wait for Firebase to initialize
        setTimeout(() => {
            if (window.currentUser && window.isUserLoggedIn) {
                const emailField = document.getElementById('email');
                if (emailField && !emailField.value) {
                    emailField.value = window.currentUser.email;
                }
                
                showAlert('Welcome back! Your email has been pre-filled.', 'info');
            }
        }, 1000);
    }
    
    // Add character counter to textarea
    function addCharacterCounter(textarea) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'text-muted small mt-1';
        counterDiv.id = 'message-counter';
        textarea.parentNode.appendChild(counterDiv);
        
        const updateCounter = () => {
            const currentLength = textarea.value.length;
            const minLength = 10;
            const maxLength = 1000;
            
            counterDiv.textContent = `${currentLength}/${maxLength} characters`;
            
            if (currentLength < minLength) {
                counterDiv.className = 'text-danger small mt-1';
                counterDiv.textContent += ` (minimum ${minLength} required)`;
            } else if (currentLength > maxLength * 0.9) {
                counterDiv.className = 'text-warning small mt-1';
            } else {
                counterDiv.className = 'text-success small mt-1';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
    
    // Handle form submission
    async function handleFormSubmission(e) {
        e.preventDefault();
        
        // Show loading state
        showLoading(submitButton, true);
        clearAlerts();
        
        try {
            // Validate form
            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
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
            
            // Prepare contact data for Firebase
            const contactData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                subject: formData.subject,
                organization: formData.organization || '',
                message: formData.message,
                newsletter: formData.newsletter || false,
                timestamp: new Date().toISOString(),
                status: 'new',
                userAgent: navigator.userAgent,
                userId: window.currentUser ? window.currentUser.uid : null
            };
            
            // Save to Firebase
            await saveContactToFirebase(contactData);
            
            // Show success message
            showAlert('Message sent successfully! 🎉<br>We\'ll get back to you within 24 hours.', 'success');
            
            // Reset form after successful submission
            setTimeout(() => {
                contactForm.reset();
                contactForm.classList.remove('was-validated');
                
                // Reset character counter
                const messageCounter = document.getElementById('message-counter');
                if (messageCounter) {
                    messageCounter.textContent = '0/1000 characters (minimum 10 required)';
                    messageCounter.className = 'text-danger small mt-1';
                }
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 2000);
            
        } catch (error) {
            console.error('Contact form submission error:', error);
            showAlert('Failed to send message: ' + error.message, 'danger');
        } finally {
            showLoading(submitButton, false);
        }
    }
    
    // Collect form data
    function collectFormData() {
        const formData = new FormData(contactForm);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key === 'newsletter') {
                data[key] = true; // Checkbox is checked if present in FormData
            } else {
                data[key] = value.toString().trim();
            }
        }
        
        // Handle newsletter checkbox if not checked
        if (!data.newsletter) {
            data.newsletter = false;
        }
        
        return data;
    }
    
    // Validate form data
    function validateFormData(data) {
        const errors = [];
        
        // Required field validation
        const requiredFields = ['name', 'email', 'subject', 'message'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field] === '') {
                errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            }
        });
        
        // Name validation
        if (data.name && (data.name.length < 2 || data.name.length > 50)) {
            errors.push('Name must be between 2 and 50 characters');
        }
        
        // Email validation
        if (data.email && !validateEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Phone number validation (if provided)
        if (data.phone && !isValidPhoneNumber(data.phone)) {
            errors.push('Please enter a valid phone number');
        }
        
        // Message validation
        if (data.message && data.message.length < 10) {
            errors.push('Message must be at least 10 characters long');
        }
        
        if (data.message && data.message.length > 1000) {
            errors.push('Message must be less than 1000 characters');
        }
        
        return errors;
    }
    
    // Save contact data to Firebase
    async function saveContactToFirebase(contactData) {
        if (!window.db) {
            throw new Error('Firebase database not initialized');
        }
        
        try {
            // Generate a unique key for the contact message
            const contactRef = window.db.ref('contacts').push();
            
            // Save contact data
            await contactRef.set(contactData);
            
            console.log('Contact message saved to Firebase with ID:', contactRef.key);
            return contactRef.key;
            
        } catch (error) {
            console.error('Firebase save error:', error);
            throw new Error('Failed to save contact message: ' + error.message);
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
            case 'name':
                isValid = value.length >= 2 && value.length <= 50;
                errorMessage = 'Name must be between 2 and 50 characters';
                break;
                
            case 'email':
                isValid = validateEmail(value);
                errorMessage = 'Please enter a valid email address';
                break;
                
            case 'phone':
                if (value) { // Phone is optional
                    isValid = isValidPhoneNumber(value);
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
                
            case 'message':
                isValid = value.length >= 10 && value.length <= 1000;
                if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters long';
                } else if (value.length > 1000) {
                    errorMessage = 'Message must be less than 1000 characters';
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
    
    // Validate phone number format
    function isValidPhoneNumber(phone) {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Check if it's a valid phone number (10-15 digits)
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
        } else {
            // International format
            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{0,5})/, '+$1 $2-$3');
            }
        }
        
        e.target.value = value;
    }
    
    // Email validation function
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
        
        // Auto-remove success/info alerts after 7 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 7000);
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
            button.innerHTML = '<span class="loading-spinner"></span> Sending...';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }
    
    // Handle page unload (warn about unsaved changes)
    window.addEventListener('beforeunload', function(e) {
        if (contactForm && isFormDirty()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
    // Check if form has unsaved changes
    function isFormDirty() {
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        for (let input of inputs) {
            if (input.type === 'checkbox') {
                if (input.checked !== input.defaultChecked) return true;
            } else if (input.value !== input.defaultValue) {
                return true;
            }
        }
        return false;
    }
    
    // Auto-save form data to localStorage
    function autoSaveFormData() {
        const formData = collectFormData();
        localStorage.setItem('streetfood_contact_draft', JSON.stringify(formData));
    }
    
    // Restore form data from localStorage
    function restoreFormData() {
        const savedData = localStorage.getItem('streetfood_contact_draft');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Restore form fields
                Object.keys(data).forEach(key => {
                    const field = document.getElementById(key);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key];
                        } else {
                            field.value = data[key];
                        }
                    }
                });
                
                showAlert('Your previous draft has been restored.', 'info');
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
    }
    
    // Clear saved form data
    function clearSavedFormData() {
        localStorage.removeItem('streetfood_contact_draft');
    }
    
    // Setup auto-save functionality
    setTimeout(() => {
        if (contactForm) {
            // Restore previous draft
            restoreFormData();
            
            // Auto-save every 30 seconds
            setInterval(autoSaveFormData, 30000);
            
            // Save on form input
            contactForm.addEventListener('input', debounce(autoSaveFormData, 2000));
            
            // Clear saved data on successful submission
            contactForm.addEventListener('submit', () => {
                setTimeout(clearSavedFormData, 3000);
            });
        }
    }, 1000);
    
    // Debounce function
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
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (contactForm) {
                contactForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to clear alerts
        if (e.key === 'Escape') {
            clearAlerts();
        }
    });
    
})();

// Export for testing purposes
window.StreetFoodConnect = window.StreetFoodConnect || {};
window.StreetFoodConnect.contact = {
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhoneNumber: function(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }
};
