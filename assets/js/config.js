/* ============================================================
   HOPE CHILD-DRC — CONFIG.JS
   Configuration Globale du Site
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Configuration centrale du site,
                 constantes, URLs, paramètres, données statiques
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION PRINCIPALE
   ============================================================ */
const CONFIG = {
    /* ========== INFORMATIONS DU SITE ========== */
    site: {
        name: 'HOPE CHILD-DRC',
        acronym: 'HC-DRC',
        slogan: 'Sauvons des vies',
        motto: 'Agir pour l\'humanité',
        description: 'HOPE CHILD-DRC est une ONG de développement basée à Goma, RDC. Nous œuvrons pour la protection, l\'éducation et le bien-être des enfants vulnérables depuis 2021.',
        keywords: 'ONG, RDC, Goma, enfants vulnérables, protection enfant, éducation, santé, nutrition, humanitaire, développement',
        author: 'HOPE CHILD-DRC',
        url: 'https://www.hopechilddrc.org',
        baseUrl: '/hope-child-drc',
        domain: 'hopechilddrc.org',
        yearCreated: 2021,
        dateCreated: '2021-05-25',
        version: '1.0.0',
        language: 'fr',
        languages: ['fr', 'en'],
        defaultLanguage: 'fr',
        timezone: 'Africa/Lubumbashi',
        locale: 'fr-CD'
    },

    /* ========== LOGO & IMAGES ========== */
    logo: {
        main: 'assets/images/logo/logo-main.png',
        white: 'assets/images/logo/logo-white.png',
        dark: 'assets/images/logo/logo-dark.png',
        favicon: 'assets/images/logo/favicon.ico',
        appleTouchIcon: 'assets/images/logo/apple-touch-icon.png',
        ogImage: 'assets/images/logo/og-image.jpg',
        width: 200,
        height: 200,
        alt: 'HOPE CHILD-DRC Logo'
    },

    /* ========== COULEURS (Doit correspondre à themes.css) ========== */
    colors: {
        primary: '#08264B',
        primaryDark: '#051A33',
        primaryLight: '#0D3B6E',
        secondary: '#FFD13B',
        secondaryDark: '#E6B800',
        secondaryLight: '#FFE066',
        accent: '#FF4500',
        accentDark: '#CC3700',
        accentLight: '#FF6B33',
        info: '#00A3DA',
        infoDark: '#0082B3',
        infoLight: '#66C9EB',
        white: '#FFFFFF',
        offWhite: '#F8F9FA',
        light: '#F1F3F5',
        lightGray: '#E9ECEF',
        gray: '#ADB5BD',
        grayDark: '#6C757D',
        dark: '#343A40',
        black: '#1A1A2E'
    },

    /* ========== CONTACT ========== */
    contact: {
        email: {
            main: 'hopechilddrc@gmail.com',
            info: 'info@hopechilddrc.org',
            contact: 'contact@hopechilddrc.org',
            donation: 'don@hopechilddrc.org',
            partnership: 'partenariat@hopechilddrc.org',
            career: 'recrutement@hopechilddrc.org'
        },
        phone: {
            main: '+243 995 349 736',
            whatsapp1: '+243995349736',
            whatsapp2: '+243901945827',
            mobile1: '+243 995 349 736',
            mobile2: '+243 901 945 827'
        },
        address: {
            street: '',
            city: 'Goma',
            province: 'Nord-Kivu',
            country: 'République Démocratique du Congo',
            countryCode: 'RDC',
            postalCode: '',
            full: 'Goma, Nord-Kivu, République Démocratique du Congo',
            googleMaps: 'https://maps.google.com/?q=Goma,Nord-Kivu,RDC',
            latitude: -1.6792,
            longitude: 29.2236
        },
        hours: {
            monday: '08:00 - 17:00',
            tuesday: '08:00 - 17:00',
            wednesday: '08:00 - 17:00',
            thursday: '08:00 - 17:00',
            friday: '08:00 - 17:00',
            saturday: '09:00 - 13:00',
            sunday: 'Fermé',
            timezone: 'UTC+2'
        }
    },

    /* ========== RÉSEAUX SOCIAUX ========== */
    socials: {
        facebook: {
            name: 'Facebook',
            url: 'https://www.facebook.com/profile.php?id=61576466769997',
            handle: 'HOPE CHILD-DRC',
            icon: 'fab fa-facebook-f',
            color: '#1877F2'
        },
        linkedin: {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/hopechild-drc-801a04362',
            handle: 'HOPE CHILD-DRC',
            icon: 'fab fa-linkedin-in',
            color: '#0A66C2'
        },
        youtube: {
            name: 'YouTube',
            url: 'https://youtube.com/@hopechilddrc',
            handle: '@hopechilddrc',
            icon: 'fab fa-youtube',
            color: '#FF0000'
        },
        twitter: {
            name: 'Twitter / X',
            url: 'https://x.com/HopechildDrc',
            handle: '@HopechildDrc',
            icon: 'fab fa-x-twitter',
            color: '#000000'
        },
        whatsapp: {
            name: 'WhatsApp',
            url: 'https://wa.me/243995349736',
            handle: '+243 995 349 736',
            icon: 'fab fa-whatsapp',
            color: '#25D366'
        }
    },

    /* ========== NAVIGATION ========== */
    navigation: {
        breakpoint: 768,
        closeOnClick: true,
        closeOnOutside: true,
        dropdownOnHover: true,
        dropdownOnClickMobile: true,
        activeClass: 'active',
        scrolledClass: 'scrolled',
        menuOpenClass: 'active',
        scrollThreshold: 50,
        animationDuration: 300
    },

    /* ========== LOADER ========== */
    loader: {
        enabled: true,
        minDuration: 1500,
        maxDuration: 5000,
        fadeOutDuration: 500,
        showLogo: true,
        showSpinner: true,
        showText: true,
        showDots: true,
        backgroundColor: '#08264B'
    },

    /* ========== CAROUSEL ========== */
    carousel: {
        autoplay: true,
        autoplaySpeed: 5000,
        transitionSpeed: 800,
        pauseOnHover: true,
        infinite: true,
        showArrows: true,
        showDots: true,
        swipeEnabled: true,
        keyboardEnabled: true,
        swipeThreshold: 50
    },

    /* ========== ANIMATIONS ========== */
    animations: {
        scrollReveal: true,
        counterAnimation: true,
        parallaxEffect: true,
        hoverEffects: true,
        staggerDelay: 100,
        revealDistance: '60px',
        revealDuration: 800,
        counterDuration: 2000,
        respectReducedMotion: true
    },

    /* ========== TRANSLATION ========== */
    translation: {
        enabled: true,
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en'],
        persistLanguage: true,
        storageKey: 'hc_drc_language',
        translationsFile: 'data/translations.json',
        fallbackLanguage: 'fr'
    },

    /* ========== FORMULAIRE ========== */
    forms: {
        validateOnSubmit: true,
        validateOnBlur: true,
        validateOnInput: true,
        showErrorMessages: true,
        showSuccessMessages: true,
        successMessageDuration: 5000,
        errorMessageDuration: 5000,
        submitOnEnter: true,
        resetOnSuccess: true,
        scrollToError: true
    },

    /* ========== PAGINATION ========== */
    pagination: {
        itemsPerPage: 9,
        maxButtons: 5,
        showFirstLast: true,
        showPrevNext: true,
        firstLabel: '«',
        lastLabel: '»',
        prevLabel: '‹',
        nextLabel: '›',
        ellipsisLabel: '…'
    },

    /* ========== FILTRES ========== */
    filters: {
        defaultCategory: 'all',
        animationDuration: 300,
        showAllButton: true,
        allButtonLabel: 'Tous',
        filterByDataAttribute: 'data-category'
    },

    /* ========== GALERIE ========== */
    gallery: {
        lightboxEnabled: true,
        imagePreviewOnClick: true,
        showCaption: true,
        showCounter: true,
        keyboardNavigation: true,
        closeOnOutsideClick: true,
        closeOnEscape: true
    },

    /* ========== MODAL ========== */
    modal: {
        closeOnEscape: true,
        closeOnOutsideClick: true,
        showCloseButton: true,
        animationDuration: 300,
        preventBodyScroll: true
    },

    /* ========== TOOLTIP ========== */
    tooltip: {
        position: 'top',
        animationDuration: 200,
        showDelay: 100,
        hideDelay: 200
    },

    /* ========== TOAST / NOTIFICATION ========== */
    toast: {
        position: 'bottom-right',
        duration: 5000,
        animationDuration: 300,
        showCloseButton: true,
        maxVisible: 5
    },

    /* ========== BACK TO TOP ========== */
    backToTop: {
        enabled: true,
        showAfter: 500,
        scrollDuration: 500,
        offset: 100
    },

    /* ========== SCROLL INDICATOR ========== */
    scrollIndicator: {
        enabled: true,
        position: 'top',
        color: '#FFD13B',
        height: '4px'
    },

    /* ========== COOKIES ========== */
    cookies: {
        enabled: true,
        storageKey: 'hc_drc_cookies_consent',
        bannerTitle: '🍪 Utilisation des cookies',
        bannerText: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
        acceptButtonLabel: 'Accepter',
        rejectButtonLabel: 'Refuser',
        learnMoreUrl: 'politique-cookies.html',
        expirationDays: 365
    },

    /* ========== NEWSLETTER ========== */
    newsletter: {
        enabled: true,
        service: 'mailchimp',
        formAction: '',
        method: 'POST',
        storageKey: 'hc_drc_newsletter_subscribed'
    }
};

