/* ============================================================
   HOPE CHILD-DRC — PROJET-DETAIL.JS (DYNAMIQUE)
   Version : 2.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Chargement dynamique des données du projet
                 selon ?id=projet-X, onglets, accordéon,
                 galerie, lightbox, animations
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION PROJET DETAIL
   ============================================================ */
const ProjetDetailConfig = {
    /* Données */
    dataFile: 'data/projets.json',
    defaultProjectId: 'projet-1',
    validProjectIds: ['projet-1', 'projet-2', 'projet-3'],

    /* Onglets */
    tabs: {
        defaultTab: 'description',
        animationDuration: 400,
        enableKeyboardNavigation: true,
        enableUrlHash: true
    },

    /* Accordéon */
    accordion: {
        allowMultiple: false,
        animationDuration: 400,
        defaultOpenIndex: 0
    },

    /* Galerie */
    gallery: {
        lightboxEnabled: true,
        animationDuration: 300
    },

    /* Animations */
    animations: {
        staggerDelay: 100,
        revealDuration: 700,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    }
};

/* ============================================================
   2. ÉTAT PROJET DETAIL
   ============================================================ */
const ProjetDetailState = {
    initialized: false,
    currentTab: 'description',
    activeAccordionItems: [],
    animationsInitialized: false,
    currentProjectId: null,
    projet: null,
    allProjets: {}
};

/* ============================================================
   3. CLASSE PRINCIPALE PROJET DETAIL
   ============================================================ */
class ProjetDetailPage {
    constructor() {
        this.tabButtons = [];
        this.tabContents = [];
        this.tabsNav = null;
        this.accordionItems = [];
        this.galleryItems = [];
        this.keyInfoCards = [];
        
        this.init();
    }

