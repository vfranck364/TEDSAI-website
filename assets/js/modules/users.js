/**
 * MODULE UTILISATEURS
 * Gère le CRUD des utilisateurs et l'attribution des rôles
 */

const UsersAdmin = {
    init() {
        console.log("Users Admin Init");
        this.renderTable();
    },

    renderTable() {
        // Target tbody specifically
        const tbody = document.getElementById('users-table-body');
        if (!tbody) {
            console.error("TBODY 'users-table-body' not found!");
            return;
        }

        const users = TedDB.findAll('users');
        const currentUser = TedAuth.getSession();

        let html = '';

        if (users.length === 0) {
            html = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:#888;">Aucun utilisateur trouvé.</td></tr>';
        } else {
            users.forEach(user => {
                const roleBadge = this.getRoleBadge(user.role);
                // Simulation statut online : Toujours vrai pour moi, aléatoire pour les autres pour la démo
                const isMe = currentUser && currentUser.id == user.id;
                const isOnline = isMe || Math.random() > 0.7;

                const statusDot = isOnline
                    ? `<span style="display:inline-block; width:10px; height:10px; background:#22c55e; border-radius:50%; margin-right:8px;" title="En ligne"></span>`
                    : `<span style="display:inline-block; width:10px; height:10px; background:#cbd5e0; border-radius:50%; margin-right:8px;" title="Hors ligne"></span>`;

                const lastLoginDisplay = user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : (isOnline ? 'À l\'instant' : 'Il y a longtemps');

                html += `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center;">
                            ${statusDot}
                            <div>
                                <div style="font-weight:600; color:#1e293b;">${user.name} ${isMe ? '(Vous)' : ''}</div>
                                <div style="font-size:0.8rem; color:#64748b;">${user.username}</div>
                            </div>
                        </div>
                    </td>
                    <td>${roleBadge}</td>
                    <td style="color:#64748b; font-size:0.9rem;">${lastLoginDisplay}</td>
                    <td>
                        <button class="btn-icon" onclick="UsersAdmin.openModal('${user.id}')" title="Éditer"><i class="fa-solid fa-pen"></i></button>
                        ${user.role !== 'super_admin' ? `<button class="btn-icon" onclick="UsersAdmin.deleteUser('${user.id}')" title="Supprimer" style="color:#ef4444;"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </td>
                </tr>`;
            });
        }
        tbody.innerHTML = html;
    },

    getRoleBadge(role) {
        const map = {
            'super_admin': { label: 'Super Admin', class: 'badge-warning' },
            'admin_resto': { label: 'Admin Resto', class: 'badge-success' },
            'admin_garden': { label: 'Admin Jardin', class: 'badge-success' },
            'admin_ia': { label: 'Admin IA', class: 'badge-info' },
            'user': { label: 'Utilisateur', class: 'badge-gray' }
        };
        const r = map[role] || map['user'];
        return `<span class="badge ${r.class}">${r.label}</span>`;
    },

    openModal(id = null) {
        const isEdit = !!id;
        let user = {};
        if (isEdit) {
            user = TedDB.findById('users', id);
            if (!user) return;
        }

        // Available Roles
        const roles = [
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'admin_resto', label: 'Admin Restaurant' },
            { value: 'admin_garden', label: 'Admin Jardin' },
            { value: 'admin_ia', label: 'Admin IA / Services' },
            { value: 'user', label: 'Utilisateur Standard' }
        ];

        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-content fade-in-up">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h3>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="user-form">
                        <div class="form-group">
                            <label>Nom complet</label>
                            <input type="text" name="name" class="form-control" value="${user.name || ''}" required>
                        </div>
                         <div class="form-group">
                            <label>Identifiant (Username)</label>
                            <input type="text" name="username" class="form-control" value="${user.username || ''}" required ${isEdit ? 'readonly style="background:#f1f5f9;"' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Rôle</label>
                            <select name="role" class="form-control">
                                ${roles.map(r => `<option value="${r.value}" ${user.role === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
                            </select>
                        </div>
                         <div class="form-group">
                            <label>Mot de passe ${isEdit ? '(Laisser vide pour ne pas changer)' : ''}</label>
                            <input type="password" name="password" class="form-control" ${!isEdit ? 'required' : ''}>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                            <button type="submit" class="btn btn-primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                role: formData.get('role'),
                username: formData.get('username')
            };

            const password = formData.get('password');
            if (password) data.password = password; // In real app, hash this!

            if (isEdit) {
                TedDB.update('users', id, data);
            } else {
                // Check if username exists
                const exists = TedDB.find('users', u => u.username === data.username);
                if (exists) {
                    alert('Cet identifiant est déjà utilisé.');
                    return;
                }
                TedDB.insert('users', data);
            }

            document.querySelector('.modal-overlay').remove();
            this.renderTable();
            // Refresh stats if DashboardHome is active ? 
            if (window.DashboardHome) window.DashboardHome.renderKPIs();
        });
    },

    deleteUser(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            const user = TedDB.findById('users', id);
            if (user.role === 'super_admin') {
                alert("Impossible de supprimer un Super Admin.");
                return;
            }
            TedDB.delete('users', id);
            this.renderTable();
            if (window.DashboardHome) window.DashboardHome.renderKPIs();
        }
    }
};

window.UsersAdmin = UsersAdmin;
