document.addEventListener('DOMContentLoaded', function () {
    // Initialize global functions
    initTraceability();
    loadDynamicContent(); // New Dynamic Loader

    // Initialize Lightbox logic
    initLightbox();
});

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
    if (gardenContainer && typeof tedApi !== 'undefined') {
        const gardenData = await tedApi.fetchData('garden');
        if (gardenData) {
            renderGarden(gardenContainer, gardenData);
        }
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
    document.getElementById('wizard-result').style.display = 'none';
    document.getElementById('wizard-steps').style.display = 'block';
    renderWizardStep();
}

// --- LEAD MAGNET LOGIC ---
function downloadResource(type) {
    const email = prompt("Veuillez entrer votre email pour recevoir le document :");
    if (email && email.includes('@')) {
        // Save lead
        if (typeof tedApi !== 'undefined') {
            const messages = JSON.parse(localStorage.getItem('tedsai_messages') || '[]');
            messages.unshift({
                id: 'lead_' + Date.now(),
                name: 'Lead Download',
                email: email,
                interest: 'ia',
                message: `Downloaded ${type}`,
                date: new Date().toISOString()
            });
            tedApi.saveData('messages', messages);
        }

        alert(`Merci ! Le lien de téléchargement pour le ${type === 'whitepaper' ? 'Livre Blanc' : 'Calculateur'} a été envoyé à ${email}.`);
    } else if (email) {
        alert("Email invalide.");
    }
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

// Helper to Render Menu Categories
function renderMenuCategory(containerId, title, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<div class="menu-category"><h3>${title}</h3>`;

    if (!items || items.length === 0) {
        html += '<p style="font-style:italic; color:#777;">Aucun plat disponible pour le moment.</p>';
        html += '</div>';
        container.innerHTML = html;
        return;
    }

    html += '<div class="menu-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">';

    items.forEach(item => {
        const isAvailable = item.available !== false; // Default true
        const badgeClass = item.traceable ? 'badge-trace' : '';
        const availabilityStyle = isAvailable ? '' : 'opacity: 0.6; filter: grayscale(1);';
        const availabilityText = isAvailable ? '' : '<span style="color:red; font-weight:bold; font-size:0.8rem;">(ÉPUISÉ)</span>';

        // Tags Logic
        let tagsHtml = '';
        if (item.tags) {
            if (item.tags.includes('vegan')) tagsHtml += '<span style="background:#27ae60; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-right:5px;">VEGAN</span>';
            if (item.tags.includes('spicy')) tagsHtml += '<span style="background:#e74c3c; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem;">PIMENTÉ</span>';
        }

        // Image Logic
        const imageHtml = item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;">` : '';

        html += `
        <div class="menu-item card ${badgeClass}" style="${availabilityStyle} display:flex; flex-direction:column; padding:1.5rem;">
            ${imageHtml}
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
                <h3 style="margin:0; font-size:1.1rem; color:var(--color-primary);">${item.name} ${availabilityText}</h3>
                <span class="price" style="font-weight:bold; color:var(--color-secondary);">${item.price}€</span>
            </div>
            <div style="margin-bottom:0.5rem;">${tagsHtml}</div>
            <p style="font-size:0.9rem; color:#666; margin-bottom:1rem; flex-grow:1;">${item.description}</p>
            ${item.traceable ? '<div style="font-size:0.8rem; color: #27ae60;"><i class="fa-solid fa-leaf"></i> 100% Tracable (Jardin Interne)</div>' : ''}
        </div>
        `;
    });

    html += '</div>';
    html += '</div>'; // Close menu-category
    container.insertAdjacentHTML('beforeend', html);
}

function renderMenu(container, data) {
    container.innerHTML = ''; // Clear loading message

    // Render Sections
    renderMenuCategory('dynamic-menu-container', 'Entrées', data.starters);
    renderMenuCategory('dynamic-menu-container', 'Plats de Résistance', data.mains);
    renderMenuCategory('dynamic-menu-container', 'Desserts', data.desserts);
}

function renderGarden(container, data) {
    let html = '<div class="prod-grid">';
    data.categories.forEach(cat => {
        // Special style for Spices/Coming Soon
        const style = cat.style ? `style="border: ${cat.style.border}; color: ${cat.style.color};"` : '';
        const iconStyle = cat.style ? `style="color: ${cat.style.color};"` : '';
        const h3Style = cat.style ? `style="color: ${cat.style.color};"` : '';

        html += `
            <div class="prod-card" ${style}>
                <i class="fa-solid ${cat.icon} prod-icon" ${iconStyle}></i>
                <h3 ${h3Style}>${cat.name}</h3>
                <p>${cat.description}</p>
                ${cat.items.length > 0 ? `<div style="margin-top:0.5rem;font-size:0.8rem;color:#777;">${cat.items.join(', ')}</div>` : ''}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Traceability Modal Logic
function initTraceability() {
    // Listen for clicks on trace badges
    const badges = document.querySelectorAll('.badge-trace, .btn-trace-sim');
    if (badges.length === 0) return;

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

    badges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.preventDefault();
            // Simulate data fetching
            openTraceModal(e.target.innerText.includes('Potimarron') ? 'potimarron' : 'general');
        });
    });
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