    /* ========== INITIALISATION ========== */
    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => await this.setup());
        } else {
            await this.setup();
        }
        
        document.addEventListener('layout-ready', async () => {
            if (!ProjetDetailState.initialized) {
                await this.setup();
            }
        });
    }

    async setup() {
        /* Récupérer l'ID du projet depuis l'URL */
        this.getProjectIdFromUrl();

        /* Charger les données */
        await this.loadProjectsData();

        /* Afficher le projet */
        this.renderProject();

        /* Récupérer les éléments maintenant que le contenu est rendu */
        this.cacheDynamicElements();

        /* Initialiser les modules */
        this.initTabs();
        this.initAccordion();
        this.initGallery();
        this.initScrollReveal();
        this.initKeyInfoAnimations();
        this.initSmoothScroll();
        this.animateHeroOnLoad();

        ProjetDetailState.initialized = true;
        ProjetDetailState.animationsInitialized = true;

        console.log('✅ Page Détail du Projet initialisée (dynamique)');
    }

    /* ============================================================
       4. RÉCUPÉRATION DE L'ID DU PROJET DEPUIS L'URL
       ============================================================ */
    getProjectIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id && ProjetDetailConfig.validProjectIds.includes(id)) {
            ProjetDetailState.currentProjectId = id;
        } else {
            ProjetDetailState.currentProjectId = ProjetDetailConfig.defaultProjectId;
        }

        console.log('🔍 Projet demandé : ' + ProjetDetailState.currentProjectId);
    }

    /* ============================================================
       5. CHARGEMENT DES DONNÉES
       ============================================================ */
    async loadProjectsData() {
        try {
            const response = await fetch(ProjetDetailConfig.dataFile);
            
            if (!response.ok) {
                throw new Error('Erreur de chargement : ' + response.status);
            }

            ProjetDetailState.allProjets = await response.json();
            ProjetDetailState.projet = ProjetDetailState.allProjets[ProjetDetailState.currentProjectId];

            if (!ProjetDetailState.projet) {
                throw new Error('Projet introuvable : ' + ProjetDetailState.currentProjectId);
            }

            console.log('✅ Données chargées : ' + ProjetDetailState.projet.titre);

        } catch (error) {
            console.error('❌ Erreur de chargement :', error);
            this.useConfigFallback();
        }
    }

    useConfigFallback() {
        if (typeof PROJETS !== 'undefined' && Array.isArray(PROJETS)) {
            const projet = PROJETS.find(p => p.id === ProjetDetailState.currentProjectId);
            if (projet) {
                ProjetDetailState.projet = projet;
                console.log('⚠️ Utilisation du fallback config.js');
            }
        }
    }

    /* ============================================================
       6. RENDU DU PROJET
       ============================================================ */
    renderProject() {
        const projet = ProjetDetailState.projet;
        if (!projet) return;

        /* Mettre à jour le titre de la page */
        document.title = projet.titre + ' | HOPE CHILD-DRC';

        /* Mettre à jour le breadcrumb */
        this.updateElement('breadcrumb-current', projet.categorie);

        /* Mettre à jour le hero */
        this.updateElement('project-title', projet.titre);
        this.updateElement('project-subtitle', projet.localisation.territoire + ', ' + projet.localisation.localite + ', ' + projet.localisation.province);

        /* Mettre à jour les infos clés */
        this.renderKeyInfoCards(projet);

        /* Mettre à jour la description */
        this.renderDescription(projet);

        /* Mettre à jour les objectifs */
        this.renderObjectives(projet.objectifs);

        /* Mettre à jour les activités */
        this.renderActivities(projet.activites);

        /* Mettre à jour les résultats */
        this.renderResults(projet.resultats);

        /* Mettre à jour la galerie */
        this.renderGallery(projet.galerie);

        /* Mettre à jour le texte CTA */
        this.updateElement('project-cta-text', 'Votre contribution nous aide à ' + projet.impact.toLowerCase() + '.');

        console.log('✅ Projet affiché : ' + projet.titre);
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && content) {
            element.textContent = content;
        }
    }

    /* ============================================================
       7. INFOS CLÉS DYNAMIQUES
       ============================================================ */
    renderKeyInfoCards(projet) {
        const container = document.getElementById('key-info-grid');
        if (!container) return;

        const statutClass = projet.statut === 'En cours' ? 'status-en-cours-text' : 'status-termine-text';
        const statutIcon = projet.statut === 'En cours' ? 'fa-spinner' : 'fa-check-circle';
        const partenaires = projet.partenaires && projet.partenaires.length > 0 
            ? projet.partenaires.join(', ') 
            : 'À confirmer';

        container.innerHTML = `
            <div class="key-info-card">
                <div class="key-info-icon"><i class="fas ${statutIcon}"></i></div>
                <div class="key-info-content">
                    <span class="key-info-label">Statut</span>
                    <span class="key-info-value ${statutClass}"><i class="fas fa-circle"></i> ${projet.statut}</span>
                </div>
            </div>
            <div class="key-info-card">
                <div class="key-info-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div class="key-info-content">
                    <span class="key-info-label">Localisation</span>
                    <span class="key-info-value">${projet.localisation.territoire}, ${projet.localisation.localite}</span>
                </div>
            </div>
            <div class="key-info-card">
                <div class="key-info-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="key-info-content">
                    <span class="key-info-label">Durée</span>
                    <span class="key-info-value">${projet.dates.debut} — ${projet.dates.fin}</span>
                </div>
            </div>
            <div class="key-info-card">
                <div class="key-info-icon"><i class="fas fa-users"></i></div>
                <div class="key-info-content">
                    <span class="key-info-label">Bénéficiaires</span>
                    <span class="key-info-value">${projet.beneficiaires}</span>
                </div>
            </div>
            <div class="key-info-card">
                <div class="key-info-icon"><i class="fas ${projet.categorie_icone || 'fa-tag'}"></i></div>
                <div class="key-info-content">
                    <span class="key-info-label">Domaine</span>
                    <span class="key-info-value">${projet.categorie}</span>
                </div>
            </div>
            <div class="key-info-card">
                <div class="key-info-icon"><i class="fas fa-handshake"></i></div>
                <div class="key-info-content">
                    <span class="key-info-label">Partenaires</span>
                    <span class="key-info-value">${partenaires}</span>
                </div>
            </div>
        `;
    }

    /* ============================================================
       8. DESCRIPTION DYNAMIQUE
       ============================================================ */
    renderDescription(projet) {
        const container = document.getElementById('project-description');
        const imageContainer = document.getElementById('project-image-container');
        if (!container) return;

        /* Description */
        container.innerHTML = `
            <h3 class="description-title"><i class="fas fa-info-circle"></i> Contexte du Projet</h3>
            <p class="description-paragraph">${projet.description}</p>
            <h3 class="description-title"><i class="fas fa-map-pin"></i> Sites d'Intervention</h3>
            <ul class="description-list">
                <li><i class="fas fa-check-circle"></i> ${projet.localisation.localite}</li>
                <li><i class="fas fa-check-circle"></i> Groupement ${projet.localisation.groupement}</li>
                <li><i class="fas fa-check-circle"></i> Territoire de ${projet.localisation.territoire}, Province du ${projet.localisation.province}</li>
            </ul>
        `;

        /* Image */
        if (imageContainer) {
            imageContainer.innerHTML = `
                <img src="${projet.image}" alt="${projet.titre}" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\'description-image-placeholder\'><i class=\'fas fa-image\'></i></div>';">
                <div class="description-image-badge">
                    <i class="fas ${projet.categorie_icone || 'fa-tag'}"></i>
                    ${projet.statut}
                </div>
            `;
        }
    }

    /* ============================================================
       9. OBJECTIFS DYNAMIQUES
       ============================================================ */
    renderObjectives(objectives) {
        const container = document.getElementById('objectives-grid');
        if (!container || !objectives) return;

        container.innerHTML = '';

        objectives.forEach((objectif, index) => {
            const card = document.createElement('div');
            card.className = 'objective-card-item';
            card.innerHTML = `
                <div class="objective-number">${index + 1}</div>
                <div class="objective-content">
                    <p>${objectif}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    /* ============================================================
       10. ACTIVITÉS DYNAMIQUES
       ============================================================ */
    renderActivities(activities) {
        const container = document.getElementById('activities-accordion');
        if (!container || !activities) return;

        container.innerHTML = '';

        activities.forEach((activite, index) => {
            const item = document.createElement('div');
            item.className = 'accordion-item' + (index === 0 ? ' active' : '');
            item.innerHTML = `
                <div class="accordion-header">
                    <span><i class="fas fa-tasks"></i> ${activite.titre}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="accordion-content" style="${index === 0 ? 'max-height: 500px;' : 'max-height: 0;'}">
                    <div class="accordion-body">${activite.description}</div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    /* ============================================================
       11. RÉSULTATS DYNAMIQUES
       ============================================================ */
    renderResults(results) {
        const container = document.getElementById('results-grid');
        if (!container || !results) return;

        container.innerHTML = '';

        results.forEach((resultat) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="result-icon"><i class="fas fa-check-circle"></i></div>
                <div class="result-label">${resultat}</div>
            `;
            container.appendChild(card);
        });

        /* Progression pour les projets en cours */
        const progressContainer = document.getElementById('results-progress');
        if (progressContainer && ProjetDetailState.projet && ProjetDetailState.projet.statut === 'En cours') {
            progressContainer.innerHTML = `
                <div class="progress-label">
                    <span>Avancement global du projet</span>
                    <span class="progress-percentage">35%</span>
                </div>
                <div class="progress">
                    <div class="progress-bar progress-bar-accent" style="width: 35%;"></div>
                </div>
            `;
        }
    }

    /* ============================================================
       12. GALERIE DYNAMIQUE
       ============================================================ */
    renderGallery(images) {
        const container = document.getElementById('project-gallery');
        if (!container || !images) return;

        container.innerHTML = '';

        images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${image}" alt="Photo ${index + 1}" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\'gallery-placeholder\'><i class=\'fas fa-image\'></i></div>';">
                <div class="gallery-overlay">
                    <div class="gallery-overlay-icon"><i class="fas fa-search-plus"></i></div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    /* ============================================================
       13. CACHE DES ÉLÉMENTS DYNAMIQUES
       ============================================================ */
    cacheDynamicElements() {
        this.tabsNav = document.getElementById('project-tabs-nav') || document.querySelector('.project-tabs-nav');
        this.tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
        this.tabContents = Array.from(document.querySelectorAll('.tab-content'));
        this.accordionItems = Array.from(document.querySelectorAll('.accordion-item'));
        this.galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        this.keyInfoCards = Array.from(document.querySelectorAll('.key-info-card'));
    }

    /* ============================================================
       14. SYSTÈME D'ONGLETS
       ============================================================ */
    initTabs() {
        if (this.tabButtons.length === 0) return;

        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        if (ProjetDetailConfig.tabs.enableKeyboardNavigation) {
            this.initTabsKeyboardNavigation();
        }

        if (ProjetDetailConfig.tabs.enableUrlHash) {
            this.restoreTabFromHash();
        }

        console.log('✅ Onglets initialisés');
    }

    switchTab(tabName) {
        if (tabName === ProjetDetailState.currentTab) return;

        ProjetDetailState.currentTab = tabName;

        this.tabButtons.forEach(button => {
            const buttonTab = button.getAttribute('data-tab');
            button.classList.toggle('active', buttonTab === tabName);
            button.setAttribute('aria-selected', buttonTab === tabName ? 'true' : 'false');
        });

        this.tabContents.forEach(content => {
            const contentId = content.id.replace('tab-', '');
            const isActive = contentId === tabName;
            content.classList.toggle('active', isActive);
            content.style.display = isActive ? 'block' : 'none';
        });

        if (ProjetDetailConfig.tabs.enableUrlHash) {
            history.pushState(null, null, '#tab-' + tabName);
        }
    }

    updateHash(tabName) {
        history.pushState(null, null, '#tab-' + tabName);
    }

    restoreTabFromHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#tab-')) {
            const tabName = hash.replace('#tab-', '');
            const validTabs = this.tabButtons.map(btn => btn.getAttribute('data-tab'));
            if (validTabs.includes(tabName)) {
                setTimeout(() => this.switchTab(tabName), 300);
            }
        }
    }

    initTabsKeyboardNavigation() {
        this.tabsNav?.addEventListener('keydown', (e) => {
            const buttons = Array.from(this.tabsNav.querySelectorAll('.tab-btn'));
            const currentIndex = buttons.indexOf(document.activeElement);

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentIndex < buttons.length - 1) {
                        buttons[currentIndex + 1].focus();
                        this.switchTab(buttons[currentIndex + 1].getAttribute('data-tab'));
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        buttons[currentIndex - 1].focus();
                        this.switchTab(buttons[currentIndex - 1].getAttribute('data-tab'));
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    buttons[0].focus();
                    this.switchTab(buttons[0].getAttribute('data-tab'));
                    break;
                case 'End':
                    e.preventDefault();
                    buttons[buttons.length - 1].focus();
                    this.switchTab(buttons[buttons.length - 1].getAttribute('data-tab'));
                    break;
            }
        });
    }

    /* ============================================================
       15. ACCORDÉON
       ============================================================ */
    initAccordion() {
        if (this.accordionItems.length === 0) return;

        this.accordionItems.forEach((item, index) => {
            const header = item.querySelector('.accordion-header');
            if (!header) return;

            header.addEventListener('click', () => {
                this.toggleAccordionItem(index);
            });
        });

        console.log('✅ Accordéon initialisé');
    }

    toggleAccordionItem(index) {
        const item = this.accordionItems[index];
        if (!item) return;

        const isActive = item.classList.contains('active');

        if (!ProjetDetailConfig.accordion.allowMultiple) {
            this.accordionItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const content = otherItem.querySelector('.accordion-content');
                    if (content) content.style.maxHeight = '0';
                }
            });
        }

        const content = item.querySelector('.accordion-content');

        if (isActive) {
            item.classList.remove('active');
            if (content) content.style.maxHeight = '0';
        } else {
            item.classList.add('active');
            if (content) content.style.maxHeight = '500px';
        }
    }

    /* ============================================================
       16. GALERIE & LIGHTBOX
       ============================================================ */
    initGallery() {
        if (this.galleryItems.length === 0) return;

        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
        });

        console.log('✅ Galerie initialisée');
    }

    openLightbox(index) {
        if (!ProjetDetailConfig.gallery.lightboxEnabled) return;

        const item = this.galleryItems[index];
        if (!item) return;

        const img = item.querySelector('img');
        if (!img) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.id = 'project-lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Fermer"><i class="fas fa-times"></i></button>
            <button class="lightbox-prev" aria-label="Précédent"><i class="fas fa-chevron-left"></i></button>
            <img src="${img.src}" alt="${img.alt}">
            <button class="lightbox-next" aria-label="Suivant"><i class="fas fa-chevron-right"></i></button>
        `;

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        setTimeout(() => lightbox.classList.add('active'), 10);

        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        closeBtn.addEventListener('click', () => this.closeLightbox(lightbox));
        prevBtn.addEventListener('click', () => this.navigateLightbox(index - 1, lightbox));
        nextBtn.addEventListener('click', () => this.navigateLightbox(index + 1, lightbox));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeLightbox(lightbox);
            if (e.key === 'ArrowLeft') this.navigateLightbox(index - 1, lightbox);
            if (e.key === 'ArrowRight') this.navigateLightbox(index + 1, lightbox);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox(lightbox);
        });
    }

    navigateLightbox(newIndex, lightbox) {
        if (newIndex < 0 || newIndex >= this.galleryItems.length) return;

        const item = this.galleryItems[newIndex];
        const img = item.querySelector('img');
        if (!img) return;

        const lightboxImg = lightbox.querySelector('img');
        if (lightboxImg) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }

        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        if (prevBtn) prevBtn.onclick = () => this.navigateLightbox(newIndex - 1, lightbox);
        if (nextBtn) nextBtn.onclick = () => this.navigateLightbox(newIndex + 1, lightbox);
    }

    closeLightbox(lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => lightbox.remove(), ProjetDetailConfig.gallery.animationDuration);
    }

    /* ============================================================
       17. SCROLL REVEAL
       ============================================================ */
    initScrollReveal() {
        const elements = document.querySelectorAll('[data-aos]');
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
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
            threshold: ProjetDetailConfig.animations.threshold,
            rootMargin: ProjetDetailConfig.animations.rootMargin
        });

        elements.forEach(element => {
            element.style.transition = `all ${ProjetDetailConfig.animations.revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(40px)';
            observer.observe(element);
        });
    }

    /* ============================================================
       18. ANIMATIONS HERO
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
            setTimeout(() => breadcrumb.style.opacity = '1', 200);
        }
    }

    /* ============================================================
       19. ANIMATIONS INFOS CLÉS
       ============================================================ */
    initKeyInfoAnimations() {
        if (this.keyInfoCards.length === 0) return;

        this.keyInfoCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200 + (index * ProjetDetailConfig.animations.staggerDelay));
        });
    }

    /* ============================================================
       20. SMOOTH SCROLL
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

                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            });
        });
    }

    /* ============================================================
       21. MÉTHODES PUBLIQUES
       ============================================================ */
    getCurrentTab() {
        return ProjetDetailState.currentTab;
    }

    switchToTab(tabName) {
        this.switchTab(tabName);
    }

    getCurrentProject() {
        return ProjetDetailState.projet;
    }

    getState() {
        return { ...ProjetDetailState };
    }

    destroy() {
        ProjetDetailState.initialized = false;
        console.log('🗑️ Page Détail du Projet détruite');
    }
}

/* ============================================================
   22. EXPORTATION GLOBALE
   ============================================================ */
window.ProjetDetailPage = ProjetDetailPage;
window.ProjetDetailConfig = ProjetDetailConfig;
window.ProjetDetailState = ProjetDetailState;

/* ============================================================
   23. DÉMARRAGE
   ============================================================ */
let projetDetailPageInstance = null;

async function initProjetDetailPage() {
    if (!projetDetailPageInstance) {
        projetDetailPageInstance = new ProjetDetailPage();
    }
    return projetDetailPageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initProjetDetailPage();
    });
} else {
    initProjetDetailPage();
}

document.addEventListener('layout-ready', async () => {
    if (!ProjetDetailState.initialized) {
        await initProjetDetailPage();
    }
});

/* ============================================================
   FIN DU FICHIER PROJET-DETAIL.JS (DYNAMIQUE)
   ============================================================ */