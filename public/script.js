// ===== GESTION DES ONGLETS =====
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons et contenus
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Ajouter la classe active au bouton cliqué
        tab.classList.add('active');
        
        // Afficher le contenu correspondant
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// ===== SECTION CHAT =====
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Fonction pour ajouter un message dans le chat
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    messageDiv.innerHTML = `
        <strong>${isUser ? 'Vous' : 'Assistant'} :</strong>
        <p>${text}</p>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll automatique
}

// Fonction pour envoyer un message au backend
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return; // Ne rien faire si le message est vide
    
    // Afficher le message de l'utilisateur
    addMessage(message, true);
    userInput.value = ''; // Vider l'input
    
    // Afficher un message de chargement
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'message bot';
    loadingMsg.innerHTML = '<strong>Assistant :</strong><p><span class="loading"></span> Je réfléchis...</p>';
    messagesDiv.appendChild(loadingMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    try {
        // Appel à l'API backend
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
        
        const data = await response.json();
        
        // Retirer le message de chargement
        messagesDiv.removeChild(loadingMsg);
        
        // Afficher la réponse de l'IA
        if (data.reply) {
            addMessage(data.reply, false);
        } else {
            addMessage('Désolé, une erreur s\'est produite.', false);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        messagesDiv.removeChild(loadingMsg);
        addMessage('Erreur de connexion au serveur. Assure-toi que le serveur est démarré.', false);
    }
}

// Événements pour envoyer un message
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// ===== SECTION RÉSUMÉ =====
const resumeBtn = document.getElementById('resumeBtn');
const texteOriginal = document.getElementById('texteOriginal');
const resumeResult = document.getElementById('resumeResult');
const resumeText = document.getElementById('resumeText');

resumeBtn.addEventListener('click', async () => {
    const texte = texteOriginal.value.trim();
    
    if (!texte) {
        alert('Merci de coller un texte à résumer !');
        return;
    }
    
    // Afficher un indicateur de chargement
    resumeBtn.innerHTML = '<span class="loading"></span> Génération en cours...';
    resumeBtn.disabled = true;
    
    try {
        const response = await fetch('http://localhost:3000/api/resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texte }),
        });
        
        const data = await response.json();
        
        // Afficher le résumé
        resumeText.innerHTML = data.resume.replace(/\n/g, '<br>');
        resumeResult.style.display = 'block';
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la génération du résumé.');
    }
    
    // Réinitialiser le bouton
    resumeBtn.innerHTML = 'Générer le résumé';
    resumeBtn.disabled = false;
});

// ===== SECTION PLANNING =====
const addEventBtn = document.getElementById('addEventBtn');
const eventsList = document.getElementById('eventsList');

// Charger les événements au démarrage
loadEvents();

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/api/planning');
        const events = await response.json();
        
        eventsList.innerHTML = '';
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p style="color: #b0b0b0; text-align: center; padding: 30px;">Aucun événement pour le moment.</p>';
            return;
        }
        
        events.forEach(event => {
            displayEvent(event);
        });
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function displayEvent(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    eventDiv.innerHTML = `
        <div class="event-info">
            <h3>${event.title}</h3>
            <p>📅 ${formatDate(event.date)} à ${event.time}</p>
        </div>
        <button class="delete-btn" onclick="deleteEvent(${event.id})">Supprimer</button>
    `;
    eventsList.appendChild(eventDiv);
}

addEventBtn.addEventListener('click', async () => {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    
    if (!title || !date || !time) {
        alert('Merci de remplir tous les champs !');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/planning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, date, time }),
        });
        
        const event = await response.json();
        
        // Réinitialiser les champs
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        
        // Recharger la liste
        loadEvents();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de l\'événement.');
    }
});

async function deleteEvent(id) {
    if (!confirm('Supprimer cet événement ?')) return;
    
    try {
        await fetch(`http://localhost:3000/api/planning/${id}`, {
            method: 'DELETE',
        });
        
        loadEvents();
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ===== SECTION RAPPELS =====
const addRappelBtn = document.getElementById('addRappelBtn');
const rappelsList = document.getElementById('rappelsList');

loadRappels();

async function loadRappels() {
    try {
        const response = await fetch('http://localhost:3000/api/rappels');
        const rappels = await response.json();
        
        rappelsList.innerHTML = '';
        
        if (rappels.length === 0) {
            rappelsList.innerHTML = '<p style="color: #b0b0b0; text-align: center; padding: 30px;">Aucun rappel d\'examen.</p>';
            return;
        }
        
        rappels.forEach(rappel => {
            displayRappel(rappel);
        });
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function displayRappel(rappel) {
    const rappelDiv = document.createElement('div');
    rappelDiv.className = 'rappel-item';
    
    const joursRestants = getDaysUntil(rappel.date);
    const urgence = joursRestants <= 7 ? '🔴' : joursRestants <= 14 ? '🟡' : '🟢';
    
    rappelDiv.innerHTML = `
        <div class="rappel-info">
            <h3>${urgence} ${rappel.matiere}</h3>
            <p>📅 ${formatDate(rappel.date)} (dans ${joursRestants} jours)</p>
            ${rappel.notes ? `<p>📝 ${rappel.notes}</p>` : ''}
        </div>
        <button class="delete-btn" onclick="deleteRappel(${rappel.id})">Supprimer</button>
    `;
    rappelsList.appendChild(rappelDiv);
}

addRappelBtn.addEventListener('click', async () => {
    const matiere = document.getElementById('examenMatiere').value.trim();
    const date = document.getElementById('examenDate').value;
    const notes = document.getElementById('examenNotes').value.trim();
    
    if (!matiere || !date) {
        alert('Merci de remplir au moins la matière et la date !');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/rappels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matiere, date, notes }),
        });
        
        const rappel = await response.json();
        
        // Réinitialiser les champs
        document.getElementById('examenMatiere').value = '';
        document.getElementById('examenDate').value = '';
        document.getElementById('examenNotes').value = '';
        
        // Recharger la liste
        loadRappels();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout du rappel.');
    }
});

async function deleteRappel(id) {
    if (!confirm('Supprimer ce rappel ?')) return;
    
    try {
        await fetch(`http://localhost:3000/api/rappels/${id}`, {
            method: 'DELETE',
        });
        
        loadRappels();
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ===== FONCTIONS UTILITAIRES =====
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

function getDaysUntil(dateStr) {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
