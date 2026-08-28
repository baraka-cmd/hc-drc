/* ============================================================
   HOPE CHILD-DRC — DON.JS
   Scripts Spécifiques de la Page Faire un Don
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la page Don,
                 sélection de montants, tabs unique/mensuel,
                 validation du formulaire, PayPal,
                 accordéon FAQ, toast notifications
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION DON
   ============================================================ */
const DonConfig = {
    /* Montants */
    amounts: {
        suggested: [10, 25, 50, 100],
        minAmount: 1,
        maxAmount: 10000,
        currency: 'USD',
        storageKey: 'hc_drc_don_amount'
    },

    /* Tabs */
    tabs: {
        defaultTab: 'unique',
        storageKey: 'hc_drc_don_type'
    },

    /* Formulaire */
    form: {
        validationOnInput: true,
        validationOnBlur: true,
        resetOnSuccess: true,
        submitDelay: 2000,
        storageKey: 'hc_drc_donations'
    },

    /* PayPal */
    paypal: {
        enabled: true,
        email: 'hopechilddrc@gmail.com',
        buttonId: 'paypal-donate-btn',
        currency: 'USD'
    },

    /* FAQ */
    faq: {
        animationDuration: 300
    },

    /* Toast */
    toast: {
        duration: 5000,
        animationDuration: 300
    }
};

/* ============================================================
   2. ÉTAT DON
   ============================================================ */
const DonState = {
    initialized: false,
    isSubmitting: false,
    selectedAmount: null,
    selectedTab: 'unique',
    customAmount: null,
    fields: {
        name: { valid: false, touched: false },
        email: { valid: false, touched: false },
        amount: { valid: false, touched: false },
        type: { valid: false, touched: false }
    }
};

/* ============================================================
   3. CLASSE PRINCIPALE DON
   ============================================================ */
class DonPage {
    constructor() {
        /* Références DOM */
        this.tabsNav = null;
        this.tabButtons = [];
        this.amountCards = [];
        this.selectAmountButtons = [];
        this.customAmountInput = null;
        this.donForm = null;
        this.nameInput = null;
        this.emailInput = null;
        this.amountInput = null;
        this.typeSelect = null;
        this.submitBtn = null;
        this.paypalBtn = null;
        this.faqAccordion = null;
        this.faqItems = [];
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
            if (!DonState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        /* Récupérer les éléments DOM */
        this.cacheElements();

        /* Vérifier que les éléments essentiels existent */
        if (!this.donForm && this.amountCards.length === 0) {
            console.warn('⚠️ Page Don introuvable');
            return;
        }

        DonState.initialized = true;

        /* Initialiser les modules */
        this.restoreState();
        this.initTabs();
        this.initAmountSelection();
        this.initCustomAmount();
        this.initFormValidation();
        this.initPayPal();
        this.initFAQ();
        this.createToastElement();

        console.log('✅ Page Don initialisée');
    }

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.tabsNav = document.getElementById('don-tabs-nav');
        this.tabButtons = Array.from(document.querySelectorAll('.don-tab-btn'));
        this.amountCards = Array.from(document.querySelectorAll('.donate-amount-card'));
        this.selectAmountButtons = Array.from(document.querySelectorAll('.select-amount-btn'));
        this.customAmountInput = document.getElementById('custom-amount');
        this.donForm = document.getElementById('don-form');
        this.nameInput = document.getElementById('don-name');
        this.emailInput = document.getElementById('don-email');
        this.amountInput = document.getElementById('don-amount');
        this.typeSelect = document.getElementById('don-type');
        this.submitBtn = this.donForm ? this.donForm.querySelector('.don-submit-btn') : null;
        this.paypalBtn = document.getElementById('paypal-donate-btn');
        this.faqAccordion = document.getElementById('don-faq-accordion');
        this.faqItems = Array.from(document.querySelectorAll('#don-faq-accordion .accordion-item'));
    }

    /* ============================================================
       4. RESTAURATION DE L'ÉTAT
       ============================================================ */
    restoreState() {
        /* Restaurer le montant */
        const savedAmount = localStorage.getItem(DonConfig.amounts.storageKey);
        if (savedAmount) {
            const amount = parseInt(savedAmount);
            if (!isNaN(amount) && amount > 0) {
                DonState.selectedAmount = amount;
                this.highlightAmountCard(amount);
                if (this.amountInput) {
                    this.amountInput.value = amount;
                }
            }
        }

        /* Restaurer le type de don */
        const savedTab = localStorage.getItem(DonConfig.tabs.storageKey);
        if (savedTab && (savedTab === 'unique' || savedTab === 'mensuel')) {
            DonState.selectedTab = savedTab;
            this.updateTabsUI();
            if (this.typeSelect) {
                this.typeSelect.value = savedTab;
            }
        }
    }