/* ============================================================
   2. DONNÉES STATIQUES
   ============================================================ */

/* ========== DOMAINES D'INTERVENTION ========== */
const DOMAINES = [
    {
        id: 'protection',
        nom: 'Protection',
        nomEN: 'Protection',
        icone: 'fa-shield-alt',
        couleur: '#FF4500',
        description: 'Protection des enfants vulnérables et défense de leurs droits fondamentaux',
        sousDomaines: [
            'Protection de l\'enfance',
            'Prévention des violences',
            'Réintégration familiale',
            'Soutien psychosocial',
            'Plaidoyer pour les droits'
        ]
    },
    {
        id: 'education',
        nom: 'Éducation',
        nomEN: 'Education',
        icone: 'fa-book',
        couleur: '#FFD13B',
        description: 'Accès à une éducation de qualité pour tous les enfants',
        sousDomaines: [
            'Scolarisation',
            'Formation professionnelle',
            'Éducation des adultes',
            'Alphabétisation',
            'Réintégration scolaire'
        ]
    },
    {
        id: 'securite-alimentaire',
        nom: 'Sécurité Alimentaire',
        nomEN: 'Food Security',
        icone: 'fa-wheat-alt',
        couleur: '#2ECC71',
        description: 'Garantir une alimentation adéquate pour la santé et la croissance',
        sousDomaines: [
            'Agriculture durable',
            'Nutrition',
            'Résilience climatique',
            'Moyens de subsistance',
            'Initiatives agricoles'
        ]
    },
    {
        id: 'sante-nutrition',
        nom: 'Santé & Nutrition',
        nomEN: 'Health & Nutrition',
        icone: 'fa-heartbeat',
        couleur: '#00A3DA',
        description: 'Réduction des maladies évitables et renforcement des soins de santé',
        sousDomaines: [
            'Soins de santé',
            'Lutte contre la malnutrition',
            'Hygiène',
            'Prévention des maladies',
            'Accès aux soins'
        ]
    },
    {
        id: 'wash',
        nom: 'WASH',
        nomEN: 'WASH',
        icone: 'fa-water',
        couleur: '#3498DB',
        description: 'Accès à l\'eau potable et promotion des bonnes pratiques d\'hygiène',
        sousDomaines: [
            'Eau potable',
            'Assainissement',
            'Bonnes pratiques d\'hygiène',
            'Infrastructures WASH'
        ]
    },
    {
        id: 'formation-professionnelle',
        nom: 'Formation Professionnelle',
        nomEN: 'Professional Training',
        icone: 'fa-briefcase',
        couleur: '#9B59B6',
        description: 'Formations d\'entrepreneuriat et d\'emploi pour l\'autonomie économique',
        sousDomaines: [
            'Entrepreneuriat',
            'Emploi',
            'Autonomisation économique',
            'Compétences professionnelles',
            'Insertion socio-économique'
        ]
    }
];

