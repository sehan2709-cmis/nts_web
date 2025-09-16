'use strict';

// Global configuration
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 80,
    notificationDuration: 4000,
    language: 'en',
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    }
};

// Utility functions
const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Get device type
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= CONFIG.breakpoints.mobile) return 'mobile';
        if (width <= CONFIG.breakpoints.tablet) return 'tablet';
        return 'desktop';
    },

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Generate unique ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
};

// Mobile Navigation Class
class MobileNavigation {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.body = document.body;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.navToggle || !this.navLinks) return;
        
        this.createMobileToggle();
        this.bindEvents();
    }

    createMobileToggle() {
        if (this.navToggle) return; // Already exists
        
        this.navToggle = document.createElement('button');
        this.navToggle.className = 'nav-toggle';
        this.navToggle.setAttribute('aria-label', 'Toggle navigation');
        this.navToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(this.navToggle);
        }
    }

    bindEvents() {
        this.navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('nav')) {
                this.close();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close menu when clicking nav links
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (Utils.getDeviceType() !== 'mobile' && this.isOpen) {
                this.close();
            }
        }, 250));
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.navToggle.classList.add('active');
        this.navLinks.classList.add('active');
        this.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Accessibility
        this.navToggle.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.navToggle.classList.remove('active');
        this.navLinks.classList.remove('active');
        this.body.style.overflow = '';
        this.isOpen = false;
        
        // Accessibility
        this.navToggle.setAttribute('aria-expanded', 'false');
    }
}

// Scroll Animation Class
class ScrollAnimations {
    constructor() {
        this.animatedElements = new Set();
        this.observer = null;
        this.init();
    }

    init() {
        this.createObserver();
        this.observeElements();
    }

    createObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, options);
    }

    observeElements() {
        const elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in');
        elements.forEach(element => {
            // Set initial state
            element.style.opacity = '0';
            if (element.classList.contains('fade-in-up')) {
                element.style.transform = 'translateY(30px)';
            } else if (element.classList.contains('fade-in-left')) {
                element.style.transform = 'translateX(-30px)';
            } else if (element.classList.contains('fade-in-right')) {
                element.style.transform = 'translateX(30px)';
            } else if (element.classList.contains('scale-in')) {
                element.style.transform = 'scale(0.9)';
            }
            
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(element);
        });
    }

    animateElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) translateX(0) scale(1)';
        
        // Add completion class for custom styling
        setTimeout(() => {
            element.classList.add('animation-complete');
        }, 600);
    }
}

