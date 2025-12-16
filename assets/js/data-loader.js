/**
 * TEDSAI Data Loader
 * Simulates API calls to fetch data from JSON files.
 * Handles "Mock Backend" logic including LocalStorage overrides.
 */

const DATA_PATH = {
    menu: '../assets/data/menu.json',
    garden: '../assets/data/garden.json',
    services: '../assets/data/services.json',
    users: '../assets/data/users.json',
    articles: '../assets/data/articles.json',
    epicerie: '../assets/data/epicerie.json',
    elevage: '../assets/data/elevage.json',
    'case-studies': '../assets/data/case-studies.json',
    resources: '../assets/data/resources.json'
};

class TedDataService {
    async fetchData(type) {
        // 1. Check if data exists in LocalStorage (Simulation of DB persistence after Admin edits)
        const localData = localStorage.getItem(`tedsai_${type}`);
        if (localData) {
            console.log(`[TEDSAI API] Loading ${type} from LocalStorage (Mock DB)`);
            return JSON.parse(localData);
        }

        // 2. If not, fetch from JSON file (Simulation of clean DB)
        try {
            // Adjust path based on current location
            // If we are in a subdirectory (pages/ or admin/), keep the relative path '../'
            // If we are in root (index.html), remove '../'
            const isSubDir = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/');
            const path = isSubDir
                ? DATA_PATH[type]
                : DATA_PATH[type].replace('../', '');

            console.log(`[TEDSAI API] Fetching ${type} from ${path}`);
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Save to local storage for future simulated "edits"
            this.saveData(type, data); // Cache it
            return data;
        } catch (error) {
            console.warn(`[TEDSAI API] Fetch failed (likely CORS or Path). Using Fallback Data for ${type}.`, error);

            // FALLBACK SYSTEM (For local file:// usage)
            const fallbackData = this.getFallbackData(type);
            if (fallbackData) {
                this.saveData(type, fallbackData);
                return fallbackData;
            }
            return null;
        }
    }

    getFallbackData(type) {
        if (type === 'users') {
            return {
                "users": [
                    { "id": 1, "username": "admin", "password": "password123", "role": "super_admin", "name": "Franck Admin" },
                    { "id": 2, "username": "manager_ia", "password": "ia123", "role": "manager_ia", "name": "Responsable IA" },
                    { "id": 3, "username": "manager_rest", "password": "rest123", "role": "manager_vitedia", "name": "Chef Cusine" },
                    { "id": 4, "username": "manager_garden", "password": "garden123", "role": "manager_garden", "name": "Chef Jardinier" }
                ]
            };
        }
        if (type === 'menu') {
            return {
                "starters": [
                    { "id": "s1", "name": "Velouté de Potimarron", "description": "Crème de coco, graines torréfiées", "price": 12, "traceable": true, "available": true }
                ],
                "mains": [
                    { "id": "m1", "name": "Risotto aux Cèpes", "description": "Parmesan affiné", "price": 24, "traceable": true, "available": true }
                ],
                "desserts": [
                    { "id": "d1", "name": "Tarte Tatin", "description": "Glace vanille", "price": 9, "traceable": true, "available": true }
                ]
            };
        }
        return null; // Add other fallbacks if needed
    }

    // Function to simulate Admin saving data
    saveData(type, data) {
        console.log(`[TEDSAI ADMIN] Saving ${type} to LocalStorage`);
        localStorage.setItem(`tedsai_${type}`, JSON.stringify(data));
        // In a real app, this would be a POST request to an API
    }

    // Auth Simulation
    async login(username, password) {
        const usersData = await this.fetchData('users');
        if (!usersData) return { success: false, message: "System Error" };

        const user = usersData.users.find(u => u.username === username && u.password === password);
        if (user) {
            // Create "Session"
            const session = {
                id: user.id,
                name: user.name,
                role: user.role,
                token: 'mock_jwt_token_' + Math.random().toString(36).substr(2)
            };
            localStorage.setItem('tedsai_session', JSON.stringify(session));
            return { success: true, user: session };
        } else {
            return { success: false, message: "Invalid credentials" };
        }
    }

    logout() {
        localStorage.removeItem('tedsai_session');
        window.location.reload();
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('tedsai_session'));
    }
}

const tedApi = new TedDataService();
