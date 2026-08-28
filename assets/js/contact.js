/* ============================================================
   HOPE CHILD-DRC — CONTACT.JS
   Scripts Spécifiques de la Page Contact
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la page Contact,
                 validation du formulaire, compteur de caractères,
                 envoi simulé, toast notifications,
                 animations et accessibilité
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION CONTACT
   ============================================================ */
const ContactConfig = {
    /* Formulaire */
    form: {
        minMessageLength: 10,
        maxMessageLength: 500,
        validationOnInput: true,
        validationOnBlur: true,
        resetOnSuccess: true,
        submitDelay: 1500,
        storageKey: 'hc_drc_contact_messages'
    },

    /* Toast */
    toast: {
        duration: 5000,
        animationDuration: 300,
        position: 'bottom-right'
    },

    /* Sujets */
    subjects: {
        general: 'Demande générale',
        partenariat: 'Partenariat',
        don: 'Don',
        benevolat: 'Bénévolat',
        presse: 'Presse / Médias',
        autre: 'Autre'
    },

    /* Email */
    email: {
        recipient: 'hopechilddrc@gmail.com',
        subjectPrefix: '[Site Web] '
    }
};

/* ============================================================
   2. ÉTAT CONTACT
   ============================================================ */
const ContactState = {
    initialized: false,
    isSubmitting: false,
    formValid: false,
    fields: {
        name: { valid: false, touched: false },
        email: { valid: false, touched: false },
        phone: { valid: true, touched: false },  /* Optionnel */
        subject: { valid: false, touched: false },
        message: { valid: false, touched: false },
        consent: { valid: false, touched: false }
    }
};

/* ============================================================
   3. CLASSE PRINCIPALE CONTACT
   ============================================================ */
class ContactPage {
    constructor() {
        /* Références DOM */
        this.contactForm = null;
        this.nameInput = null;
        this.emailInput = null;
        this.phoneInput = null;
        this.subjectSelect = null;
        this.messageInput = null;
        this.consentCheckbox = null;
        this.messageCount = null;
        this.submitBtn = null;
        this.toastElement = null;
        this.toastTimer = null;

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
            if (!ContactState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        /* Récupérer les éléments DOM */
        this.cacheElements();

        /* Vérifier que le formulaire existe */
        if (!this.contactForm) {
            console.warn('⚠️ Formulaire de contact introuvable');
            return;
        }

        ContactState.initialized = true;

        /* Initialiser les modules */
        this.initFormValidation();
        this.initCharCounter();
        this.initConsentValidation();
        this.createToastElement();

        console.log('✅ Page Contact initialisée');
    }

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.contactForm = document.getElementById('contact-form');
        this.nameInput = document.getElementById('contact-name');
        this.emailInput = document.getElementById('contact-email');
        this.phoneInput = document.getElementById('contact-phone');
        this.subjectSelect = document.getElementById('contact-subject');
        this.messageInput = document.getElementById('contact-message');
        this.consentCheckbox = document.getElementById('contact-consent');
        this.messageCount = document.getElementById('contact-message-count');
        this.submitBtn = this.contactForm ? this.contactForm.querySelector('.contact-submit-btn') : null;
    }

    /* ============================================================
       4. VALIDATION DU FORMULAIRE
       ============================================================ */
    initFormValidation() {
        if (!this.contactForm) return;

        /* Événement de soumission — CORRIGÉ POUR NETLIFY */
        this.contactForm.addEventListener('submit', (e) => {
            const isValid = this.validateAllFields();
            
            if (!isValid) {
                e.preventDefault();   // ✅ Bloque uniquement si invalide
                this.showToast('⚠️ Veuillez corriger les erreurs du formulaire', 'error');
                this.scrollToFirstError();
            }
            /* Si valide → PAS de preventDefault → Netlify capture automatiquement */
        });

        /* Validation en temps réel */
        if (ContactConfig.form.validationOnInput) {
            this.initRealTimeValidation();
        }

        /* Validation au blur */
        if (ContactConfig.form.validationOnBlur) {
            this.initBlurValidation();
        }

        console.log('✅ Validation du formulaire initialisée');
    }