/* ========== ZONES D'INTERVENTION ========== */
const ZONES_INTERVENTION = [
    {
        id: 'rutshuru',
        territoire: 'Rutshuru',
        localite: 'Bisoko',
        groupement: 'Rugari',
        province: 'Nord-Kivu',
        statut: 'Terminé',
        projet: 'Éducation des adultes pour la prévention des violences et la protection des enfants',
        impact: '70 acteurs humanitaires formés',
        description: 'Renforcement des mécanismes communautaires de protection de l\'enfant'
    },
    {
        id: 'nyiragongo',
        territoire: 'Nyiragongo',
        localite: 'Turunga',
        groupement: 'Munigi',
        province: 'Nord-Kivu',
        statut: 'Terminé',
        projet: 'Autonomisation des filles par l\'éducation et le renforcement des capacités communautaires',
        impact: '35 jeunes filles mineures formées et équipées',
        description: 'Formation professionnelle et autonomisation des jeunes filles'
    },
    {
        id: 'masisi',
        territoire: 'Masisi',
        localite: 'Bweremana',
        groupement: 'Mumpfunyi Shanga',
        province: 'Nord-Kivu',
        statut: 'En cours',
        projet: 'Renforcement de la résilience climatique pour une agriculture durable',
        impact: 'Projet en cours de réalisation',
        description: 'Agriculture durable et adaptation au changement climatique'
    }
];

