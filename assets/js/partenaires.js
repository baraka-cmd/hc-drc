/* ============================================================
   HOPE CHILD-DRC — PARTENAIRES.JS
   Scripts Spécifiques de la Page Partenaires
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion du formulaire de partenariat,
                 animations des cartes, validation,
                 scroll reveal et interactions
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION PARTENAIRES
   ============================================================ */
const PartenairesConfig = {
    /* Formulaire */
    form: {
        validateOnSubmit: true,
        validateOnBlur: true,
        showErrorMessages: true,
        showSuccessMessages: true,
        successMessageDuration: 5000,
        errorMessageDuration: 5000,
        resetOnSuccess: true
    },

    /* Animations */
    animations: {
        staggerDelay: 150,
        revealDuration: 700,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    },

    /* Catégories */
    categories: {
        animateOnScroll: true,
        staggerDelay: 100
    }
};

/* ============================================================
   2. ÉTAT PARTENAIRES
   ============================================================ */
const PartenairesState = {
    initialized: false,
    animationsInitialized: false,
    formValidated: false,
    submitting: false
};

/* ============================================================
   3. CLASSE PRINCIPALE PARTENAIRES
   ============================================================ */
class PartenairesPage {
    constructor() {
        this.partnerForm = null;
        this.categoryCards = [];
        this.partnerLogoCards = [];
        
        this.init();
    }

