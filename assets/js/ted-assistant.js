document.addEventListener('DOMContentLoaded', function () {
    initTedAssistant();
});

function initTedAssistant() {
    const container = document.getElementById('ted-widget-container');
    if (!container) return;

    // Determine base path for assets
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : './';
    const logoPath = basePath + 'assets/images/logos/Logo TEDSAI.jpeg';

    // Inject HTML
    container.innerHTML = `
        <div class="ted-chat-window" id="ted-chat-window">
            <div class="chat-header">
                <h3><i class="fa-solid fa-robot"></i> Assistant TED</h3>
                <button class="chat-close" onclick="toggleChat()">×</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <!-- Messages will appear here -->
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Posez une question..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
        <div class="ted-button" onclick="toggleChat()">
            <i class="fa-solid fa-comment-dots" style="color: white; font-size: 24px;"></i>
        </div>
    `;

    // Initialize with welcome message based on context
    setTimeout(() => {
        const welcomeMsg = getWelcomeMessage();
        addMessage('bot', welcomeMsg.text, welcomeMsg.options);
    }, 1000);
}

function toggleChat() {
    const chatWindow = document.getElementById('ted-chat-window');
    chatWindow.classList.toggle('open');

    // Pulse animation stop when opened
    const btn = document.querySelector('.ted-button');
    if (chatWindow.classList.contains('open')) {
        btn.style.animation = 'none';
        btn.querySelector('i').classList.remove('fa-comment-dots');
        btn.querySelector('i').classList.add('fa-times');
    } else {
        btn.style.animation = 'tedPulse 3s infinite';
        btn.querySelector('i').classList.add('fa-comment-dots');
        btn.querySelector('i').classList.remove('fa-times');
    }
}

function getWelcomeMessage() {
    const path = window.location.pathname;

    if (path.includes('vitedia')) {
        return {
            text: "Bienvenue chez viTEDia ! 😊 Je suis TED, votre assistant. Je peux vous aider à réserver une table ou découvrir notre menu traçable.",
            options: ["Réserver une table", "Voir le menu", "Traçabilité"]
        };
    } else if (path.includes('solutions-ia')) {
        return {
            text: "Bonjour ! Intéressé par l'IA pour votre entreprise ? Je peux vous orienter vers la bonne solution.",
            options: ["Facturation", "Gestion de Stocks", "Service Client", "Parler à un expert"]
        };
    } else if (path.includes('garden')) {
        return {
            text: "Bonjour ! Curieux de savoir d'où vient votre nourriture ? 🌱 Je peux vous montrer le parcours complet de nos produits.",
            options: ["Scanner QR Code", "Visite Virtuelle", "Nos techniques"]
        };
    } else {
        // Home or others
        return {
            text: "Bonjour ! Je suis TED, le système nerveux de TEDSAI. Je peux vous guider à travers notre écosystème.",
            options: ["Solutions IA Entreprises", "Restaurant viTEDia", "Jardin Urbain", "Découvrir la vision"]
        };
    }
}

function addMessage(sender, text, options = []) {
    const messagesDiv = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);

    if (options && options.length > 0) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chat-options';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn';
            btn.textContent = opt;
            btn.onclick = () => handleOptionClick(opt);
            optionsDiv.appendChild(btn);
        });
        messagesDiv.appendChild(optionsDiv);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';

    // Simulate "Thinking" with IA Pulse
    const btn = document.querySelector('.ted-button');
    btn.style.animation = 'tedPulse 0.5s infinite';

    setTimeout(async () => {
        let botResponse = { text: "Je n'ai pas compris. Essayez 'menu', 'jardin' ou 'ia'.", options: [] };

        // PHASE 2: Mock RAG - Search in JSON Data
        if (typeof tedApi !== 'undefined') {
            const lowerInput = text.toLowerCase();

            // Search in Services (IA)
            if (lowerInput.includes('ia') || lowerInput.includes('service')) {
                const data = await tedApi.fetchData('services');
                if (data && data.external) {
                    botResponse.text = `Nous proposons : ${data.external.services.map(s => s.name).join(', ')}.`;
                }
            }
            // Search in Menu (Restaurant)
            else if (lowerInput.includes('manger') || lowerInput.includes('menu') || lowerInput.includes('prix')) {
                const data = await tedApi.fetchData('menu');
                if (data) {
                    botResponse.text = `Aujourd'hui chez viTEDia : ${data.mains[0].name} à ${data.mains[0].price}€.`;
                }
            }
            // Search in Garden
            else if (lowerInput.includes('jardin') || lowerInput.includes('legume')) {
                const data = await tedApi.fetchData('garden');
                if (data) {
                    botResponse.text = `En production : ${data.categories[0].items.join(', ')}.`;
                }
            }
            // Default fallback logic...
            else {
                botResponse = getDefaultResponse(lowerInput);
            }
        }

        btn.style.animation = 'none';
        addMessage('bot', botResponse.text, botResponse.options);
    }, 1000);
}