/* ========== PROJETS ========== */
const PROJETS = [
    {
        id: 'projet-1',
        titre: 'Renforcement des mécanismes communautaires de protection de l\'enfant',
        titreEN: 'Strengthening Community Child Protection Mechanisms',
        categorie: 'Protection',
        statut: 'Terminé',
        localisation: 'Rutshuru, Bisoko, Groupement Rugari',
        description: 'Formation de 70 acteurs humanitaires des ONG partenaires FHOVE et AVDA pour la prévention des violences et la protection des enfants.',
        impact: '70 acteurs humanitaires formés',
        beneficiaries: '70+',
        dateDebut: '2022',
        dateFin: '2023',
        partenaires: ['FHOVE', 'AVDA'],
        image: 'assets/images/projets/protection-rutshuru.jpg',
        couleur: '#FF4500'
    },
    {
        id: 'projet-2',
        titre: 'Autonomisation des filles par l\'éducation',
        titreEN: 'Girls Empowerment through Education',
        categorie: 'Éducation',
        statut: 'Terminé',
        localisation: 'Nyiragongo, Turunga, Groupement Munigi',
        description: '35 jeunes filles mineures formées et équipées en machines ordinateurs. Restauration de leur dignité et statut social.',
        impact: '35 jeunes filles mineures formées et équipées',
        beneficiaries: '35',
        dateDebut: '2023',
        dateFin: '2024',
        partenaires: [],
        image: 'assets/images/projets/education-nyiragongo.jpg',
        couleur: '#FFD13B'
    },
    {
        id: 'projet-3',
        titre: 'Résilience climatique pour une agriculture durable',
        titreEN: 'Climate Resilience for Sustainable Agriculture',
        categorie: 'Sécurité Alimentaire',
        statut: 'En cours',
        localisation: 'Masisi, Bweremana, Groupement Mumpfunyi Shanga',
        description: 'Renforcement de la résilience climatique pour une agriculture durable dans le village de Bweremana.',
        impact: 'Projet en cours de réalisation',
        beneficiaries: 'À déterminer',
        dateDebut: '2024',
        dateFin: 'En cours',
        partenaires: [],
        image: 'assets/images/projets/agriculture-masisi.jpg',
        couleur: '#2ECC71'
    }
];