    /* ========== INITIALISATION ========== */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        document.addEventListener('layout-ready', () => {
            if (!PartenairesState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.partnerForm = document.getElementById('partner-form');
        this.categoryCards = Array.from(document.querySelectorAll('.partner-category-card'));
        this.partnerLogoCards = Array.from(document.querySelectorAll('.partner-logo-card'));
        
        // Initialiser les modules
        this.initForm();
        this.initScrollReveal();
        this.initCategoryAnimations();
        this.initSmoothScroll();
        
        PartenairesState.initialized = true;
        PartenairesState.animationsInitialized = true;
        
        console.log('✅ Page Partenaires initialisée');
        console.log('📊 ' + this.categoryCards.length + ' catégories de partenaires');
    }

    /* ============================================================
       4. FORMULAIRE DE PARTENARIAT
       ============================================================ */
    initForm() {
        if (!this.partnerForm) return;
        
        // Validation à la soumission
        this.becomePartnerForm.addEventListener('submit', (e) => {
            const isValid = this.validateAllFields();
            
            if (!isValid) {
                e.preventDefault();
            }
        });
        
        // Validation en temps réel sur les champs
        if (PartenairesConfig.form.validateOnBlur) {
            const inputs = this.partnerForm.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    // Effacer l'erreur quand l'utilisateur tape
                    if (input.classList.contains('error')) {
                        this.clearFieldError(input);
                    }
                });
            });
        }
        
        console.log('✅ Formulaire de partenariat initialisé');
    }

    /**
     * Valide tout le formulaire
     * @returns {boolean} True si le formulaire est valide
     */
    validateForm() {
        if (!PartenairesConfig.form.validateOnSubmit) return true;
        
        const inputs = this.partnerForm.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        PartenairesState.formValidated = isValid;
        return isValid;
    }

    /**
     * Valide un champ individuel
     * @param {HTMLElement} input - Champ à valider
     * @returns {boolean} True si le champ est valide
     */
    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.id || input.name;
        let errorMessage = '';
        
        // Validation selon le type
        if (input.hasAttribute('required') && value === '') {
            errorMessage = 'Ce champ est obligatoire';
        } else if (input.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Veuillez entrer un email valide';
            }
        } else if (input.type === 'tel' && value !== '') {
            const phoneRegex = /^[+]?[0-9\s-]{8,}$/;
            if (!phoneRegex.test(value)) {
                errorMessage = 'Veuillez entrer un numéro valide';
            }
        }
        
        if (errorMessage) {
            this.showFieldError(input, errorMessage);
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }

    /**
     * Affiche une erreur sur un champ
     * @param {HTMLElement} input - Champ concerné
     * @param {string} message - Message d'erreur
     */
    showFieldError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        
        // Supprimer l'ancien message
        const existingError = input.parentElement.querySelector('.form-error-message');
        if (existingError) existingError.remove();
        
        // Créer le message d'erreur
        if (PartenairesConfig.form.showErrorMessages) {
            const errorEl = document.createElement('div');
            errorEl.className = 'form-error-message';
            errorEl.textContent = message;
            errorEl.style.cssText = `
                font-size: 11px;
                color: #DC3545;
                margin-top: 4px;
                animation: fadeIn 0.3s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            errorEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
            
            input.parentElement.appendChild(errorEl);
        }
        
        // Style du champ
        input.style.borderColor = '#DC3545';
        input.style.boxShadow = '0 0 0 4px rgba(220, 53, 69, 0.1)';
    }

    /**
     * Efface l'erreur d'un champ
     * @param {HTMLElement} input - Champ concerné
     */
    clearFieldError(input) {
        input.classList.remove('error');
        input.classList.add('success');
        
        // Supprimer le message d'erreur
        const existingError = input.parentElement.querySelector('.form-error-message');
        if (existingError) existingError.remove();
        
        // Restaurer le style
        input.style.borderColor = '#28A745';
        input.style.boxShadow = '0 0 0 4px rgba(40, 167, 69, 0.1)';
        
        // Retirer le style après un moment
        setTimeout(() => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }, 2000);
    }

    /**
     * Soumet le formulaire
     */
    submitForm() {
        if (PartenairesState.submitting) return;
        
        PartenairesState.submitting = true;
        
        const submitBtn = this.partnerForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn ? submitBtn.innerHTML : '';
        
        // Désactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        }
        
        // Simuler une requête API
        setTimeout(() => {
            // Récupérer les données
            const formData = {
                organisation: document.getElementById('partner-org-name')?.value || '',
                type: document.getElementById('partner-type')?.value || '',
                email: document.getElementById('partner-email')?.value || '',
                telephone: document.getElementById('partner-phone')?.value || '',
                message: document.getElementById('partner-message')?.value || '',
                date: new Date().toISOString()
            };
            
            console.log('📤 Demande de partenariat :', formData);
            
            // Restaurer le bouton
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Envoyé !';
            }
            
            // Afficher le message de succès
            this.showFormMessage('success', '🎉 Votre demande de partenariat a été envoyée avec succès !');
            
            // Réinitialiser le formulaire
            if (PartenairesConfig.form.resetOnSuccess) {
                this.partnerForm.reset();
                
                // Effacer les styles de succès
                this.partnerForm.querySelectorAll('.success').forEach(el => {
                    el.classList.remove('success');
                    el.style.borderColor = '';
                    el.style.boxShadow = '';
                });
            }
            
            PartenairesState.submitting = false;
            
            // Restaurer le bouton original
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalHtml;
                }
            }, 3000);
            
        }, 2000);
    }

    /**
     * Affiche un message dans le formulaire
     * @param {string} type - Type de message ('success' ou 'error')
     * @param {string} message - Message à afficher
     */
    showFormMessage(type, message) {
        const existing = this.partnerForm.querySelector('.form-message');
        if (existing) existing.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = 'form-message';
        messageEl.innerHTML = message;
        messageEl.style.cssText = `
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            animation: fadeIn 0.3s ease;
            text-align: center;
            ${type === 'success' ? 'background: rgba(40, 167, 69, 0.1); color: #28A745; border: 1px solid rgba(40, 167, 69, 0.3);' : ''}
            ${type === 'error' ? 'background: rgba(220, 53, 69, 0.1); color: #DC3545; border: 1px solid rgba(220, 53, 69, 0.3);' : ''}
        `;
        
        this.partnerForm.insertBefore(messageEl, this.partnerForm.firstChild);
        
        const duration = type === 'success' ? 
            PartenairesConfig.form.successMessageDuration : 
            PartenairesConfig.form.errorMessageDuration;
        
        setTimeout(() => {
            messageEl.remove();
        }, duration);
    }

    /* ============================================================
       5. SCROLL REVEAL GÉNÉRAL
       ============================================================ */
    initScrollReveal() {
        const elements = document.querySelectorAll('[data-aos]');
        
        if (elements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.getAttribute('data-aos');
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('aos-animate');
                        element.style.opacity = '1';
                        element.style.transform = 'none';
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: PartenairesConfig.animations.threshold,
            rootMargin: PartenairesConfig.animations.rootMargin
        });
        
        elements.forEach(element => {
            const animation = element.getAttribute('data-aos');
            
            element.style.transition = `all ${PartenairesConfig.animations.revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '0';
            
            switch (animation) {
                case 'fade-up':
                    element.style.transform = 'translateY(40px)';
                    break;
                case 'fade-left':
                    element.style.transform = 'translateX(-40px)';
                    break;
                case 'fade-right':
                    element.style.transform = 'translateX(40px)';
                    break;
                case 'zoom-in':
                    element.style.transform = 'scale(0.85)';
                    break;
                default:
                    element.style.transform = 'translateY(40px)';
            }
            
            observer.observe(element);
        });
        
        console.log('✅ Scroll reveal initialisé');
    }

    /* ============================================================
       6. ANIMATIONS DES CATÉGORIES
       ============================================================ */
    initCategoryAnimations() {
        if (this.categoryCards.length === 0) return;
        
        this.categoryCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * PartenairesConfig.categories.staggerDelay);
                        
                        observer.unobserve(card);
                    }
                });
            }, {
                threshold: 0.2
            });
            
            observer.observe(card);
        });
        
        console.log('✅ Animations des catégories initialisées');
    }

    /* ============================================================
       7. ANIMATION DU HERO AU CHARGEMENT
       ============================================================ */
    animateHeroOnLoad() {
        const title = document.querySelector('.page-hero-title');
        const subtitle = document.querySelector('.page-hero-subtitle');
        const breadcrumb = document.querySelector('.page-hero .breadcrumb');
        
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(30px)';
            title.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 100);
        }
        
        if (subtitle) {
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translateY(20px)';
            subtitle.style.transition = 'all 0.8s ease-out 0.2s';
            
            setTimeout(() => {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 300);
        }
        
        if (breadcrumb) {
            breadcrumb.style.opacity = '0';
            breadcrumb.style.transition = 'all 0.5s ease-out';
            
            setTimeout(() => {
                breadcrumb.style.opacity = '1';
            }, 200);
        }
    }

    /* ============================================================
       8. SMOOTH SCROLL POUR LES ANCRES
       ============================================================ */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                history.pushState(null, null, href);
            });
        });
        
        console.log('✅ Smooth scroll initialisé');
    }

    /* ============================================================
       9. MÉTHODES PUBLIQUES
       ============================================================ */
    resetForm() {
        if (this.partnerForm) {
            this.partnerForm.reset();
        }
    }

    reinitialize() {
        this.setup();
    }

    destroy() {
        PartenairesState.initialized = false;
        PartenairesState.animationsInitialized = false;
        console.log('🗑️ Page Partenaires détruite');
    }
}

/* ============================================================
   10. DÉMARRAGE
   ============================================================ */
let partenairesPageInstance = null;

function initPartenairesPage() {
    if (!partenairesPageInstance) {
        partenairesPageInstance = new PartenairesPage();
        partenairesPageInstance.animateHeroOnLoad();
    }
    return partenairesPageInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPartenairesPage();
    });
} else {
    initPartenairesPage();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!PartenairesState.initialized) {
        initPartenairesPage();
    }
});

/* ============================================================
   11. EXPORTATION GLOBALE
   ============================================================ */
window.PartenairesPage = PartenairesPage;
window.PartenairesConfig = PartenairesConfig;
window.PartenairesState = PartenairesState;
window.partenairesPageInstance = partenairesPageInstance;
window.initPartenairesPage = initPartenairesPage;

/* ============================================================
   FIN DU FICHIER PARTENAIRES.JS
   ============================================================ */