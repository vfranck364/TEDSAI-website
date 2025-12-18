/**
 * TEDSAI CORE DATABASE
 * Système de persistance structuré (localStorage wrapper)
 * Simule une base de données NoSQL
 */

const DB_PREFIX = 'tedsai_db_';

const TedDB = {
    // Initialisation et Seeding
    init() {
        console.log("TedDB: Initializing...");
        this.createTableIfNotExists('users', [
            { id: 1, username: 'superadmin', passwordHash: 'admin123', role: 'super_admin', name: 'Super Admin' },
            { id: 2, username: 'resto', passwordHash: 'resto123', role: 'admin_resto', name: 'Chef Restaurant' },
            { id: 3, username: 'garden', passwordHash: 'garden123', role: 'admin_garden', name: 'Responsable Jardin' },
            { id: 4, username: 'ia', passwordHash: 'ia123', role: 'admin_ia', name: 'Directeur IA' }
        ]);

        this.createTableIfNotExists('menu', [
            { id: '101', name: 'Ndolé Royal', category: 'Plat', price: 6500, description: 'Le classique camerounais aux crevettes et viande fumée.', available: true, image: '../assets/images/placeholder_dish.jpg' },
            { id: '102', name: 'Salade d\'Avocat', category: 'Entrée', price: 2500, description: 'Avocats du jardin, vinaigrette aux agrumes.', available: true, image: '' },
            { id: '103', name: 'Poulet DG', category: 'Plat', price: 7000, description: 'Poulet fermier, plantains frits, légumes croquants.', available: true, image: '' },
            { id: '104', name: 'Salade de Fruits', category: 'Dessert', price: 2000, description: 'Papaye, Ananas, Mangue selon saison.', available: true, image: '' },
            { id: '105', name: 'Jus de Foléré', category: 'Boisson', price: 1000, description: 'Bissap frais, menthe et gingembre.', available: true, image: '' }
        ]);
        this.createTableIfNotExists('garden_products', [
            { id: '201', name: 'Tomate Cœur de Bœuf', variety: 'Ancienne', category: 'Légume', season: 'Été', inStock: true, image: '' },
            { id: '202', name: 'Menthe Poivrée', variety: '', category: 'Aromate', season: 'Toute l\'année', inStock: true, image: '' },
            { id: '203', name: 'Piment Jaune', variety: 'Habanero', category: 'Épice', season: 'Automne', inStock: true, image: '' },
            { id: '204', name: 'Papaye Solo', variety: '', category: 'Fruit', season: 'Saison sèche', inStock: false, image: '' }
        ]); // Produits jardin
        this.createTableIfNotExists('ia_services', [
            { id: '301', name: 'Audit de Processus', category: 'Consulting', price: 'Sur devis', description: 'Analyse complète de vos flux de travail pour identifier les opportunités d\'automatisation.', icon: 'fa-solid fa-magnifying-glass-chart', active: true },
            { id: '302', name: 'Chatbot Service Client', category: 'Développement', price: 'Dès 500€', description: 'Assistant virtuel 24/7 pour votre site web ou WhatsApp.', icon: 'fa-solid fa-comments', active: true },
            { id: '303', name: 'Formation IA Générative', category: 'Formation', price: '150€/pers', description: 'Maîtriser ChatGPT et Midjourney pour votre productivité.', icon: 'fa-solid fa-chalkboard-user', active: true }
        ]); // Services IA
        this.createTableIfNotExists('content_pages', [
            {
                id: 'p_home',
                title: 'Accueil - Carrefour',
                slug: 'index.html',
                status: 'published',
                lastModified: new Date().toISOString(),
                blocks: [
                    { id: 'hero_title', label: 'Titre Principal', type: 'text', value: 'TEDSAI' },
                    { id: 'hero_subtitle', label: 'Sous-titre', type: 'text', value: 'L\'innovation au service de la tradition.' }
                ]
            },
            {
                id: 'p_resto',
                title: 'Restaurant viTEDia',
                slug: 'pages/vitedia.html',
                status: 'published',
                lastModified: new Date().toISOString(),
                blocks: [
                    { id: 'concept_text', label: 'Texte Concept', type: 'textarea', value: 'Une fusion unique entre gastronomie et technologie...' },
                    { id: 'hero_bg', label: 'Image de fond', type: 'image', value: '../assets/images/resto-hero.jpg' } // Using local path if available or URL
                ]
            },
            {
                id: 'p_ia',
                title: 'Solutions IA',
                slug: 'pages/solutions-ia.html',
                status: 'published',
                lastModified: new Date().toISOString(),
                blocks: [
                    { id: 'hero_title', label: 'Titre Principal', type: 'text', value: 'Le Cerveau du Complexe' },
                    { id: 'hero_subtitle', label: 'Sous-titre', type: 'text', value: 'Intelligence Artificielle pour PME & Optimisation Interne' },
                    { id: 'intro_title', label: 'Titre Introduction', type: 'text', value: 'Notre Double Mission' }
                ]
            },
            {
                id: 'p_garden',
                title: 'SelecTED Gardens',
                slug: 'pages/garden.html',
                status: 'published',
                lastModified: new Date().toISOString(),
                blocks: [
                    { id: 'hero_title', label: 'Titre Principal', type: 'text', value: 'La Base Agricole du Complexe' },
                    { id: 'hero_subtitle', label: 'Sous-titre', type: 'text', value: 'Production Locale • Élevage • Traçabilité Totale' },
                    { id: 'trace_title', label: 'Titre Traçabilité', type: 'text', value: 'Suivez le Parcours de Votre Ingrédient' }
                ]
            }

        ]);
        this.createTableIfNotExists('reservations', []);

        // NEW MODULES (Phase 6-10)
        this.createTableIfNotExists('media_library', []);
        this.createTableIfNotExists('translations', []);
        this.createTableIfNotExists('system_logs', []);
        this.createTableIfNotExists('settings', {
            siteName: 'TEDSAI Complex',
            maintenanceMode: false,
            emailContact: 'contact@tedsai.com'
        });

        // AXE 6: OBSERVATOIRE
        this.createTableIfNotExists('blog_posts', [
            {
                id: 'obs_1',
                title: 'IA Générative pour PME Camerounaises',
                summary: 'Une analyse complète des opportunités et du ROI pour les entrepreneurs locaux.',
                category: 'ia',
                author: 'Équipe TEDSAI',
                date: new Date().toISOString(),
                likes: 12,
                status: 'publié',
                image: '../assets/images/hero_bg.png',
                content: `
                    <p>L'intelligence artificielle générative ne se limite plus aux laboratoires de recherche de la Silicon Valley. Aujourd'hui, elle frappe à la porte des entrepreneurs camerounais, offrant des opportunités sans précédent.</p>
                    <h3>Pourquoi maintenant ?</h3>
                    <p>Avec l'accès croissant à l'internet haut débit, les barrières à l'entrée s'effondrent. Une PME locale peut désormais automatiser son service client ou générer des rapports complexes en quelques secondes.</p>
                    <blockquote>"L'IA est un levier. Ceux qui l'adoptent aujourd'hui seront les leaders de demain."</blockquote>
                `
            },
            {
                id: 'obs_2',
                title: 'Modernisation de l\'Élevage Bovin',
                summary: 'Comment les capteurs connectés révolutionnent la gestion des troupeaux dans l\'Adamaoua.',
                category: 'agro',
                author: 'Dr. Sali',
                date: new Date().toISOString(),
                likes: 8,
                status: 'publié',
                image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800',
                content: `<p>L'élevage bovin entre dans une nouvelle ère de précision grâce aux technologies IoT...</p>`
            }
        ]);
        this.createTableIfNotExists('blog_comments', []);
        this.createTableIfNotExists('blog_categories', [
            { id: 'ia', name: 'Intelligence Artificielle', color: '#0A2463' },
            { id: 'agro', name: 'Agriculture & Élevage', color: '#2D5A27' },
            { id: 'market', name: 'Marché & Économie', color: '#D35400' },
            { id: 'tech', name: 'Veille Tech', color: '#34495E' }
        ]);
    },

    createTableIfNotExists(tableName, defaultData = []) {
        const key = DB_PREFIX + tableName;
        if (!localStorage.getItem(key)) {
            console.log(`TedDB: Seeding table '${tableName}'`);
            localStorage.setItem(key, JSON.stringify(defaultData));
        }
    },

    // --- CRUD Operations ---

    findAll(table) {
        const key = DB_PREFIX + table;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    find(table, predicate) {
        const items = this.findAll(table);
        return items.find(predicate);
    },

    filter(table, predicate) {
        const items = this.findAll(table);
        return items.filter(predicate);
    },

    insert(table, item) {
        const items = this.findAll(table);
        if (!item.id) item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        item.createdAt = new Date().toISOString();
        items.push(item);
        this.save(table, items);
        return item;
    },

    update(table, id, updates) {
        const items = this.findAll(table);
        const index = items.findIndex(i => i.id == id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
        this.save(table, items);
        return items[index];
    },

    delete(table, id) {
        let items = this.findAll(table);
        const initialLength = items.length;
        items = items.filter(i => i.id != id);
        if (items.length !== initialLength) {
            this.save(table, items);
            return true;
        }
        return false;
    },

    save(table, data) {
        localStorage.setItem(DB_PREFIX + table, JSON.stringify(data));
    },

    // Reset complet (Debug)
    nuke() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(DB_PREFIX)) localStorage.removeItem(key);
        });
        this.init();
    }
};

// Auto-init
TedDB.init();

window.TedDB = TedDB;