    initRealTimeValidation() {
        /* Nom */
        if (this.nameInput) {
            this.nameInput.addEventListener('input', () => {
                this.validateName();
            });
        }

        /* Email */
        if (this.emailInput) {
            this.emailInput.addEventListener('input', () => {
                this.validateEmail();
            });
        }

        /* Téléphone (optionnel) */
        if (this.phoneInput) {
            this.phoneInput.addEventListener('input', () => {
                this.validatePhone();
            });
        }

        /* Sujet */
        if (this.subjectSelect) {
            this.subjectSelect.addEventListener('change', () => {
                this.validateSubject();
            });
        }

        /* Message */
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => {
                this.validateMessage();
                this.updateCharCounter();
            });
        }

        /* Consentement */
        if (this.consentCheckbox) {
            this.consentCheckbox.addEventListener('change', () => {
                this.validateConsent();
            });
        }
    }

    initBlurValidation() {
        if (this.nameInput) {
            this.nameInput.addEventListener('blur', () => {
                ContactState.fields.name.touched = true;
                this.validateName();
            });
        }

        if (this.emailInput) {
            this.emailInput.addEventListener('blur', () => {
                ContactState.fields.email.touched = true;
                this.validateEmail();
            });
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('blur', () => {
                ContactState.fields.message.touched = true;
                this.validateMessage();
            });
        }
    }

    /* ========== VALIDATIONS INDIVIDUELLES ========== */
    validateName() {
        const value = this.nameInput ? this.nameInput.value.trim() : '';
        const isValid = value.length >= 2;

        ContactState.fields.name.valid = isValid;
        this.toggleFieldError('contact-name', 'contact-name-error', !isValid);

        return isValid;
    }

    validateEmail() {
        const value = this.emailInput ? this.emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);

        ContactState.fields.email.valid = isValid;
        this.toggleFieldError('contact-email', 'contact-email-error', !isValid);

        return isValid;
    }

    validatePhone() {
        if (!this.phoneInput) return true;

        const value = this.phoneInput.value.trim();

        /* Si vide, c'est valide (optionnel) */
        if (value === '') {
            ContactState.fields.phone.valid = true;
            this.toggleFieldError('contact-phone', null, false);
            return true;
        }

        /* Valider le format téléphone */
        const phoneRegex = /^[+]?[\d\s-]{8,15}$/;
        const isValid = phoneRegex.test(value);

        ContactState.fields.phone.valid = isValid;
        this.toggleFieldError('contact-phone', null, !isValid);

        return isValid;
    }

    validateSubject() {
        const value = this.subjectSelect ? this.subjectSelect.value : '';
        const isValid = value !== '' && value !== null;

        ContactState.fields.subject.valid = isValid;
        this.toggleFieldError('contact-subject', 'contact-subject-error', !isValid);

        return isValid;
    }

    validateMessage() {
        const value = this.messageInput ? this.messageInput.value.trim() : '';
        const isValid = value.length >= ContactConfig.form.minMessageLength;

        ContactState.fields.message.valid = isValid;
        this.toggleFieldError('contact-message', 'contact-message-error', !isValid);

        return isValid;
    }

    validateConsent() {
        const isChecked = this.consentCheckbox ? this.consentCheckbox.checked : false;

        ContactState.fields.consent.valid = isChecked;
        this.toggleFieldError('contact-consent', 'contact-consent-error', !isChecked);

        return isChecked;
    }

    /* ========== VALIDATION COMPLÈTE ========== */
    validateAllFields() {
        const nameValid = this.validateName();
        const emailValid = this.validateEmail();
        const phoneValid = this.validatePhone();
        const subjectValid = this.validateSubject();
        const messageValid = this.validateMessage();
        const consentValid = this.validateConsent();

        ContactState.formValid = nameValid && emailValid && phoneValid && 
                                 subjectValid && messageValid && consentValid;

        return ContactState.formValid;
    }

    /* ========== AFFICHAGE DES ERREURS ========== */
    toggleFieldError(inputId, errorId, showError) {
        const input = document.getElementById(inputId);
        const error = errorId ? document.getElementById(errorId) : null;

        if (!input) return;

        if (showError) {
            input.classList.add('error');
            input.classList.remove('success');
            if (error) error.classList.add('visible');
        } else {
            input.classList.remove('error');
            if (input.value && input.value.trim() !== '') {
                input.classList.add('success');
            }
            if (error) error.classList.remove('visible');
        }
    }

    /* ============================================================
       5. COMPTEUR DE CARACTÈRES
       ============================================================ */
    initCharCounter() {
        if (!this.messageInput || !this.messageCount) return;

        this.updateCharCounter();
        console.log('✅ Compteur de caractères initialisé');
    }

    updateCharCounter() {
        if (!this.messageInput || !this.messageCount) return;

        const currentLength = this.messageInput.value.length;
        const maxLength = ContactConfig.form.maxMessageLength;

        this.messageCount.textContent = currentLength + ' / ' + maxLength + ' caractères';

        /* Changer la couleur selon la proximité de la limite */
        this.messageCount.classList.remove('limit-near', 'limit-reached');

        if (currentLength >= maxLength) {
            this.messageCount.classList.add('limit-reached');
        } else if (currentLength >= maxLength * 0.8) {
            this.messageCount.classList.add('limit-near');
        }
    }

    /* ============================================================
       6. VALIDATION DU CONSENTEMENT
       ============================================================ */
    initConsentValidation() {
        if (!this.consentCheckbox) return;

        this.consentCheckbox.addEventListener('change', () => {
            this.validateConsent();
        });

        console.log('✅ Validation du consentement initialisée');
    }

    /* ============================================================
       7. SOUMISSION DU FORMULAIRE
       ============================================================ */
    handleSubmit() {
        /* Empêcher les doubles soumissions */
        if (ContactState.isSubmitting) return;

        /* Valider tous les champs */
        const isValid = this.validateAllFields();

        if (!isValid) {
            this.showToast('⚠️ Veuillez corriger les erreurs du formulaire', 'error');
            this.scrollToFirstError();
            return;
        }

        /* Marquer comme en cours de soumission */
        ContactState.isSubmitting = true;
        this.setSubmittingState(true);

        /* Récupérer les données */
        const formData = this.getFormData();

        /* Simuler l'envoi */
        setTimeout(() => {
            this.saveMessage(formData);
            this.handleSuccess();
        }, ContactConfig.form.submitDelay);
    }

    getFormData() {
        return {
            name: this.nameInput ? this.nameInput.value.trim() : '',
            email: this.emailInput ? this.emailInput.value.trim() : '',
            phone: this.phoneInput ? this.phoneInput.value.trim() : '',
            subject: this.subjectSelect ? this.subjectSelect.value : '',
            subjectLabel: this.subjectSelect ? 
                ContactConfig.subjects[this.subjectSelect.value] || this.subjectSelect.value : '',
            message: this.messageInput ? this.messageInput.value.trim() : '',
            consent: this.consentCheckbox ? this.consentCheckbox.checked : false,
            date: new Date().toISOString()
        };
    }

    saveMessage(formData) {
        /* Sauvegarder dans localStorage pour référence */
        const storageKey = ContactConfig.form.storageKey;
        
        let messages = [];
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                messages = JSON.parse(stored);
            }
        } catch (err) {
            messages = [];
        }

        messages.push(formData);

        /* Limiter à 50 messages */
        if (messages.length > 50) {
            messages = messages.slice(-50);
        }

        localStorage.setItem(storageKey, JSON.stringify(messages));

        console.log('📧 Message enregistré :');
        console.log('   - De : ' + formData.name + ' (' + formData.email + ')');
        console.log('   - Sujet : ' + formData.subjectLabel);
        console.log('   - Longueur : ' + formData.message.length + ' caractères');
    }

    handleSuccess() {
        /* Réinitialiser l'état */
        ContactState.isSubmitting = false;
        this.setSubmittingState(false);

        /* Afficher le toast de succès */
        this.showToast('✅ Votre message a été envoyé avec succès !', 'success');

        /* Réinitialiser le formulaire */
        if (ContactConfig.form.resetOnSuccess) {
            this.contactForm.reset();
            this.resetFieldStates();
            this.updateCharCounter();
        }

        console.log('✅ Formulaire soumis avec succès');
    }

    resetFieldStates() {
        Object.keys(ContactState.fields).forEach((key) => {
            ContactState.fields[key].valid = false;
            ContactState.fields[key].touched = false;
        });

        ContactState.formValid = false;

        /* Retirer les classes success/error */
        const allInputs = this.contactForm.querySelectorAll('.form-control');
        allInputs.forEach((input) => {
            input.classList.remove('error', 'success');
        });

        const allErrors = this.contactForm.querySelectorAll('.form-error-message');
        allErrors.forEach((error) => {
            error.classList.remove('visible');
        });
    }

    setSubmittingState(isSubmitting) {
        if (!this.submitBtn) return;

        if (isSubmitting) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            const originalContent = this.submitBtn.innerHTML;
            this.submitBtn.dataset.originalContent = originalContent;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            const originalContent = this.submitBtn.dataset.originalContent;
            if (originalContent) {
                this.submitBtn.innerHTML = originalContent;
            }
        }
    }

    scrollToFirstError() {
        const firstError = this.contactForm.querySelector('.form-control.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus({ preventScroll: true });
        }
    }

    /* ============================================================
       8. TOAST NOTIFICATIONS
       ============================================================ */
    createToastElement() {
        /* Supprimer un toast existant */
        const existingToast = document.querySelector('.contact-toast');
        if (existingToast) existingToast.remove();

        /* Créer le toast */
        this.toastElement = document.createElement('div');
        this.toastElement.className = 'contact-toast';
        document.body.appendChild(this.toastElement);

        console.log('✅ Toast créé');
    }

    showToast(message, type = 'success') {
        if (!this.toastElement) return;

        /* Effacer le timer précédent */
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        /* Configurer le toast */
        this.toastElement.textContent = message;
        this.toastElement.className = 'contact-toast toast-' + type;
        this.toastElement.classList.add('visible');

        /* Masquer après la durée */
        this.toastTimer = setTimeout(() => {
            this.toastElement.classList.remove('visible');
        }, ContactConfig.toast.duration);

        console.log('🔔 Toast : ' + message);
    }

    /* ============================================================
       9. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...ContactState };
    }

    resetForm() {
        if (this.contactForm) {
            this.contactForm.reset();
            this.resetFieldStates();
            this.updateCharCounter();
        }
    }

    destroy() {
        ContactState.initialized = false;
        ContactState.isSubmitting = false;

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        if (this.toastElement) {
            this.toastElement.remove();
        }

        console.log('🗑️ Page Contact détruite');
    }
}

/* ============================================================
   10. EXPORTATION GLOBALE
   ============================================================ */
window.ContactPage = ContactPage;
window.ContactConfig = ContactConfig;
window.ContactState = ContactState;

/* ============================================================
   11. DÉMARRAGE
   ============================================================ */
let contactPageInstance = null;

function initContactPage() {
    if (!contactPageInstance) {
        contactPageInstance = new ContactPage();
    }
    return contactPageInstance;
}

/* Initialiser au chargement */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initContactPage();
    });
} else {
    initContactPage();
}

/* Réinitialiser quand le layout est prêt */
document.addEventListener('layout-ready', () => {
    if (!ContactState.initialized) {
        initContactPage();
    }
});

/* ============================================================
   FIN DU FICHIER CONTACT.JS
   ============================================================ */