function handleOptionClick(text) {
    addMessage('user', text);
    setTimeout(() => {
        const response = getBotResponse(text);
        addMessage('bot', response.text, response.options);
    }, 800);
}

function getDefaultResponse(input) {
    if (input.includes('bonjour')) return { text: "Bonjour ! Je suis l'assistant TEDSAI. Comment puis-je aider ?", options: [] };
    if (input.includes('contact')) return { text: "Vous pouvez nous écrire sur la page Contact.", options: [] };
    return { text: "Je peux vous renseigner sur le Menu, le Jardin ou nos Services IA.", options: ["Menu", "Jardin", "Services IA"] };
}

function getBotResponse(input) {
    const lowerInput = input.toLowerCase();

    // Simple Keyword Matching logic based on specs
    if (lowerInput.includes('réserver') || lowerInput.includes('reservation')) {
        return {
            text: "Pour une réservation, combien de personnes serez-vous ?",
            options: ["2 personnes", "4 personnes", "Groupe > 6"]
        };
    }

    if (lowerInput.includes('2 personnes') || lowerInput.includes('4 personnes')) {
        return {
            text: "Noté. Quelle heure vous conviendrait le mieux pour ce soir ?",
            options: ["19h00", "19h30", "20h00"]
        };
    }

    if (lowerInput.includes('19h') || lowerInput.includes('20h')) {
        return {
            text: "C'est noté ! Préférez-vous être en terrasse ou à l'intérieur ?",
            options: ["Terrasse", "Intérieur"]
        };
    }

    if (lowerInput.includes('terrasse') || lowerInput.includes('intérieur')) {
        return {
            text: "Parfait ! Je vous redirige vers le formulaire de finalisation...",
            options: ["OK"] // In a real app, this would redirect or open a modal
        };
    }

    if (lowerInput.includes('menu') || lowerInput.includes('manger')) {
        return {
            text: "Notre menu change tous les jours selon la récolte ! Aujourd'hui, nous avons un excellent Velouté de Potimarron et un Risotto aux Cèpes.",
            options: ["Voir le menu complet", "Réserver"]
        };
    }

    if (lowerInput.includes('ia') || lowerInput.includes('solution') || lowerInput.includes('facturation')) {
        return {
            text: "L'automatisation de la facturation est notre spécialité. Nos clients économisent en moyenne 15h par semaine. Souhaitez-vous une démo ?",
            options: ["Oui, une démo", "Voir les tarifs"]
        };
    }

    if (lowerInput.includes('jardin') || lowerInput.includes('origine') || lowerInput.includes('traçabilité')) {
        return {
            text: "Tout vient de notre jardin urbain à Yaoundé ! Zéro pesticide. Vous pouvez scanner le QR code sur votre plat pour voir la parcelle exacte.",
            options: ["Scanner un code", "Visiter le jardin"]
        };
    }

    // Default fallback
    return {
        text: "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ? Je peux vous aider sur l'IA, le Restaurant ou le Jardin.",
        options: ["Solutions IA", "Restaurant", "Jardin"]
    };
}