// Smooth Scrolling Class
class SmoothScrolling {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href^="#"]');
            if (!target) return;

            const href = target.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            this.scrollToElement(href);
        });
    }

    scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - CONFIG.scrollOffset;
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Header Scroll Effects Class
class HeaderEffects {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        
        this.init();
    }

    init() {
        if (!this.header) return;
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('scroll', () => {
            this.requestTick();
        });
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateHeader();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateHeader() {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class when scrolled down
        if (currentScrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Hide/show header on scroll direction
        if (currentScrollY > this.lastScrollY && currentScrollY > 300) {
            this.header.style.transform = 'translateY(-100%)';
        } else {
            this.header.style.transform = 'translateY(0)';
        }

        this.lastScrollY = currentScrollY;
    }
}

// Form Validation Class
class FormValidator {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.setupForm(form);
        });
    }

    setupForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            this.setupField(field);
        });

        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                this.showFormErrors(form);
            }
        });
    }

    setupField(field) {
        // Real-time validation
        field.addEventListener('blur', () => {
            this.validateField(field);
        });

        // Email validation on input
        if (field.type === 'email') {
            field.addEventListener('input', Utils.debounce(() => {
                this.validateEmail(field);
            }, 300));
        }

        // Clear errors on focus
        field.addEventListener('focus', () => {
            this.clearFieldError(field);
        });
    }

    validateForm(form) {
        const fields = form.querySelectorAll('[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        let isValid = true;

        // Required field validation
        if (isRequired && !value) {
            this.setFieldError(field, 'This field is required');
            isValid = false;
        }
        // Email validation
        else if (field.type === 'email' && value && !Utils.isValidEmail(value)) {
            this.setFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
        // Phone validation
        else if (field.type === 'tel' && value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
            this.setFieldError(field, 'Please enter a valid phone number');
            isValid = false;
        }
        // Minimum length validation
        else if (field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                this.setFieldError(field, `Minimum ${minLength} characters required`);
                isValid = false;
            }
        }

        if (isValid) {
            this.setFieldSuccess(field);
        }

        return isValid;
    }

    validateEmail(field) {
        const value = field.value.trim();
        
        if (value && !Utils.isValidEmail(value)) {
            field.style.borderColor = '#f59e0b';
            field.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
        } else if (value) {
            this.setFieldSuccess(field);
        }
    }

    setFieldError(field, message) {
        field.classList.add('error');
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        this.removeFieldMessage(field);
        this.addFieldMessage(field, message, 'error');
    }

    setFieldSuccess(field) {
        field.classList.remove('error');
        field.classList.add('success');
        field.style.borderColor = '#10b981';
        field.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        
        this.removeFieldMessage(field);
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        field.style.borderColor = '#e5e7eb';
        field.style.boxShadow = 'none';
        
        this.removeFieldMessage(field);
    }

    addFieldMessage(field, message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `field-message field-message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            color: ${type === 'error' ? '#ef4444' : '#10b981'};
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
        
        field.parentNode.appendChild(messageElement);
    }

    removeFieldMessage(field) {
        const existing = field.parentNode.querySelector('.field-message');
        if (existing) {
            existing.remove();
        }
    }

    showFormErrors(form) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
}

// Notification System Class
class NotificationSystem {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = CONFIG.notificationDuration) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: { bg: '#10b981', border: '#059669' },
            error: { bg: '#ef4444', border: '#dc2626' },
            warning: { bg: '#f59e0b', border: '#d97706' },
            info: { bg: '#7c3aed', border: '#6d28d9' }
        };

        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            border-left: 4px solid ${color.border};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 350px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            line-height: 1.4;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            position: relative;
        `;

        // Add icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.1rem;">${icons[type] || icons.info}</span>
                <span>${Utils.sanitizeHTML(message)}</span>
            </div>
        `;

        // Click to dismiss
        notification.addEventListener('click', () => {
            this.remove(notification);
        });

        return notification;
    }

    remove(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(message) {
        return this.show(message, 'success');
    }

    error(message) {
        return this.show(message, 'error');
    }

    warning(message) {
        return this.show(message, 'warning');
    }

    info(message) {
        return this.show(message, 'info');
    }
}

// Multi-language Support Class
class LanguageSupport {
    constructor() {
        this.currentLanguage = CONFIG.language;
        this.translations = {};
        this.init();
    }

    init() {
        this.loadTranslations();
        this.createLanguageToggle();
        this.bindEvents();
    }

    loadTranslations() {
        // Basic translations for common elements
        this.translations = {
            en: {
                'nav.research': 'Research',
                'nav.team': 'Team',
                'nav.bandi': 'Bandi App',
                'nav.impact': 'Impact Data',
                'nav.partnerships': 'Partnerships',
                'nav.publications': 'Publications',
                'nav.news': 'News',
                'nav.contact': 'Contact',
                'btn.readmore': 'Read More',
                'btn.learnmore': 'Learn More',
                'btn.contact': 'Contact Us',
                'btn.submit': 'Submit',
                'btn.subscribe': 'Subscribe',
                'footer.copyright': '© 2025 Nein to Sick Team. Handong Global University. All rights reserved.',
                'form.required': 'This field is required',
                'form.email.invalid': 'Please enter a valid email address',
                'notification.success': 'Success!',
                'notification.error': 'Error occurred',
                'loading': 'Loading...'
            },
            ko: {
                'nav.research': '연구',
                'nav.team': '팀',
                'nav.bandi': '반디 앱',
                'nav.impact': '임팩트 데이터',
                'nav.partnerships': '파트너십',
                'nav.publications': '출간물',
                'nav.news': '소식',
                'nav.contact': '연락처',
                'btn.readmore': '더 보기',
                'btn.learnmore': '자세히 보기',
                'btn.contact': '문의하기',
                'btn.submit': '제출',
                'btn.subscribe': '구독',
                'footer.copyright': '© 2025 Nein to Sick 팀. 한동대학교. 모든 권리 보유.',
                'form.required': '필수 입력 항목입니다',
                'form.email.invalid': '올바른 이메일 주소를 입력해주세요',
                'notification.success': '성공!',
                'notification.error': '오류가 발생했습니다',
                'loading': '로딩 중...'
            }
        };
    }

    createLanguageToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'language-toggle';
        toggle.innerHTML = this.currentLanguage === 'en' ? '한국어' : 'English';
        toggle.style.cssText = `
            background: none;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 1rem;
        `;

        toggle.addEventListener('click', () => {
            this.toggleLanguage();
        });

        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(toggle);
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ko' : 'en';
        this.updatePageLanguage();
        this.updateLanguageToggle();
        
        // Store preference
        localStorage.setItem('preferred-language', this.currentLanguage);
    }

    updatePageLanguage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update document language
        document.documentElement.lang = this.currentLanguage;
    }

    updateLanguageToggle() {
        const toggle = document.querySelector('.language-toggle');
        if (toggle) {
            toggle.innerHTML = this.currentLanguage === 'en' ? '한국어' : 'English';
        }
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    translate(key) {
        return this.getTranslation(key);
    }
}

// Performance Monitor Class
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.monitorUserInteractions();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
            this.metrics.totalLoadTime = perfData.loadEventEnd - perfData.fetchStart;
            
            console.log('Performance Metrics:', this.metrics);
        });
    }

    monitorUserInteractions() {
        // Track first input delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'first-input') {
                    this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                }
            });
        }).observe({ entryTypes: ['first-input'] });

        // Track largest contentful paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    getMetrics() {
        return this.metrics;
    }
}

// Accessibility Helper Class
class AccessibilityHelper {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #7c3aed;
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-decoration: none;
            z-index: 10000;
            transition: top 0.3s ease;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Ensure main content has ID
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
    }

    setupFocusManagement() {
        // Focus visible indicator
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #7c3aed;
                outline-offset: 2px;
            }
            
            .focus-visible {
                outline: 2px solid #7c3aed;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);

        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    setupAriaLabels() {
        // Add missing aria-labels
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });

        // Add aria-expanded to collapsible elements
        const collapsibleTriggers = document.querySelectorAll('[data-toggle]');
        collapsibleTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
        });
    }

    setupScreenReaderSupport() {
        // Announce page changes
        this.createAnnouncementRegion();
        
        // Live regions for dynamic content
        const liveRegions = document.querySelectorAll('[data-live]');
        liveRegions.forEach(region => {
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'true');
        });
    }

    createAnnouncementRegion() {
        const announcer = document.createElement('div');
        announcer.id = 'announcements';
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(announcer);

        window.announce = (message) => {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        };
    }

    handleTabNavigation(e) {
        const modal = document.querySelector('.modal.active');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
}

// Error Handler Class
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupUnhandledRejectionHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
    }

    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    logError(type, details) {
        console.error(`${type}:`, details);
        
        // In production, you might want to send errors to a logging service
        // this.sendErrorToService(type, details);
    }

    sendErrorToService(type, details) {
        // Implementation for error reporting service
        // fetch('/api/errors', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ type, details, timestamp: new Date().toISOString() })
        // });
    }
}

// Main Application Class
class NeintosickApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }

        this.isInitialized = true;
    }

    initializeComponents() {
        try {
            // Initialize error handling first
            this.components.errorHandler = new ErrorHandler();
            
            // Initialize core components
            this.components.mobileNav = new MobileNavigation();
            this.components.scrollAnimations = new ScrollAnimations();
            this.components.smoothScrolling = new SmoothScrolling();
            this.components.headerEffects = new HeaderEffects();
            this.components.formValidator = new FormValidator();
            this.components.notifications = new NotificationSystem();
            this.components.languageSupport = new LanguageSupport();
            this.components.accessibility = new AccessibilityHelper();
            this.components.performanceMonitor = new PerformanceMonitor();

            // Setup global utilities
            this.setupGlobalUtilities();
            
            // Initialize page-specific functionality
            this.initializePageSpecific();

            console.log('Nein to Sick application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }

    setupGlobalUtilities() {
        // Make utilities globally available
        window.NeintosickUtils = Utils;
        window.notify = this.components.notifications;
        window.translate = this.components.languageSupport.translate.bind(this.components.languageSupport);
    }

    initializePageSpecific() {
        const path = window.location.pathname;
        
        // Page-specific initializations
        if (path.includes('contact.html')) {
            this.initializeContactPage();
        } else if (path.includes('bandi.html')) {
            this.initializeBandiPage();
        } else if (path.includes('publications.html')) {
            this.initializePublicationsPage();
        }
        // Add more page-specific initializations as needed
    }

    initializeContactPage() {
        // Contact page specific functionality
        const contactForm = document.querySelector('#contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmission(contactForm);
            });
        }
    }

    initializeBandiPage() {
        // Bandi page specific functionality
        const phoneMockup = document.querySelector('.phone-mockup');
        if (phoneMockup) {
            this.setupPhoneMockupInteraction(phoneMockup);
        }
    }

    initializePublicationsPage() {
        // Publications page specific functionality
        const filterTabs = document.querySelectorAll('.filter-tab');
        if (filterTabs.length > 0) {
            this.setupPublicationFilters(filterTabs);
        }
    }

    handleContactFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.components.notifications.info('Sending message...');
        
        setTimeout(() => {
            this.components.notifications.success('Message sent successfully! We\'ll respond within 48 hours.');
            form.reset();
        }, 2000);
    }

    setupPhoneMockupInteraction(mockup) {
        mockup.addEventListener('click', () => {
            mockup.classList.add('pulse');
            setTimeout(() => mockup.classList.remove('pulse'), 1000);
        });
    }

    setupPublicationFilters(tabs) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.dataset.filter;
                this.filterPublications(filter);
                this.updateActiveTab(tab);
            });
        });
    }

    filterPublications(filter) {
        const publications = document.querySelectorAll('.publication-card');
        publications.forEach(pub => {
            const types = pub.dataset.type || '';
            const shouldShow = filter === 'all' || types.includes(filter);
            
            pub.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                pub.classList.add('fade-in-up');
            }
        });
    }

    updateActiveTab(activeTab) {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
    }

    // Public API methods
    getComponent(name) {
        return this.components[name];
    }

    showNotification(message, type = 'info') {
        return this.components.notifications.show(message, type);
    }

    validateForm(form) {
        return this.components.formValidator.validateForm(form);
    }
}

// Initialize application
const app = new NeintosickApp();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeintosickApp, Utils };
}