    /* ============================================================
       5. TABS UNIQUE/MENSUEL
       ============================================================ */
    initTabs() {
        if (!this.tabsNav || this.tabButtons.length === 0) return;

        this.tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                if (!tab) return;

                this.setTab(tab);
            });
        });

        console.log('✅ Tabs initialisés');
    }

    setTab(tab) {
        if (tab === DonState.selectedTab) return;

        DonState.selectedTab = tab;
        localStorage.setItem(DonConfig.tabs.storageKey, tab);

        this.updateTabsUI();

        /* Mettre à jour le select du formulaire */
        if (this.typeSelect) {
            this.typeSelect.value = tab;
            DonState.fields.type.valid = true;
        }

        console.log('🔄 Type de don : ' + tab);
    }

    updateTabsUI() {
        this.tabButtons.forEach((button) => {
            const buttonTab = button.getAttribute('data-tab');
            const isActive = buttonTab === DonState.selectedTab;

            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    /* ============================================================
       6. SÉLECTION DE MONTANT
       ============================================================ */
    initAmountSelection() {
        /* Clic sur une carte de montant */
        this.amountCards.forEach((card) => {
            card.addEventListener('click', (e) => {
                /* Ignorer si on clique sur le bouton */
                if (e.target.closest('.select-amount-btn')) return;

                const amount = parseInt(card.getAttribute('data-amount'));
                if (!isNaN(amount)) {
                    this.selectAmount(amount);
                }
            });
        });

        /* Clic sur le bouton sélectionner */
        this.selectAmountButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const amount = parseInt(button.getAttribute('data-amount'));
                if (!isNaN(amount)) {
                    this.selectAmount(amount);
                }
            });
        });

        console.log('✅ Sélection de montants initialisée');
    }

    selectAmount(amount) {
        DonState.selectedAmount = amount;
        DonState.customAmount = null;

        /* Sauvegarder */
        localStorage.setItem(DonConfig.amounts.storageKey, amount);

        /* Mettre à jour l'UI */
        this.highlightAmountCard(amount);

        /* Mettre à jour le champ montant */
        if (this.amountInput) {
            this.amountInput.value = amount;
            DonState.fields.amount.valid = true;
            this.amountInput.classList.remove('error');
            this.amountInput.classList.add('success');
        }

        /* Effacer le montant personnalisé */
        if (this.customAmountInput) {
            this.customAmountInput.value = '';
        }

        /* Afficher le toast */
        this.showToast('💰 Montant sélectionné : ' + amount + ' ' + DonConfig.amounts.currency, 'info');

        console.log('💰 Montant sélectionné : ' + amount);
    }

    highlightAmountCard(amount) {
        this.amountCards.forEach((card) => {
            const cardAmount = parseInt(card.getAttribute('data-amount'));
            const isSelected = cardAmount === amount;

            card.classList.toggle('selected', isSelected);

            /* Mettre à jour le bouton */
            const btn = card.querySelector('.select-amount-btn');
            if (btn) {
                if (isSelected) {
                    btn.textContent = '✓ Sélectionné';
                    btn.style.background = 'var(--color-accent)';
                    btn.style.color = 'var(--color-white)';
                    btn.style.borderColor = 'var(--color-accent)';
                } else {
                    btn.textContent = 'Sélectionner';
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                }
            }
        });
    }

    /* ============================================================
       7. MONTANT PERSONNALISÉ
       ============================================================ */
    initCustomAmount() {
        if (!this.customAmountInput) return;

        this.customAmountInput.addEventListener('input', () => {
            const value = parseInt(this.customAmountInput.value);

            if (!isNaN(value) && value >= DonConfig.amounts.minAmount) {
                DonState.customAmount = value;
                DonState.selectedAmount = null;

                /* Désélectionner toutes les cartes */
                this.amountCards.forEach((card) => {
                    card.classList.remove('selected');
                    const btn = card.querySelector('.select-amount-btn');
                    if (btn) {
                        btn.textContent = 'Sélectionner';
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    }
                });

                /* Mettre à jour le champ montant */
                if (this.amountInput) {
                    this.amountInput.value = value;
                    DonState.fields.amount.valid = true;
                }
            }
        });

        console.log('✅ Montant personnalisé initialisé');
    }

    /* ============================================================
       8. VALIDATION DU FORMULAIRE
       ============================================================ */
    initFormValidation() {
        if (!this.donForm) return;

        /* Soumission */
        this.donForm.addEventListener('submit', (e) => {
            const isValid = this.validateAllFields();
            
            if (!isValid) {
                e.preventDefault();
                this.showToast('⚠️ Veuillez corriger les erreurs du formulaire', 'error');
                this.scrollToFirstError();
            }
            /* Si valide → Netlify Forms capture automatiquement */
        });

        /* Validation en temps réel */
        if (DonConfig.form.validationOnInput) {
            this.initRealTimeValidation();
        }

        console.log('✅ Validation du formulaire initialisée');
    }

    initRealTimeValidation() {
        if (this.nameInput) {
            this.nameInput.addEventListener('input', () => this.validateName());
        }

        if (this.emailInput) {
            this.emailInput.addEventListener('input', () => this.validateEmail());
        }

        if (this.amountInput) {
            this.amountInput.addEventListener('input', () => this.validateAmount());
        }

        if (this.typeSelect) {
            this.typeSelect.addEventListener('change', () => {
                this.validateType();
                this.setTab(this.typeSelect.value);
            });
        }
    }

    validateName() {
        const value = this.nameInput ? this.nameInput.value.trim() : '';
        const isValid = value.length >= 2;
        DonState.fields.name.valid = isValid;
        this.toggleFieldError('don-name', 'don-name-error', !isValid);
        return isValid;
    }

    validateEmail() {
        const value = this.emailInput ? this.emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        DonState.fields.email.valid = isValid;
        this.toggleFieldError('don-email', 'don-email-error', !isValid);
        return isValid;
    }

    validateAmount() {
        const value = this.amountInput ? parseInt(this.amountInput.value) : NaN;
        const isValid = !isNaN(value) && value >= DonConfig.amounts.minAmount && value <= DonConfig.amounts.maxAmount;
        DonState.fields.amount.valid = isValid;
        this.toggleFieldError('don-amount', 'don-amount-error', !isValid);
        return isValid;
    }

    validateType() {
        const value = this.typeSelect ? this.typeSelect.value : '';
        const isValid = value === 'unique' || value === 'mensuel';
        DonState.fields.type.valid = isValid;
        this.toggleFieldError('don-type', 'don-type-error', !isValid);
        return isValid;
    }

    validateAllFields() {
        const nameValid = this.validateName();
        const emailValid = this.validateEmail();
        const amountValid = this.validateAmount();
        const typeValid = this.validateType();

        return nameValid && emailValid && amountValid && typeValid;
    }

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
       9. SOUMISSION DU FORMULAIRE
       ============================================================ */
    handleSubmit() {
        if (DonState.isSubmitting) return;

        const isValid = this.validateAllFields();

        if (!isValid) {
            this.showToast('⚠️ Veuillez corriger les erreurs du formulaire', 'error');
            this.scrollToFirstError();
            return;
        }

        DonState.isSubmitting = true;
        this.setSubmittingState(true);

        /* Récupérer les données */
        const formData = this.getDonData();

        /* Simuler le traitement */
        setTimeout(() => {
            this.saveDonation(formData);
            this.handleSuccess(formData);
        }, DonConfig.form.submitDelay);
    }

    getDonData() {
        return {
            name: this.nameInput ? this.nameInput.value.trim() : '',
            email: this.emailInput ? this.emailInput.value.trim() : '',
            amount: this.amountInput ? parseInt(this.amountInput.value) : 0,
            type: this.typeSelect ? this.typeSelect.value : DonState.selectedTab,
            message: document.getElementById('don-message') ? 
                document.getElementById('don-message').value.trim() : '',
            date: new Date().toISOString()
        };
    }

    saveDonation(formData) {
        const storageKey = DonConfig.form.storageKey;

        let donations = [];
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                donations = JSON.parse(stored);
            }
        } catch (err) {
            donations = [];
        }

        donations.push(formData);

        if (donations.length > 100) {
            donations = donations.slice(-100);
        }

        localStorage.setItem(storageKey, JSON.stringify(donations));

        console.log('💰 Don enregistré :');
        console.log('   - Donateur : ' + formData.name + ' (' + formData.email + ')');
        console.log('   - Montant : ' + formData.amount + ' ' + DonConfig.amounts.currency);
        console.log('   - Type : ' + formData.type);
    }

    handleSuccess(formData) {
        DonState.isSubmitting = false;
        this.setSubmittingState(false);

        /* Toast de succès */
        this.showToast('🎉 Merci pour votre don de ' + formData.amount + ' ' + 
            DonConfig.amounts.currency + ' !', 'success');

        /* Réinitialiser */
        if (DonConfig.form.resetOnSuccess) {
            this.donForm.reset();
            this.resetSelection();
        }

        console.log('✅ Don soumis avec succès');
    }

    resetSelection() {
        DonState.selectedAmount = null;
        DonState.customAmount = null;

        this.amountCards.forEach((card) => {
            card.classList.remove('selected');
            const btn = card.querySelector('.select-amount-btn');
            if (btn) {
                btn.textContent = 'Sélectionner';
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        });

        const allInputs = this.donForm.querySelectorAll('.form-control');
        allInputs.forEach((input) => {
            input.classList.remove('error', 'success');
        });

        const allErrors = this.donForm.querySelectorAll('.form-error-message');
        allErrors.forEach((error) => {
            error.classList.remove('visible');
        });

        Object.keys(DonState.fields).forEach((key) => {
            DonState.fields[key].valid = false;
            DonState.fields[key].touched = false;
        });
    }

    setSubmittingState(isSubmitting) {
        if (!this.submitBtn) return;

        if (isSubmitting) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            const originalContent = this.submitBtn.innerHTML;
            this.submitBtn.dataset.originalContent = originalContent;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
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
        const firstError = this.donForm.querySelector('.form-control.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus({ preventScroll: true });
        }
    }

    /* ============================================================
       10. PAYPAL
       ============================================================ */
    initPayPal() {
        if (!this.paypalBtn || !DonConfig.paypal.enabled) return;

        this.paypalBtn.addEventListener('click', () => {
            const amount = DonState.selectedAmount || DonState.customAmount || 
                (this.amountInput ? parseInt(this.amountInput.value) : 0);

            if (!amount || amount <= 0) {
                this.showToast('⚠️ Veuillez d\'abord sélectionner un montant', 'error');
                return;
            }

            this.showToast('🔗 Redirection vers PayPal pour ' + amount + ' ' + 
                DonConfig.paypal.currency + '...', 'info');

            /* Simulation de redirection PayPal */
            console.log('💰 PayPal : ' + amount + ' ' + DonConfig.paypal.currency + 
                ' → ' + DonConfig.paypal.email);
        });

        console.log('✅ PayPal initialisé');
    }

    /* ============================================================
       11. FAQ ACCORDÉON
       ============================================================ */
    initFAQ() {
        if (!this.faqAccordion || this.faqItems.length === 0) return;

        this.faqItems.forEach((item) => {
            const header = item.querySelector('.accordion-header');
            if (!header) return;

            header.addEventListener('click', () => {
                this.toggleFAQItem(item);
            });
        });

        /* Ouvrir le premier item par défaut */
        if (this.faqItems.length > 0) {
            this.faqItems[0].classList.add('active');
        }

        console.log('✅ FAQ initialisée');
    }

    toggleFAQItem(item) {
        const isActive = item.classList.contains('active');

        /* Fermer tous les items */
        this.faqItems.forEach((faqItem) => {
            faqItem.classList.remove('active');
        });

        /* Ouvrir l'item cliqué s'il n'était pas actif */
        if (!isActive) {
            item.classList.add('active');
        }
    }

    /* ============================================================
       12. TOAST NOTIFICATIONS
       ============================================================ */
    createToastElement() {
        const existingToast = document.querySelector('.don-toast');
        if (existingToast) existingToast.remove();

        this.toastElement = document.createElement('div');
        this.toastElement.className = 'don-toast';
        document.body.appendChild(this.toastElement);

        console.log('✅ Toast créé');
    }

    showToast(message, type = 'success') {
        if (!this.toastElement) return;

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastElement.textContent = message;
        this.toastElement.className = 'don-toast toast-' + type;
        this.toastElement.classList.add('visible');

        this.toastTimer = setTimeout(() => {
            this.toastElement.classList.remove('visible');
        }, DonConfig.toast.duration);

        console.log('🔔 Toast : ' + message);
    }

    /* ============================================================
       13. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...DonState };
    }

    getSelectedAmount() {
        return DonState.selectedAmount || DonState.customAmount;
    }

    resetAll() {
        this.resetSelection();
        DonState.selectedTab = 'unique';
        this.updateTabsUI();
        if (this.typeSelect) {
            this.typeSelect.value = 'unique';
        }
    }

    destroy() {
        DonState.initialized = false;
        DonState.isSubmitting = false;

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        if (this.toastElement) {
            this.toastElement.remove();
        }

        console.log('🗑️ Page Don détruite');
    }
}

/* ============================================================
   14. EXPORTATION GLOBALE
   ============================================================ */
window.DonPage = DonPage;
window.DonConfig = DonConfig;
window.DonState = DonState;

/* ============================================================
   15. DÉMARRAGE
   ============================================================ */
let donPageInstance = null;

function initDonPage() {
    if (!donPageInstance) {
        donPageInstance = new DonPage();
    }
    return donPageInstance;
}

/* Initialiser au chargement */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initDonPage();
    });
} else {
    initDonPage();
}

/* Réinitialiser quand le layout est prêt */
document.addEventListener('layout-ready', () => {
    if (!DonState.initialized) {
        initDonPage();
    }
});

/* ============================================================
   FIN DU FICHIER DON.JS
   ============================================================ */