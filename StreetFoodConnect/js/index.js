// index.js
// StreetFoodConnect Homepage JavaScript
// Handles homepage interactions and animations

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('StreetFoodConnect Homepage loaded');
        
        // Initialize homepage features
        initSmoothScrolling();
        initAnimations();
        initStatCounters();
        initCallToActionButtons();
        
        // Check if user is already logged in and update UI accordingly
        setTimeout(checkAuthState, 500);
    });
    
    // Initialize smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Initialize animations and interactive elements
    function initAnimations() {
        // Add intersection observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe feature cards and stat items
        const animatedElements = document.querySelectorAll('.feature-card, .stat-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
        
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Initialize animated counters for statistics
    function initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-item h3');
        
        const animateCounter = (element, target) => {
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Format number with + sign
                const formattedNumber = Math.floor(current);
                element.textContent = formattedNumber + '+';
            }, 20);
        };
        
        // Intersection observer for stat counters
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const targetText = element.textContent;
                    const targetNumber = parseInt(targetText.replace(/\D/g, ''));
                    
                    if (targetNumber && !element.hasAttribute('data-animated')) {
                        element.setAttribute('data-animated', 'true');
                        animateCounter(element, targetNumber);
                    }
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => {
            statsObserver.observe(stat);
        });
    }
    
    // Initialize call-to-action button interactions
    function initCallToActionButtons() {
        const ctaButtons = document.querySelectorAll('.btn[href="register.html"], .btn[href="vendor-list.html"]');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Track button clicks (for analytics if needed)
                const buttonText = this.textContent.trim();
                console.log(`CTA Button clicked: ${buttonText}`);
            });
        });
    }
    
    // Check authentication state and update UI
    function checkAuthState() {
        if (typeof window.isUserLoggedIn !== 'undefined' && window.isUserLoggedIn) {
            updateUIForLoggedInUser();
        }
    }
    
    // Update UI elements for logged-in users
    function updateUIForLoggedInUser() {
        // Update hero section call-to-action for logged-in users
        const heroButtons = document.querySelector('.hero-section .d-flex');
        if (heroButtons && window.currentUser) {
            // Add a personalized message
            const welcomeMessage = document.createElement('p');
            welcomeMessage.className = 'text-white-50 mb-3';
            welcomeMessage.innerHTML = `Welcome back, <strong>${window.currentUser.email}</strong>!`;
            heroButtons.parentNode.insertBefore(welcomeMessage, heroButtons);
            
            // Update button text
            const registerBtn = heroButtons.querySelector('a[href="register.html"]');
            if (registerBtn) {
                registerBtn.textContent = 'Add New Vendor';
            }
        }
        
        // Show dashboard link in features if user is logged in
        addDashboardFeature();
    }
    
    // Add dashboard feature for logged-in users
    function addDashboardFeature() {
        const featuresRow = document.querySelector('.features-section .row.g-4');
        if (featuresRow && window.currentUser) {
            const dashboardFeature = document.createElement('div');
            dashboardFeature.className = 'col-lg-4 col-md-6';
            dashboardFeature.innerHTML = `
                <div class="feature-card h-100">
                    <div class="feature-icon">📊</div>
                    <h4 class="fw-bold mb-3">Your Dashboard</h4>
                    <p class="text-muted mb-3">Manage your vendor profiles and track your registrations.</p>
                    <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
                </div>
            `;
            featuresRow.appendChild(dashboardFeature);
        }
    }
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // Page became visible, refresh auth state
            setTimeout(checkAuthState, 100);
        }
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Handle Enter key on buttons
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
        
        // Handle Escape key to close any open modals or alerts
        if (e.key === 'Escape') {
            const alerts = document.querySelectorAll('.alert-custom');
            alerts.forEach(alert => alert.remove());
        }
    });
    
    // Add scroll-to-top functionality
    function addScrollToTop() {
        const scrollButton = document.createElement('button');
        scrollButton.innerHTML = '↑';
        scrollButton.className = 'btn btn-primary position-fixed';
        scrollButton.style.cssText = `
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: none;
            font-size: 1.2rem;
            font-weight: bold;
        `;
        scrollButton.setAttribute('aria-label', 'Scroll to top');
        
        document.body.appendChild(scrollButton);
        
        // Show/hide scroll button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollButton.style.display = 'block';
            } else {
                scrollButton.style.display = 'none';
            }
        });
        
        // Scroll to top when clicked
        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Initialize scroll-to-top after page load
    window.addEventListener('load', addScrollToTop);
    
    // Handle form submissions from other pages (if redirected back to home)
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
    
    // Add error handling for images
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.style.display = 'none';
            console.log('Image failed to load:', e.target.src);
        }
    }, true);
    
    // Performance monitoring
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page loaded in ${Math.round(loadTime)}ms`);
        
        // Log performance metrics
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                console.log('Performance metrics:', {
                    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                    loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
                });
            }
        }
    });
    
})();

// Export functions for use in other scripts if needed
window.StreetFoodConnect = window.StreetFoodConnect || {};
window.StreetFoodConnect.homepage = {
    checkAuthState: function() {
        // Public method to check auth state
        if (typeof window.isUserLoggedIn !== 'undefined' && window.isUserLoggedIn) {
            console.log('User is logged in:', window.currentUser.email);
            return true;
        }
        return false;
    }
};
