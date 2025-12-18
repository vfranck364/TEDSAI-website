/**
 * TEDSAI PUBLIC API
 * Interface unique pour le Frontend
 */

const TedAPI = {
    // --- RESTAURANT MODULE ---
    Restaurant: {
        getMenu: () => TedDB.filter('menu', item => item.available !== false), // Use 'available' from DB schema
        getCategories: () => ['Entrées', 'Plats', 'Desserts', 'Boissons'],

        // Check if a time slot is available (Simulated logic: random limited slots)
        checkAvailability: (date, time) => {
            const existing = TedDB.filter('reservations', r => r.date === date && r.time === time);
            // Limit to 5 tables per slot for MVO
            return existing.length < 5;
        },

        // Make a reservation
        makeReservation: (details) => {
            // Validation
            if (!details.name || !details.date || !details.time || !details.phone) {
                return { success: false, message: "Données incomplètes." };
            }

            // Check availability again
            if (!TedAPI.Restaurant.checkAvailability(details.date, details.time)) {
                return { success: false, message: "Désolé, ce créneau est complet." };
            }

            // Save
            const newRes = TedDB.insert('reservations', {
                ...details,
                status: 'confirmed',
                paymentStatus: details.paymentMethod === 'momo' ? 'paid_simulated' : 'pending'
            });

            return { success: true, reservation: newRes, message: "Réservation confirmée !" };
        }
    },

    // --- GARDEN MODULE ---
    Garden: {
        getProducts: () => TedDB.findAll('garden_products'), // Return all, let frontend handle InStock/OutOfStock display
        traceProduct: (code) => {
            // Simulation logique traçabilité
            return {
                product: "Tomate",
                origin: "Serre B",
                harvestDate: "2024-12-16",
                farmer: "Jean Michel"
            };
        }
    },

    // --- IA MODULE ---
    IA: {
        getServices: () => TedDB.filter('ia_services', s => s.active !== false)
    },

    // --- CONTENT MODULE ---
    Content: {
        getPage: (slug) => TedDB.find('content_pages', p => p.slug === slug)
    },

    // --- BLOG / OBSERVATOIRE MODULE ---
    Blog: {
        getPosts: () => TedDB.filter('blog_posts', p => p.status === 'publié'),
        getPost: (id) => TedDB.find('blog_posts', p => p.id === id),
        getCategories: () => TedDB.findAll('blog_categories'),
        getComments: (postId) => TedDB.filter('blog_comments', c => c.postId === postId),

        likePost: (id) => {
            const post = TedDB.find('blog_posts', p => p.id === id);
            if (post) {
                TedDB.update('blog_posts', id, { likes: (post.likes || 0) + 1 });
                return true;
            }
            return false;
        },

        addComment: (postId, commentData) => {
            return TedDB.insert('blog_comments', {
                postId,
                author: commentData.author || 'Visiteur',
                text: commentData.text,
                date: new Date().toISOString()
            });
        },

        submitGuestPost: (postData) => {
            return TedDB.insert('blog_posts', {
                ...postData,
                status: 'en_attente',
                likes: 0,
                date: new Date().toISOString()
            });
        }
    }
};

window.TedAPI = TedAPI;