/* ========== IMPACT / STATISTIQUES ========== */
const STATISTIQUES = [
    {
        id: 'stat-1',
        valeur: 70,
        suffixe: '+',
        label: 'Acteurs Humanitaires Formés',
        labelEN: 'Trained Humanitarian Workers',
        icone: 'fa-users',
        couleur: '#FF4500'
    },
    {
        id: 'stat-2',
        valeur: 35,
        suffixe: '',
        label: 'Jeunes Filles Autonomisées',
        labelEN: 'Empowered Young Girls',
        icone: 'fa-female',
        couleur: '#FFD13B'
    },
    {
        id: 'stat-3',
        valeur: 3,
        suffixe: '',
        label: 'Projets Réalisés',
        labelEN: 'Completed Projects',
        icone: 'fa-project-diagram',
        couleur: '#00A3DA'
    },
    {
        id: 'stat-4',
        valeur: 3,
        suffixe: '',
        label: 'Zones d\'Intervention',
        labelEN: 'Intervention Zones',
        icone: 'fa-map-marker-alt',
        couleur: '#2ECC71'
    },
    {
        id: 'stat-5',
        valeur: 2021,
        suffixe: '',
        label: 'Année de Création',
        labelEN: 'Year Founded',
        icone: 'fa-calendar',
        couleur: '#9B59B6'
    },
    {
        id: 'stat-6',
        valeur: 6,
        suffixe: '',
        label: 'Domaines d\'Intervention',
        labelEN: 'Intervention Domains',
        icone: 'fa-th-large',
        couleur: '#E67E22'
    }
];

/* ========== VALEURS ========== */
const VALEURS = [
    {
        id: 'valeur-1',
        nom: 'Compassion',
        nomEN: 'Compassion',
        icone: 'fa-heart',
        description: 'Nous agissons avec empathie et bienveillance envers chaque enfant et chaque communauté.',
        couleur: '#FF4500'
    },
    {
        id: 'valeur-2',
        nom: 'Intégrité',
        nomEN: 'Integrity',
        icone: 'fa-balance-scale',
        description: 'Nous agissons avec transparence, honnêteté et responsabilité dans toutes nos actions.',
        couleur: '#FFD13B'
    },
    {
        id: 'valeur-3',
        nom: 'Solidarité',
        nomEN: 'Solidarity',
        icone: 'fa-hands-helping',
        description: 'Nous unissons nos forces avec les communautés et les partenaires pour un impact durable.',
        couleur: '#00A3DA'
    },
    {
        id: 'valeur-4',
        nom: 'Respect',
        nomEN: 'Respect',
        icone: 'fa-handshake',
        description: 'Nous respectons la dignité, la culture et les droits de chaque personne.',
        couleur: '#2ECC71'
    }
];

