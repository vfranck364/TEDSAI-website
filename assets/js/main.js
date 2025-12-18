document.addEventListener('DOMContentLoaded', function () {
    // Initialize global functions
    initTraceability();
    loadDynamicContent(); // New Dynamic Loader
    initMobileNav(); // Mobile Navigation Logic

    // Initialize Lightbox logic
    initLightbox();
});

function initMobileNav() {
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.mobile-nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        // Simple distinct logic to handle '../' or exact matches
        // Note: In production, URL parsing might be more robust
        if (currentPage.endsWith(href) || (currentPage.endsWith('/') && href.includes('index.html'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * PHASE 2: Dynamic Content Rendering
 * Fetches data from "Mock Backend" and renders it.
 */

// --- 4. RESERVATION HANDLER ---
window.handleReservationVitedia = function (e) {
    e.preventDefault();
    const name = document.getElementById('res-name').value;
    const phone = document.getElementById('res-phone').value;
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const people = document.getElementById('res-people').value;
    const payment = document.getElementById('res-payment').value;

    if (!name || !date || !time || !phone) {
        alert("Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Date, Heure).");
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Vérification...";

    // SIMULATION MOBILE MONEY
    if (payment === 'momo') {
        const confirmMomo = confirm(`Simulation Mobile Money:\n\nVeuillez valider le paiement de 5000 FCFA sur votre téléphone (${phone}).\n\nAppuyez sur OK pour simuler la validation.`);
        if (!confirmMomo) {
            btn.disabled = false;
            btn.innerText = originalText;
            return;
        }
    }

    // Call API
    setTimeout(() => {
        const result = TedAPI.Restaurant.makeReservation({
            name, phone, date, time, people, paymentMethod: payment
        });

        if (result.success) {
            alert(`✅ Succès !\n\n${result.message}\n\nAcompte: ${payment === 'momo' ? 'Payé (Simulé)' : 'À régler sur place'}`);
            e.target.reset();
        } else {
            alert(`❌ Erreur: ${result.message}`);
        }

        btn.disabled = false;
        btn.innerText = originalText;
    }, 1000);
};

/**
 * PHASE 2: Dynamic Content Rendering
 * Fetches data from "Mock Backend" and renders it.
 */
async function loadDynamicContent() {
    // 1. Render viTEDia Munu
    const menuContainer = document.getElementById('dynamic-menu-container');
    if (menuContainer && typeof tedApi !== 'undefined') {
        const menuData = await tedApi.fetchData('menu');
        if (menuData) {
            renderMenu(menuContainer, menuData);
        } else {
            menuContainer.innerHTML = '<p class="error">Erreur de chargement du menu.</p>';
        }
    }

    // 2. Render Garden Production
    const gardenContainer = document.getElementById('dynamic-garden-container');
    if (gardenContainer && typeof TedAPI !== 'undefined') {
        const gardenData = TedAPI.Garden.getProducts();
        renderGarden(gardenContainer, gardenData);
    }
    // 3. Render IA Services
    const iaContainer = document.getElementById('dynamic-services-container');
    if (iaContainer && typeof tedApi !== 'undefined') {
        const iaData = await tedApi.fetchData('services');
        if (iaData) {
            renderServices(iaContainer, iaData);
        }
    }

    // 4. Initialize Quote Wizard (if on IA page)
    if (document.getElementById('quote-wizard-container')) {
        initQuoteWizard();
    }
}

// --- QUOTE WIZARD LOGIC ---
let quizData = null;
let currentStep = 0;
let totalEstimate = 0;

async function initQuoteWizard() {
    // Determine path based on location
    const path = window.location.pathname.includes('/pages/') ? '../assets/data/quiz.json' : 'assets/data/quiz.json';

    try {
        const response = await fetch(path);
        const data = await response.json();
        quizData = data.questions;
        renderWizardStep();
    } catch (e) {
        console.error("Quiz Error", e);
        document.getElementById('wizard-steps').innerHTML = '<p class="error">Erreur chargement devis.</p>';
    }
}

function renderWizardStep() {
    const container = document.getElementById('wizard-steps');
    if (currentStep >= quizData.length) {
        showWizardResult();
        return;
    }

    const q = quizData[currentStep];
    let html = `
        <h4 style="margin-bottom:1.5rem; color:var(--color-primary);">Étape ${currentStep + 1}/${quizData.length}: ${q.text}</h4>
        <div style="display:grid; gap:10px;">
    `;

    q.options.forEach(opt => {
        html += `<button class="btn-text" style="text-align:left; border:1px solid #eee;" onclick="selectOption(${opt.price_mod})">${opt.label}</button>`;
    });
    html += '</div>';

    container.innerHTML = html;
}

function selectOption(price) {
    totalEstimate += price;
    currentStep++;
    renderWizardStep();
}

function showWizardResult() {
    document.getElementById('wizard-steps').style.display = 'none';
    document.getElementById('wizard-result').style.display = 'block';

    // Animate Number
    const el = document.getElementById('estimated-price');
    let start = 0;
    const end = totalEstimate;
    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / (end - start)));

    const timer = setInterval(() => {
        start += 50;
        el.textContent = start + "€";
        if (start >= end) {
            el.textContent = end + "€ / mois"; // Monthly estimate
            clearInterval(timer);
        }
    }, 10);
}

function restartWizard() {
    currentStep = 0;
    totalEstimate = 0;
    const resultEl = document.getElementById('wizard-result');
    if (resultEl) resultEl.style.display = 'none';
    const stepsEl = document.getElementById('wizard-steps');
    if (stepsEl) stepsEl.style.display = 'block';
    renderWizardStep();
}

function renderServices(container, data) {
    if (!data.external || !data.external.services) return;
    let html = '<div class="services-grid">';
    data.external.services.forEach(service => {
        html += `
            <div class="service-card">
                <i class="fa-solid ${service.icon} service-icon"></i>
                <h3>${service.name}</h3>
                <p>${service.summary}</p>
                <a href="#demo" class="btn-text">Voir détails <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// --- 3. DYNAMIC CONTENT LOADING (FRONTEND CONNECTION) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Modules
    if (document.getElementById('dynamic-menu-container')) loadVitediaMenu();
    if (document.getElementById('dynamic-garden-container')) loadGardenProducts();

    // 2. CMS Content Loading
    loadPageContent();
});

function loadPageContent() {
    const slugMeta = document.querySelector('meta[name="ted-page-slug"]');
    if (!slugMeta) return;

    const slug = slugMeta.content;
    if (!window.TedAPI || !window.TedAPI.Content) return;

    const pageData = window.TedAPI.Content.getPage(slug);
    if (!pageData || !pageData.blocks) return;

    pageData.blocks.forEach(block => {
        const el = document.querySelector(`[data-cms-id="${block.id}"]`);
        if (el) {
            if (block.type === 'image') {
                if (el.tagName === 'IMG') {
                    el.src = block.value;
                } else {
                    // Assume background image for other tags (div, section)
                    el.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${block.value}')`;
                }
            } else {
                el.innerText = block.value;
            }
        }
    });
}

