/* ============================================================
   HOPE CHILD-DRC — FORMS.JS
   Gestion des Formulaires
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Validation complète, soumission AJAX,
                 feedback utilisateur, formulaires contact,
                 don, newsletter, partenariat, candidature
   ============================================================ */

'use strict';

/* ============================================================
   1. CLASSE DE VALIDATION
   ============================================================ */
class FormValidator {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            validateOnSubmit: true,
            validateOnBlur: true,
            validateOnInput: true,
            showErrorMessages: true,
            showSuccessMessages: true,
            successMessageDuration: 5000,
            errorMessageDuration: 5000,
            submitOnEnter: true,
            resetOnSuccess: true,
            scrollToError: true,
            errorClass: 'error',
            successClass: 'success',
            ...options
        };

        this.fields = [];
        this.errors = {};
        this.isValid = false;

        this.init();
    }

    init() {
        this.collectFields();
        this.bindEvents();
        this.setupCustomValidators();
    }

    collectFields() {
        this.fields = Array.from(this.form.querySelectorAll('input, select, textarea'))
            .filter(field => !field.disabled && !field.readOnly);
    }

    bindEvents() {
        // Validation au blur
        if (this.options.validateOnBlur) {
            this.fields.forEach(field => {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
            });
        }

        // Validation en temps réel
        if (this.options.validateOnInput) {
            this.fields.forEach(field => {
                field.addEventListener('input', () => {
                    if (field.classList.contains(this.options.errorClass)) {
                        this.validateField(field);
                    }
                });
            });
        }

        // Soumission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateAll();
            
            if (this.isValid) {
                this.handleSubmit();
            } else if (this.options.scrollToError) {
                this.scrollToFirstError();
            }
        });

        // Touche Entrée
        if (this.options.submitOnEnter) {
            this.form.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.form.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    setupCustomValidators() {
        this.fields.forEach(field => {
            const validatorType = field.getAttribute('data-validate');
            if (validatorType) {
                field.setAttribute('data-validator', validatorType);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const rules = this.getFieldRules(field);
        let errorMessage = '';

        for (const rule of rules) {
            const validationResult = this.validateRule(field, value, rule);
            if (validationResult !== true) {
                errorMessage = validationResult;
                break;
            }
        }

        if (errorMessage) {
            this.setFieldError(field, errorMessage);
            return false;
        } else {
            this.setFieldSuccess(field);
            return true;
        }
    }

    getFieldRules(field) {
        const rules = [];
        
        // Required
        if (field.hasAttribute('required') || field.getAttribute('data-required') === 'true') {
            rules.push({ type: 'required' });
        }

        // Email
        if (field.type === 'email' || field.getAttribute('data-validate') === 'email') {
            rules.push({ type: 'email' });
        }

        // Phone
        if (field.type === 'tel' || field.getAttribute('data-validate') === 'phone') {
            rules.push({ type: 'phone' });
        }

        // URL
        if (field.type === 'url' || field.getAttribute('data-validate') === 'url') {
            rules.push({ type: 'url' });
        }

        // Number
        if (field.type === 'number' || field.getAttribute('data-validate') === 'number') {
            rules.push({ type: 'number' });
        }

        // Min length
        const minLength = field.getAttribute('data-min-length') || field.getAttribute('minlength');
        if (minLength) {
            rules.push({ type: 'minLength', value: parseInt(minLength) });
        }

        // Max length
        const maxLength = field.getAttribute('data-max-length') || field.getAttribute('maxlength');
        if (maxLength) {
            rules.push({ type: 'maxLength', value: parseInt(maxLength) });
        }

        // Min value
        const minValue = field.getAttribute('data-min') || field.getAttribute('min');
        if (minValue) {
            rules.push({ type: 'min', value: parseFloat(minValue) });
        }

        // Max value
        const maxValue = field.getAttribute('data-max') || field.getAttribute('max');
        if (maxValue) {
            rules.push({ type: 'max', value: parseFloat(maxValue) });
        }

        // Pattern
        const pattern = field.getAttribute('data-pattern') || field.getAttribute('pattern');
        if (pattern) {
            rules.push({ type: 'pattern', value: pattern });
        }

        // Match (confirmation)
        const matchField = field.getAttribute('data-match');
        if (matchField) {
            rules.push({ type: 'match', value: matchField });
        }

        return rules;
    }

    validateRule(field, value, rule) {
        switch (rule.type) {
            case 'required':
                if (!value) {
                    return this.getErrorMessage(field, 'required', 'Ce champ est obligatoire.');
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    return this.getErrorMessage(field, 'email', 'Veuillez entrer une adresse email valide.');
                }
                break;

            case 'phone':
                const phoneRegex = /^[+]?[\d\s-]{8,20}$/;
                if (value && !phoneRegex.test(value)) {
                    return this.getErrorMessage(field, 'phone', 'Veuillez entrer un numéro de téléphone valide.');
                }
                break;

            case 'url':
                const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
                if (value && !urlRegex.test(value)) {
                    return this.getErrorMessage(field, 'url', 'Veuillez entrer une URL valide.');
                }
                break;

            case 'number':
                if (value && isNaN(value)) {
                    return this.getErrorMessage(field, 'number', 'Veuillez entrer un nombre valide.');
                }
                break;

            case 'minLength':
                if (value && value.length < rule.value) {
                    return this.getErrorMessage(field, 'minLength', `Minimum ${rule.value} caractères requis.`);
                }
                break;

            case 'maxLength':
                if (value && value.length > rule.value) {
                    return this.getErrorMessage(field, 'maxLength', `Maximum ${rule.value} caractères autorisés.`);
                }
                break;

            case 'min':
                if (value && parseFloat(value) < rule.value) {
                    return this.getErrorMessage(field, 'min', `La valeur doit être supérieure ou égale à ${rule.value}.`);
                }
                break;

            case 'max':
                if (value && parseFloat(value) > rule.value) {
                    return this.getErrorMessage(field, 'max', `La valeur doit être inférieure ou égale à ${rule.value}.`);
                }
                break;

            case 'pattern':
                const patternRegex = new RegExp(rule.value);
                if (value && !patternRegex.test(value)) {
                    return this.getErrorMessage(field, 'pattern', 'Le format est invalide.');
                }
                break;

            case 'match':
                const matchElement = this.form.querySelector(`[name="${rule.value}"]`);
                if (matchElement && value !== matchElement.value) {
                    return this.getErrorMessage(field, 'match', 'Les valeurs ne correspondent pas.');
                }
                break;
        }

        return true;
    }

    getErrorMessage(field, type, defaultMessage) {
        const customMessage = field.getAttribute(`data-error-${type}`) || 
                             field.getAttribute(`data-error-message`);
        return customMessage || defaultMessage;
    }

    setFieldError(field, message) {
        field.classList.add(this.options.errorClass);
        field.classList.remove(this.options.successClass);
        field.setAttribute('aria-invalid', 'true');
        
        // Afficher le message d'erreur
        if (this.options.showErrorMessages) {
            let errorElement = field.parentElement.querySelector('.form-error-message');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'form-error-message';
                field.parentElement.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        this.errors[field.name || field.id] = message;
    }

    setFieldSuccess(field) {
        field.classList.remove(this.options.errorClass);
        field.classList.add(this.options.successClass);
        field.removeAttribute('aria-invalid');
        
        const errorElement = field.parentElement.querySelector('.form-error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        delete this.errors[field.name || field.id];
    }

    validateAll() {
        this.errors = {};
        let allValid = true;

        this.fields.forEach(field => {
            const isValid = this.validateField(field);
            if (!isValid) {
                allValid = false;
            }
        });

        this.isValid = allValid;
        return allValid;
    }

    scrollToFirstError() {
        const firstErrorField = this.form.querySelector(`.${this.options.errorClass}`);
        if (firstErrorField) {
            firstErrorField.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            firstErrorField.focus();
        }
    }

    handleSubmit() {
        // À surcharger ou utiliser le gestionnaire de soumission
        const event = new CustomEvent('formValidated', {
            detail: { form: this.form }
        });
        this.form.dispatchEvent(event);
    }

    resetForm() {
        this.form.reset();
        this.fields.forEach(field => {
            field.classList.remove(this.options.errorClass, this.options.successClass);
            field.removeAttribute('aria-invalid');
            
            const errorElement = field.parentElement.querySelector('.form-error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
        this.errors = {};
        this.isValid = false;
    }
}

/* ============================================================
   2. CLASSE DE SOUMISSION AJAX
   ============================================================ */
class FormSubmitter {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            method: 'POST',
            action: '',
            ajax: true,
            showLoader: true,
            showSuccessMessage: true,
            showErrorMessage: true,
            successMessageDuration: 5000,
            errorMessageDuration: 5000,
            resetOnSuccess: true,
            ...options
        };

        this.isSubmitting = false;
        this.init();
    }

    init() {
        const action = this.form.getAttribute('action') || this.options.action;
        if (action) {
            this.options.action = action;
        }

        this.form.addEventListener('formValidated', (e) => {
            this.submit();
        });
    }

    async submit() {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.showLoading();

        try {
            const formData = new FormData(this.form);
            
            if (this.options.ajax) {
                const response = await this.ajaxSubmit(formData);
                this.handleSuccess(response);
            } else {
                // Soumission traditionnelle
                this.form.submit();
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }

    async ajaxSubmit(formData) {
        const response = await fetch(this.options.action, {
            method: this.options.method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        return response.json();
    }

    handleSuccess(response) {
        if (this.options.showSuccessMessage) {
            const message = response?.message || 'Formulaire envoyé avec succès !';
            this.showSuccessMessage(message);
        }

        if (this.options.resetOnSuccess) {
            this.form.reset();
        }

        // Dispatch un événement de succès
        this.form.dispatchEvent(new CustomEvent('formSubmitted', {
            detail: { response }
        }));
    }

    handleError(error) {
        console.error('❌ Erreur de soumission :', error);
        
        if (this.options.showErrorMessage) {
            this.showErrorMessage('Une erreur est survenue. Veuillez réessayer.');
        }

        // Dispatch un événement d'erreur
        this.form.dispatchEvent(new CustomEvent('formError', {
            detail: { error }
        }));
    }

    showLoading() {
        const submitButton = this.form.querySelector('[type="submit"]');
        if (!submitButton) return;

        submitButton.disabled = true;
        submitButton.setAttribute('data-original-text', submitButton.innerHTML);
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
    }

    hideLoading() {
        const submitButton = this.form.querySelector('[type="submit"]');
        if (!submitButton) return;

        submitButton.disabled = false;
        const originalText = submitButton.getAttribute('data-original-text');
        if (originalText) {
            submitButton.innerHTML = originalText;
        }
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `form-toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Fermer">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Animation d'entrée
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Fermeture
        const closeToast = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', closeToast);

        setTimeout(closeToast, type === 'success' 
            ? this.options.successMessageDuration 
            : this.options.errorMessageDuration);
    }
}

/* ============================================================
   3. CLASSE FORMULAIRE DE CONTACT
   ============================================================ */
class ContactForm {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            emailTo: CONFIG?.contact?.email?.main || 'hopechilddrc@gmail.com',
            subject: 'Nouveau message depuis le site web',
            ...options
        };

        this.validator = null;
        this.submitter = null;
        this.init();
    }

    init() {
        this.validator = new FormValidator(this.form);
        this.submitter = new FormSubmitter(this.form, {
            action: this.options.action || '',
            ajax: this.options.ajax ?? false
        });

        this.form.addEventListener('formSubmitted', () => {
            console.log('✅ Formulaire de contact envoyé');
        });
    }
}

/* ============================================================
   4. CLASSE FORMULAIRE DE DON
   ============================================================ */
class DonationForm {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            currency: 'USD',
            currencySymbol: '$',
            minAmount: 5,
            maxAmount: 10000,
            suggestedAmounts: [10, 25, 50, 100, 250, 500],
            ...options
        };

        this.selectedAmount = null;
        this.donationType = 'one-time';
        this.init();
    }

    init() {
        this.validator = new FormValidator(this.form);
        this.setupAmountButtons();
        this.setupDonationTypeTabs();
        this.setupCustomAmount();
    }

    setupAmountButtons() {
        const amountButtons = this.form.querySelectorAll('.amount-btn');
        
        amountButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.getAttribute('data-amount');
                this.selectAmount(amount, btn);
            });
        });
    }

    selectAmount(amount, button) {
        this.selectedAmount = amount;
        
        // Mettre à jour les boutons
        this.form.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        if (button) {
            button.classList.add('selected');
            button.setAttribute('aria-pressed', 'true');
        }

        // Mettre à jour le champ caché
        const amountInput = this.form.querySelector('[name="amount"]');
        if (amountInput) {
            amountInput.value = amount;
        }

        // Mettre à jour l'affichage
        const amountDisplay = this.form.querySelector('.selected-amount-display');
        if (amountDisplay) {
            amountDisplay.textContent = `${this.options.currencySymbol}${amount}`;
        }
    }

    setupDonationTypeTabs() {
        const tabs = this.form.querySelectorAll('.donation-type-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const type = tab.getAttribute('data-type');
                
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                this.donationType = type;
                
                const typeInput = this.form.querySelector('[name="donation_type"]');
                if (typeInput) {
                    typeInput.value = type;
                }
            });
        });
    }

    setupCustomAmount() {
        const customInput = this.form.querySelector('[name="custom_amount"]');
        const customButton = this.form.querySelector('.custom-amount-btn');
        
        if (customButton && customInput) {
            customButton.addEventListener('click', () => {
                const amount = parseFloat(customInput.value);
                
                if (amount >= this.options.minAmount && amount <= this.options.maxAmount) {
                    this.selectAmount(amount, null);
                }
            });
        }
    }
}

/* ============================================================
   5. CLASSE FORMULAIRE NEWSLETTER
   ============================================================ */
class NewsletterForm {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            service: 'mailchimp',
            formAction: '',
            method: 'POST',
            ...options
        };

        this.init();
    }

    init() {
        this.validator = new FormValidator(this.form, {
            validateOnBlur: false,
            validateOnInput: true
        });

        this.form.addEventListener('formSubmitted', () => {
            this.handleNewsletterSuccess();
        });
    }

    handleNewsletterSuccess() {
        // Marquer comme inscrit dans le localStorage
        try {
            localStorage.setItem('hc_drc_newsletter_subscribed', 'true');
        } catch (error) {
            console.warn('⚠️ Impossible d\'écrire dans le localStorage');
        }

        // Cacher le formulaire et montrer un message de succès
        const successMessage = document.createElement('div');
        successMessage.className = 'newsletter-success';
        successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Merci pour votre inscription !';
        
        this.form.innerHTML = '';
        this.form.appendChild(successMessage);
    }
}

/* ============================================================
   6. CLASSE FORMULAIRE DE CANDIDATURE
   ============================================================ */
class ApplicationForm {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            ...options
        };

        this.init();
    }

    init() {
        this.validator = new FormValidator(this.form);
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileInput = this.form.querySelector('input[type="file"]');
        const fileInfo = this.form.querySelector('.file-info');
        
        if (!fileInput) return;

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            
            if (!file) return;

            // Vérifier la taille
            if (file.size > this.options.maxFileSize) {
                alert('Le fichier est trop volumineux. Taille maximale : 5MB.');
                fileInput.value = '';
                return;
            }

            // Vérifier l'extension
            const extension = file.name.split('.').pop().toLowerCase();
            if (!this.options.allowedFileTypes.includes(extension)) {
                alert(`Format non autorisé. Formats acceptés : ${this.options.allowedFileTypes.join(', ')}`);
                fileInput.value = '';
                return;
            }

            // Afficher les infos du fichier
            if (fileInfo) {
                fileInfo.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                    <span class="file-size">(${(file.size / 1024).toFixed(2)} KB)</span>
                `;
            }
        });
    }
}

/* ============================================================
   7. STYLES DYNAMIQUES POUR TOASTS
   ============================================================ */
const formStyles = document.createElement('style');
formStyles.textContent = `
    .form-toast {
        position: fixed;
        bottom: 30px;
        right: 30px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        max-width: 400px;
        min-width: 300px;
    }
    
    .form-toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .form-toast.toast-success {
        border-left: 4px solid #28A745;
    }
    
    .form-toast.toast-error {
        border-left: 4px solid #DC3545;
    }
    
    .form-toast .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
    }
    
    .form-toast.toast-success .toast-icon {
        color: #28A745;
    }
    
    .form-toast.toast-error .toast-icon {
        color: #DC3545;
    }
    
    .form-toast .toast-message {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: #343A40;
    }
    
    .form-toast .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6C757D;
        font-size: 16px;
        padding: 4px;
        transition: color 0.2s;
    }
    
    .form-toast .toast-close:hover {
        color: #343A40;
    }
    
    .newsletter-success {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px;
        background: rgba(40, 167, 69, 0.1);
        border-radius: 8px;
        color: #28A745;
        font-weight: 500;
    }
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        background: #F8F9FA;
        border-radius: 6px;
        font-size: 13px;
        margin-top: 5px;
    }
    
    .file-info .file-size {
        color: #6C757D;
        font-size: 11px;
    }
    
    .amount-btn {
        padding: 12px 20px;
        border: 2px solid #E9ECEF;
        background: #fff;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s ease;
    }
    
    .amount-btn:hover {
        border-color: #FFD13B;
        background: #FFFDF5;
    }
    
    .amount-btn.selected {
        border-color: #FFD13B;
        background: #FFD13B;
        color: #08264B;
        box-shadow: 0 4px 15px rgba(255, 209, 59, 0.4);
    }
    
    @media (max-width: 768px) {
        .form-toast {
            bottom: 15px;
            right: 15px;
            left: 15px;
            min-width: auto;
            max-width: none;
        }
    }
`;
document.head.appendChild(formStyles);

/* ============================================================
   8. EXPORTATION GLOBALE
   ============================================================ */
window.FormValidator = FormValidator;
window.FormSubmitter = FormSubmitter;
window.ContactForm = ContactForm;
window.DonationForm = DonationForm;
window.NewsletterForm = NewsletterForm;
window.ApplicationForm = ApplicationForm;

/* ============================================================
   9. INITIALISATION AUTOMATIQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    try {
        const forms = [];
        
        // Détecter les formulaires par data-form-type
        document.querySelectorAll('form[data-form-type]').forEach(form => {
            const type = form.getAttribute('data-form-type');
            
            switch (type) {
                case 'contact':
                    forms.push(new ContactForm(form));
                    break;
                case 'donation':
                    forms.push(new DonationForm(form));
                    break;
                case 'newsletter':
                    forms.push(new NewsletterForm(form));
                    break;
                case 'application':
                    forms.push(new ApplicationForm(form));
                    break;
                default:
                    // Formulaire générique
                    const validator = new FormValidator(form);
                    forms.push({ validator });
                    break;
            }
        });

        // Détecter par ID
        const contactFormEl = document.getElementById('contact-form');
        if (contactFormEl && !contactFormEl.hasAttribute('data-form-type')) {
            forms.push(new ContactForm(contactFormEl));
        }

        const donationFormEl = document.getElementById('donation-form');
        if (donationFormEl && !donationFormEl.hasAttribute('data-form-type')) {
            forms.push(new DonationForm(donationFormEl));
        }

        const newsletterFormEl = document.getElementById('newsletter-form');
        if (newsletterFormEl && !newsletterFormEl.hasAttribute('data-form-type')) {
            forms.push(new NewsletterForm(newsletterFormEl));
        }

        window.forms = forms;
        
        console.log('✅ Formulaires initialisés avec succès');
        console.log(`📝 ${forms.length} formulaires détectés`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des formulaires :', error);
    }
});

/* ============================================================
   FIN DU FICHIER FORMS.JS
   ============================================================ */