/* ========== OBJECTIFS SPÉCIFIQUES ========== */
const OBJECTIFS_SPECIFIQUES = [
    {
        id: 'obj-1',
        titre: 'Éducation de qualité',
        description: 'Accès à l\'éducation de qualité pour tous les enfants, en particulier les plus vulnérables, et encouragement de la formation professionnelle des jeunes.',
        icone: 'fa-graduation-cap'
    },
    {
        id: 'obj-2',
        titre: 'Santé et nutrition',
        description: 'Contribuer à la réduction des maladies évitables en renforçant l\'accès aux soins de santé, à la nutrition et à l\'hygiène.',
        icone: 'fa-heartbeat'
    },
    {
        id: 'obj-3',
        titre: 'Alimentation adéquate',
        description: 'Garantir une alimentation adéquate pour assurer la santé, la croissance et le bien-être de la communauté.',
        icone: 'fa-utensils'
    },
    {
        id: 'obj-4',
        titre: 'Résilience communautaire',
        description: 'Valoriser la résilience communautaire par la promotion des initiatives agricoles de nutrition et des moyens de subsistance.',
        icone: 'fa-seedling'
    },
    {
        id: 'obj-5',
        titre: 'Eau et hygiène',
        description: 'Faciliter l\'accès à l\'eau potable, promouvoir les bonnes pratiques d\'hygiène et améliorer l\'assainissement.',
        icone: 'fa-water'
    },
    {
        id: 'obj-6',
        titre: 'Autonomie économique',
        description: 'Offrir des opportunités de formation d\'entrepreneuriat et d\'emploi pour réduire la vulnérabilité.',
        icone: 'fa-briefcase'
    },
    {
        id: 'obj-7',
        titre: 'Défense des droits',
        description: 'Défendre le droit de l\'enfant et mobiliser la communauté, le partenariat et les communautés humanitaires.',
        icone: 'fa-gavel'
    }
];

/* ========== PARTENAIRES ========== */
const PARTENAIRES = [
    {
        id: 'partenaire-1',
        nom: 'FHOVE',
        type: 'ONG Nationale',
        logo: 'assets/images/partenaires/fhove-logo.png',
        description: 'Partenaire dans le projet de protection des enfants à Rutshuru'
    },
    {
        id: 'partenaire-2',
        nom: 'AVDA',
        type: 'ONG Nationale',
        logo: 'assets/images/partenaires/avda-logo.png',
        description: 'Partenaire dans le projet de protection des enfants à Rutshuru'
    }
];

/* ========== TÉMOIGNAGES ========== */
const TEMOIGNAGES = [
    {
        id: 'temoignage-1',
        texte: 'Grâce à HOPE CHILD-DRC, j\'ai pu suivre une formation professionnelle et maintenant je peux subvenir à mes besoins.',
        auteur: 'Bénéficiaire du projet Nyiragongo',
        role: 'Jeune fille formée',
        avatar: 'assets/images/temoignages/avatar-1.jpg'
    },
    {
        id: 'temoignage-2',
        texte: 'Le renforcement des capacités nous a permis de mieux identifier et référer les cas de violence dans notre communauté.',
        auteur: 'Acteur humanitaire',
        role: 'Partenaire FHOVE',
        avatar: 'assets/images/temoignages/avatar-2.jpg'
    },
    {
        id: 'temoignage-3',
        texte: 'Le projet de résilience climatique transforme notre village et nous donne l\'espoir d\'un avenir meilleur.',
        auteur: 'Membre de la communauté',
        role: 'Bweremana, Masisi',
        avatar: 'assets/images/temoignages/avatar-3.jpg'
    }
];

/* ========== ÉVÉNEMENTS / TIMELINE ========== */
const TIMELINE = [
    {
        date: '25 Mai 2021',
        titre: 'Création de HOPE CHILD-DRC',
        description: 'Fondation de l\'organisation à Goma, Nord-Kivu, RDC'
    },
    {
        date: '2022',
        titre: 'Premier projet de protection',
        description: 'Lancement du projet de renforcement des mécanismes communautaires de protection de l\'enfant à Rutshuru'
    },
    {
        date: '2023',
        titre: 'Projet d\'autonomisation des filles',
        description: 'Formation de 35 jeunes filles à Nyiragongo'
    },
    {
        date: '2024',
        titre: 'Projet de résilience climatique',
        description: 'Début du projet d\'agriculture durable à Masisi'
    }
];

/* ============================================================
   3. FONCTIONS UTILITAIRES GLOBALES
   ============================================================ */

