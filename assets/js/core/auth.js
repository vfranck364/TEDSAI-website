/**
 * TEDSAI AUTHENTICATION & SECURITY
 * Gestion des sessions et RBAC
 */

const TedAuth = {
    // Current User Session
    getSession() {
        const userStr = sessionStorage.getItem('tedsai_session');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Login
    login(username, password) {
        const user = TedDB.find('users', u => u.username === username);
        
        if (user && user.passwordHash === password) { // En prod: bcrypt verify
            const session = {
                id: user.id,
                name: user.name,
                role: user.role,
                loginTime: Date.now()
            };
            sessionStorage.setItem('tedsai_session', JSON.stringify(session));
            return { success: true, user: session };
        }
        return { success: false, message: "Identifiants invalides" };
    },

    logout() {
        sessionStorage.removeItem('tedsai_session');
        window.location.href = '../admin/login.html';
    },

    // RBAC Check
    // Renvoie true si l'utilisateur a le droit d'accéder au module
    canAccess(moduleIndex) {
        const session = this.getSession();
        if (!session) return false;

        const role = session.role;
        
        if (role === 'super_admin') return true; // God mode

        const permissions = {
            'admin_resto': ['restaurant', 'menu', 'reservations'],
            'admin_garden': ['garden', 'products', 'inventory'],
            'admin_ia': ['ia', 'services', 'leads']
        };

        const allowed = permissions[role] || [];
        return allowed.includes(moduleIndex);
    },

    // Middleware pour protéger les pages Admin
    requireAuth() {
        const session = this.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return false;
        }
        return session;
    }
};

window.TedAuth = TedAuth;