function loadGardenProducts() {
    const container = document.getElementById('dynamic-garden-container');
    if (!container) return;

    if (!window.TedAPI || !window.TedAPI.Garden) {
        container.innerHTML = '<p class="error-msg">Impossible de charger les récoltes.</p>';
        return;
    }

    const products = window.TedAPI.Garden.getProducts();

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #777;">Aucune récolte disponible pour le moment.</p>';
        return;
    }

    let html = '<div class="prod-grid">';

    products.forEach(item => {
        // Handle availability/stock
        const isStock = item.inStock !== false; // Default true if undefined
        const stockBadge = isStock
            ? '<span style="background:var(--color-garden-primary); color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">En Stock</span>'
            : '<span style="background:#e53e3e; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">Rupture</span>';

        const imgHtml = item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:1rem;">`
            : `<div style="height:180px; background:#f0fdf4; display:flex; align-items:center; justify-content:center; border-radius:8px; margin-bottom:1rem; color:var(--color-garden-primary);"><i class="fa-solid fa-leaf fa-3x"></i></div>`;

        html += `
        <div class="prod-card" style="text-align:left;">
             ${imgHtml}
             <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
                <h3 style="margin:0; font-size:1.2rem; color:var(--color-garden-primary);">${item.name}</h3>
                ${stockBadge}
             </div>
             <p style="color:#666; font-size:0.9rem; margin-bottom:0.5rem;">${item.category} • ${item.season || 'Saison ?'}</p>
             <p style="font-style:italic; font-size:0.85rem; color:#888;">${item.variety || ''}</p>
        </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function loadVitediaMenu() {
    const container = document.getElementById('dynamic-menu-container');
    if (!container) return; // Should not happen given check above but safe

    // 1. Get Data from API
    if (!window.TedAPI || !window.TedAPI.Restaurant) {
        container.innerHTML = '<p class="error-msg">Impossible de charger le menu (API manquante).</p>';
        return;
    }

    const menu = window.TedAPI.Restaurant.getMenu();
    if (menu.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:2rem;">
                <i class="fa-solid fa-utensils" style="font-size:2rem; color:#cbd5e0; margin-bottom:1rem;"></i>
                <p>Notre carte est en cours de mise à jour. Revenez vite !</p>
            </div>`;
        return;
    }

    // 2. Group by Category
    const categories = { 'Entrée': [], 'Plat': [], 'Dessert': [], 'Boisson': [] };
    menu.forEach(item => {
        // Fuzzy match or exact match
        let cat = item.category || 'Plat';
        if (categories[cat]) {
            categories[cat].push(item);
        } else {
            // Fallback
            categories['Plat'].push(item);
        }
    });

    // 3. Keep specific order
    const order = ['Entrée', 'Plat', 'Dessert', 'Boisson'];
    let html = '';

    order.forEach(catName => {
        const items = categories[catName];
        if (items.length > 0) {
            html += `
            <div class="menu-category-block" style="margin-bottom:4rem; text-align: center;">
                <h3 style="font-family: var(--font-accent); color: var(--color-vitedia-primary); font-size: 2.2rem; margin-bottom: 2rem; display: inline-block; position: relative; padding-bottom: 10px;">
                    ${catName}s
                    <span style="position: absolute; bottom: 0; left: 25%; width: 50%; height: 3px; background: var(--color-vitedia-accent); border-radius: 2px;"></span>
                </h3>
                <div class="menu-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 350px)); justify-content: center; gap: 2.5rem;">
            `;

            items.forEach(item => {
                const imageSrc = item.image && item.image.length > 10 ? item.image : '../assets/images/placeholder_dish.jpg';
                const availableBadge = item.available ? '' : '<span style="position:absolute; top:10px; right:10px; background:red; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:0.8rem;">ÉPUISÉ</span>';
                const opacityStyle = item.available ? '' : 'opacity:0.7; grayscale:1;';

                html += `
                    <div class="dish-card" style="background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; transition: transform 0.3s ease; position:relative; ${opacityStyle}">
                        ${availableBadge}
                        <div style="height: 200px; overflow: hidden;">
                            <img src="${imageSrc}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
                        </div>
                        <div style="padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                <h4 style="margin: 0; font-size: 1.25rem; font-weight: 700;">${item.name}</h4>
                                <span style="background: var(--color-vitedia-primary); color: white; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.9rem;">
                                    ${item.price} FCFA
                                </span>
                            </div>
                            <p style="color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">
                                ${item.description || 'Une création savoureuse de nos chefs.'}
                            </p>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        }
    });

    container.innerHTML = html;
}

// Helper to Render Menu Categories (Legacy/Fallback)
// Helper to Render Menu Categories
function renderMenuCategory(containerId, title, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
        <div class="menu-category-block" style="margin-bottom:4rem; text-align: center;">
            <h3 style="font-family: var(--font-accent); color: var(--color-vitedia-primary); font-size: 2.2rem; margin-bottom: 2rem; display: inline-block; position: relative; padding-bottom: 10px;">
                ${title}
                <span style="position: absolute; bottom: 0; left: 25%; width: 50%; height: 3px; background: var(--color-vitedia-accent); border-radius: 2px;"></span>
            </h3>
            <div class="menu-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 350px)); justify-content: center; gap: 2.5rem;">
    `;

    if (!items || items.length === 0) {
        html += `<p style="color:#777; font-style:italic;">Aucun élément disponible pour le moment.</p>`;
    } else {
        items.forEach(item => {
            const isAvailable = item.available !== false;
            const badgeClass = item.traceable ? 'badge-trace' : '';
            const opacityStyle = isAvailable ? '' : 'opacity:0.7; grayscale:1;';
            const availabilityText = isAvailable ? '' : '<span style="color:red; font-weight:bold; font-size:0.8rem;">(ÉPUISÉ)</span>';

            // Image Logic
            const imageHtml = item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;">` : '';

            // Tags Logic
            let tagsHtml = '';
            if (item.tags) {
                if (item.tags.includes('vegan')) tagsHtml += '<span style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-right:5px;">VEGAN</span>';
                if (item.tags.includes('spicy')) tagsHtml += '<span style="background:#e74c3c; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem;">PIMENTÉ</span>';
            }

            html += `
            <div class="menu-item card ${badgeClass}" style="${opacityStyle} display:flex; flex-direction:column; padding:1.5rem; background:white; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                ${imageHtml}
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
                    <h4 style="margin:0; font-size:1.1rem; color:var(--color-primary);">${item.name} ${availabilityText}</h4>
                    <span class="price" style="font-weight:bold; color:var(--color-secondary);">${item.price} FCFA</span>
                </div>
                <div style="margin-bottom:0.5rem;">${tagsHtml}</div>
                <p style="font-size:0.9rem; color:#666; margin-bottom:1rem; flex-grow:1;">${item.description || ''}</p>
                ${item.traceable ? '<div style="font-size:0.8rem; color: #27ae60;"><i class="fa-solid fa-leaf"></i> 100% Traçable</div>' : ''}
            </div>
            `;
        });
    }

    html += '</div></div>'; // Close grid and block
    container.insertAdjacentHTML('beforeend', html);
}

function renderMenu(container, data) {
    container.innerHTML = ''; // Clear loading message

    // Render Sections
    renderMenuCategory('dynamic-menu-container', 'Entrées', data.starters);
    renderMenuCategory('dynamic-menu-container', 'Plats de Résistance', data.mains);
    renderMenuCategory('dynamic-menu-container', 'Desserts', data.desserts);
}

function renderGarden(container, products) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#718096;">
                <i class="fa-solid fa-seedling fa-2x" style="margin-bottom:1rem; opacity:0.5;"></i>
                <p>Nos récoltes chargent... ou le jardin est au repos !</p>
            </div>`;
        return;
    }

    // 1. Group by Category
    const categories = { 'Légume': [], 'Fruit': [], 'Aromate': [], 'Épice': [] };
    products.forEach(p => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
    });

    let html = '<div class="prod-grid">';

    // 2. Render Categories as Cards (Style similar to original but dynamic)
    Object.keys(categories).forEach(catName => {
        const items = categories[catName];
        if (items.length === 0) return;

        // Visual config per category
        let icon = 'fa-leaf';
        let color = 'var(--color-garden-primary)';
        if (catName === 'Fruit') icon = 'fa-apple-whole';
        if (catName === 'Épice') { icon = 'fa-pepper-hot'; color = '#B68D40'; }
        if (catName === 'Aromate') icon = 'fa-wind';

        // Build list of items txt
        const itemList = items.map(i => {
            const style = i.inStock ? '' : 'text-decoration:line-through; opacity:0.6;';
            return `<span style="${style}">${i.name}</span>`;
        }).join(', ');

        html += `
            <div class="prod-card" style="border-top: 4px solid ${color};">
                <i class="fa-solid ${icon} prod-icon" style="color: ${color};"></i>
                <h3 style="color: ${color};">${catName}s du Moment</h3>
                <div style="margin-top:1rem; font-size:0.95rem; line-height:1.6; color:#555;">
                    ${itemList}
                </div>
                <div style="margin-top:1rem;">
                    <button class="btn-text" style="color:${color}; font-size:0.8rem;" onclick="document.getElementById('trace-input-code').focus()">
                        <i class="fa-solid fa-qrcode"></i> Vérifier Traçabilité
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Traceability Modal Logic
function initTraceability() {
    // 1. Listen for clicks on trace badges
    const badges = document.querySelectorAll('.badge-trace, .btn-trace-sim');
    if (badges) {
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.preventDefault();
                openTraceModal(e.target.innerText.includes('Potimarron') ? 'potimarron' : 'general');
            });
        });
    }

    // 2. Listen for Manual Input (Garden Page)
    const traceBtn = document.getElementById('btn-trace-submit');
    const traceInput = document.getElementById('trace-input-code');

    if (traceBtn && traceInput) {
        traceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const code = traceInput.value.trim();
            if (!code) {
                alert("Veuillez entrer un code produit.");
                return;
            }
            // Smart Logic: Check code pattern
            if (code.includes("POT")) openTraceModal('potimarron');
            else openTraceModal('general');
        });
    }

    // Create Modal HTML if not exists
    if (!document.getElementById('trace-modal')) {
        const modalHTML = `
        <div id="trace-modal" class="modal-overlay">
            <div class="modal-content fade-in-up">
                <span class="close-modal">&times;</span>
                <div id="trace-modal-body">
                    <!-- Dynamic Content -->
                </div>
            </div>
        </div>
        <style>
            .modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); z-index: 10000;
                display: none; align-items: center; justify-content: center;
                backdrop-filter: blur(5px);
            }
            .modal-content {
                background: white; padding: 2rem; border-radius: 12px;
                max-width: 600px; width: 90%; position: relative;
                max-height: 90vh; overflow-y: auto;
            }
            .close-modal {
                position: absolute; top: 15px; right: 20px; font-size: 2rem; cursor: pointer; color: #aaa;
            }
            .close-modal:hover { color: black; }
        </style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Close logic
        document.querySelector('.close-modal').addEventListener('click', closeTraceModal);
        document.getElementById('trace-modal').addEventListener('click', (e) => {
            if (e.target.id === 'trace-modal') closeTraceModal();
        });
    }
}

function openTraceModal(type) {
    const modal = document.getElementById('trace-modal');
    const body = document.getElementById('trace-modal-body');

    // Mock Data based on Spec
    const data = {
        potimarron: {
            title: "Velouté de Potimarron du Jardin",
            code: "POT-131224-B3",
            origin: "Parcelle B3 (Serre #2)",
            harvest: "10 Décembre 2024",
            farmer: "Jean K.",
            distance: "50 mètres",
            inputs: "Zero Pesticide (Contrôle biologique)",
            chef: "Marie L."
        },
        general: {
            title: "Produit du Jardin SelecTED",
            code: "GEN-131224-X",
            origin: "Parcelle A1 (Plein Champ)",
            harvest: "Aujourd'hui",
            farmer: "Equipe SelecTED",
            distance: "50 mètres",
            inputs: "Bio Certifié",
            chef: "Chef viTEDia"
        }
    };

    const item = data[type] || data.general;

    body.innerHTML = `
        <h2 style="color: var(--color-garden-primary); margin-bottom: 0.5rem;"><i class="fa-solid fa-leaf"></i> Traçabilité Certifiée</h2>
        <h3 style="margin-bottom: 1.5rem;">${item.title}</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Code Produit</td><td style="font-weight: bold;">${item.code}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Origine</td><td style="font-weight: bold;">${item.origin}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Date Récolte</td><td style="font-weight: bold;">${item.harvest}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Distance Resto</td><td style="font-weight: bold; color: green;">${item.distance}</td></tr>
             <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Intrants</td><td style="font-weight: bold;">${item.inputs}</td></tr>
        </table>
        
        <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; text-align: center;">
             <p style="font-size: 0.9rem; color: #555;">Ce produit a été préparé par <strong>${item.chef}</strong>.</p>
             <button class="btn btn-primary" style="margin-top: 10px; font-size: 0.8rem;">Télécharger Certificat PDF</button>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeTraceModal() {
    document.getElementById('trace-modal').style.display = 'none';
}


function initLightbox() {
    // Simplified MVP Lightbox placeholder
}