/**
 * Récupère une valeur de configuration imbriquée
 * @param {string} path - Chemin de la propriété (ex: 'site.name')
 * @param {*} defaultValue - Valeur par défaut si non trouvée
 * @returns {*} Valeur de configuration
 */
function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

/**
 * Récupère la langue actuelle
 * @returns {string} Code de langue actuel
 */
function getCurrentLanguage() {
    const storedLanguage = localStorage.getItem(CONFIG.translation.storageKey);
    if (storedLanguage && CONFIG.translation.supportedLanguages.includes(storedLanguage)) {
        return storedLanguage;
    }
    return CONFIG.translation.defaultLanguage;
}

/**
 * Vérifie si on est sur mobile
 * @returns {boolean} True si largeur < 768px
 */
function isMobile() {
    return window.innerWidth < CONFIG.navigation.breakpoint;
}

/**
 * Vérifie si on est sur tablette
 * @returns {boolean} True si largeur entre 768px et 1024px
 */
function isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Vérifie si on est sur desktop
 * @returns {boolean} True si largeur >= 1024px
 */
function isDesktop() {
    return window.innerWidth >= 1024;
}

/**
 * Vérifie si le mode sombre est activé
 * @returns {boolean} True si dark mode
 */
function isDarkMode() {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Vérifie si l'utilisateur préfère réduire les animations
 * @returns {boolean} True si animations réduites
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Formate un nombre avec séparateurs
 * @param {number} number - Nombre à formater
 * @returns {string} Nombre formaté
 */
function formatNumber(number) {
    return new Intl.NumberFormat('fr-FR').format(number);
}

/**
 * Formate une date en français
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));
}

/**
 * Tronque un texte
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Convertit une chaîne en slug URL
 * @param {string} text - Texte à convertir
 * @returns {string} Slug URL
 */
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Détecte le type d'appareil
 * @returns {string} 'mobile', 'tablet', ou 'desktop'
 */
function getDeviceType() {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
}

/**
 * Obtient les paramètres URL
 * @returns {Object} Paramètres URL
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    return result;
}

/**
 * Construit une URL avec paramètres
 * @param {string} baseUrl - URL de base
 * @param {Object} params - Paramètres à ajouter
 * @returns {string} URL complète
 */
function buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    return url.toString();
}

/* ============================================================
   4. EXPORTATION
   ============================================================ */

// Exposition globale pour les autres fichiers JS
window.CONFIG = CONFIG;
window.DOMAINES = DOMAINES;
window.ZONES_INTERVENTION = ZONES_INTERVENTION;
window.PROJETS = PROJETS;
window.STATISTIQUES = STATISTIQUES;
window.VALEURS = VALEURS;
window.OBJECTIFS_SPECIFIQUES = OBJECTIFS_SPECIFIQUES;
window.PARTENAIRES = PARTENAIRES;
window.TEMOIGNAGES = TEMOIGNAGES;
window.TIMELINE = TIMELINE;

window.getConfig = getConfig;
window.getCurrentLanguage = getCurrentLanguage;
window.isMobile = isMobile;
window.isTablet = isTablet;
window.isDesktop = isDesktop;
window.isDarkMode = isDarkMode;
window.prefersReducedMotion = prefersReducedMotion;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.truncateText = truncateText;
window.slugify = slugify;
window.getDeviceType = getDeviceType;
window.getUrlParams = getUrlParams;
window.buildUrl = buildUrl;

/* ============================================================
   5. INITIALISATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    console.log(`✅ ${CONFIG.site.name} - Configuration chargée`);
    console.log(`📌 Version: ${CONFIG.site.version}`);
    console.log(`🌐 Langue: ${getCurrentLanguage()}`);
    console.log(`📱 Appareil: ${getDeviceType()}`);
    
    // Définir la langue sur l'élément HTML
    document.documentElement.setAttribute('lang', getCurrentLanguage());
    
    // Définir le thème
    if (isDarkMode()) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

/* ============================================================
   FIN DU FICHIER CONFIG.JS
   ============================================================ */