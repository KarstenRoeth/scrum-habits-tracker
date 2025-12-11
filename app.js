// =========================
// Datenstruktur & Storage
// =========================

let habits = [];
let currentFilter = 'all';

// Gewohnheiten aus dem Browser-Speicher laden
function loadHabits() {
    const saved = localStorage.getItem('scrumHabits');
    if (saved) {
        habits = JSON.parse(saved);
        
        // Migration: Alte Gewohnheiten mit neuen Feldern ergänzen
        habits = habits.map(habit => {
            if (!habit.category) habit.category = 'team';
            if (!habit.priority) habit.priority = 'medium';
            if (habit.notes === undefined) habit.notes = '';
            return habit;
        });
        
        saveHabits(); // Migrierte Daten speichern
    }
}

// Gewohnheiten im Browser-Speicher speichern
function saveHabits() {
    localStorage.setItem('scrumHabits', JSON.stringify(habits));
}

// =========================
// Templates für Scrum Master
// =========================

const templates = [
    {
        id: 'beginner',
        name: '🌱 Starter - Für neue Scrum Master',
        description: 'Grundlegende Gewohnheiten zum Einstieg in die Rolle',
        habits: [
            { name: 'Daily Standup vorbereiten', category: 'team', priority: 'high', reminderDays: 1, notes: 'Agenda checken, Impediments im Blick behalten' },
            { name: 'Sprint Review vorbereiten', category: 'team', priority: 'high', reminderDays: 14, notes: 'Demo-Umgebung prüfen, Stakeholder einladen' },
            { name: 'Retrospektive vorbereiten', category: 'team', priority: 'high', reminderDays: 14, notes: 'Format wählen, Team-Feedback einholen' },
            { name: 'Mit Product Owner synchronisieren', category: 'organization', priority: 'medium', reminderDays: 7, notes: 'Backlog-Status, anstehende Features besprechen' },
            { name: 'Scrum-Literatur lesen', category: 'personal', priority: 'low', reminderDays: 30, notes: 'Blogs, Bücher, Communities aktiv verfolgen' }
        ]
    },
    {
        id: 'team-focus',
        name: '🤝 Team-Fokus - Für Team-Entwicklung',
        description: 'Gewohnheiten zur Stärkung der Team-Zusammenarbeit',
        habits: [
            { name: 'Kaffee-Gespräch mit Teammitglied', category: 'team', priority: 'high', reminderDays: 7, notes: 'Rotation durch alle Teammitglieder, persönlichen Bezug aufbauen' },
            { name: 'Team Health Check durchführen', category: 'team', priority: 'medium', reminderDays: 30, notes: 'Stimmung erfassen, Trends identifizieren' },
            { name: 'Pair/Mob Programming initiieren', category: 'team', priority: 'medium', reminderDays: 14, notes: 'Wissenstransfer fördern, Qualität steigern' },
            { name: 'Team-Event organisieren', category: 'team', priority: 'low', reminderDays: 60, notes: 'Teambuilding, gemeinsame Aktivitäten außerhalb der Arbeit' },
            { name: 'Konflikte proaktiv ansprechen', category: 'team', priority: 'high', reminderDays: 3, notes: 'Früh erkennen, moderieren, Lösungen gemeinsam entwickeln' }
        ]
    },
    {
        id: 'stakeholder',
        name: '🏢 Stakeholder-Management',
        description: 'Gewohnheiten für effektive organisationale Zusammenarbeit',
        habits: [
            { name: 'Stakeholder-Mapping aktualisieren', category: 'organization', priority: 'medium', reminderDays: 30, notes: 'Wer sind die Schlüsselpersonen? Welche Interessen haben sie?' },
            { name: '1-on-1 mit Stakeholder', category: 'organization', priority: 'high', reminderDays: 14, notes: 'Erwartungen abgleichen, Feedback einholen' },
            { name: 'Impediments mit Management klären', category: 'organization', priority: 'high', reminderDays: 7, notes: 'Blocker eskalieren, Entscheidungen einfordern' },
            { name: 'Organisationale Metrics teilen', category: 'organization', priority: 'medium', reminderDays: 30, notes: 'Velocity, Quality, Happiness transparent machen' },
            { name: 'Communities of Practice besuchen', category: 'organization', priority: 'low', reminderDays: 30, notes: 'Austausch mit anderen Scrum Mastern, Best Practices teilen' }
        ]
    },
    {
        id: 'self-development',
        name: '👤 Persönliche Entwicklung',
        description: 'Gewohnheiten für dein eigenes Wachstum als Scrum Master',
        habits: [
            { name: 'Eigene Retrospektive durchführen', category: 'personal', priority: 'high', reminderDays: 14, notes: 'Was lief gut? Was kann ich verbessern?' },
            { name: 'Coaching-Techniken üben', category: 'personal', priority: 'medium', reminderDays: 7, notes: 'Aktives Zuhören, Powerful Questions, Feedback-Techniken' },
            { name: 'Agile Community Event besuchen', category: 'personal', priority: 'low', reminderDays: 60, notes: 'Meetups, Konferenzen, Webinare' },
            { name: 'Mentor-Session wahrnehmen', category: 'personal', priority: 'medium', reminderDays: 30, notes: 'Austausch mit erfahrenem Scrum Master oder Coach' },
            { name: 'Neues Framework/Methode lernen', category: 'personal', priority: 'low', reminderDays: 90, notes: 'Liberating Structures, Management 3.0, etc.' }
        ]
    }
];

// =========================
// Kategorien & Prioritäten
// =========================

const categories = {
    team: { label: '🤝 Team', emoji: '🤝' },
    organization: { label: '🏢 Organisation', emoji: '🏢' },
    personal: { label: '👤 Persönlich', emoji: '👤' }
};

const priorities = {
    high: { label: 'Hoch', emoji: '🔴', class: 'high' },
    medium: { label: 'Mittel', emoji: '🟡', class: 'medium' },
    low: { label: 'Niedrig', emoji: '🟢', class: 'low' }
};

// =========================
// UI - Tab Navigation
// =========================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Deaktiviere alle Tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Aktiviere gewählten Tab
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// =========================
// Templates anzeigen
// =========================

function displayTemplates() {
    const container = document.getElementById('templatesList');
    
    container.innerHTML = templates.map(template => `
        <div class="template-card">
            <h3>${template.name}</h3>
            <p>${template.description}</p>
            <div class="template-items">
                <h4>Enthaltene Gewohnheiten (${template.habits.length}):</h4>
                <ul>
                    ${template.habits.slice(0, 3).map(h => `
                        <li>${categories[h.category].emoji} ${h.name}</li>
                    `).join('')}
                    ${template.habits.length > 3 ? `<li>... und ${template.habits.length - 3} weitere</li>` : ''}
                </ul>
            </div>
            <button class="btn-template" onclick="loadTemplate('${template.id}')">
                Template übernehmen
            </button>
        </div>
    `).join('');
}

function loadTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (habits.length > 0) {
        if (!confirm(`Du hast bereits ${habits.length} Gewohnheit(en). Möchtest du das Template trotzdem hinzufügen?`)) {
            return;
        }
    }

    template.habits.forEach(habitData => {
        const habit = {
            id: Date.now() + Math.random(),
            name: habitData.name,
            category: habitData.category,
            priority: habitData.priority,
            reminderDays: habitData.reminderDays,
            notes: habitData.notes || '',
            lastDone: null
        };
        habits.push(habit);
    });

    saveHabits();
    displayHabits();

    // Wechsle zum Habits-Tab
    document.querySelector('.tab-btn[data-tab="habits"]').click();

    alert(`✅ Template "${template.name}" wurde erfolgreich hinzugefügt!\n\n${template.habits.length} Gewohnheiten wurden erstellt.`);
}

// =========================
// Gewohnheit hinzufügen
// =========================

function addHabit() {
    const nameInput = document.getElementById('habitName');
    const categoryInput = document.getElementById('habitCategory');
    const priorityInput = document.getElementById('habitPriority');
    const daysInput = document.getElementById('reminderDays');
    const notesInput = document.getElementById('habitNotes');
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const priority = priorityInput.value;
    const reminderDays = parseInt(daysInput.value);
    const notes = notesInput.value.trim();
    
    if (name === '') {
        alert('Bitte gib einen Namen für die Gewohnheit ein!');
        nameInput.focus();
        return;
    }

    if (reminderDays < 1) {
        alert('Die Anzahl der Tage muss mindestens 1 sein!');
        daysInput.focus();
        return;
    }
    
    const habit = {
        id: Date.now(),
        name: name,
        category: category,
        priority: priority,
        reminderDays: reminderDays,
        notes: notes,
        lastDone: null
    };
    
    habits.push(habit);
    saveHabits();
    
    // Formular zurücksetzen
    nameInput.value = '';
    categoryInput.value = 'team';
    priorityInput.value = 'medium';
    daysInput.value = '7';
    notesInput.value = '';
    
    displayHabits();
    
    // Wechsle zum Habits-Tab
    document.querySelector('.tab-btn[data-tab="habits"]').click();
    
    console.log('Gewohnheit hinzugefügt:', habit);
}

// =========================
// Gewohnheiten anzeigen
// =========================

function displayHabits() {
    const container = document.getElementById('habitsList');
    
    // Filtere nach Kategorie
    let filteredHabits = habits;
    if (currentFilter !== 'all') {
        filteredHabits = habits.filter(h => h.category === currentFilter);
    }

    // Sortiere nach Priorität und dann nach Überfälligkeit
    filteredHabits.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        const aDaysSince = a.lastDone ? Math.floor((Date.now() - a.lastDone) / (1000 * 60 * 60 * 24)) : 999;
        const bDaysSince = b.lastDone ? Math.floor((Date.now() - b.lastDone) / (1000 * 60 * 60 * 24)) : 999;
        return bDaysSince - aDaysSince;
    });
    
    if (filteredHabits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <h3>Noch keine Gewohnheiten</h3>
                <p>${currentFilter === 'all' ? 'Füge deine erste Gewohnheit hinzu oder wähle ein Template!' : 'Keine Gewohnheiten in dieser Kategorie.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredHabits.map(habit => {
        const lastDoneText = habit.lastDone 
            ? new Date(habit.lastDone).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'Noch nie';
        
        const daysSince = habit.lastDone 
            ? Math.floor((Date.now() - habit.lastDone) / (1000 * 60 * 60 * 24))
            : null;

        let statusBadge = '';
        let statusClass = '';
        if (daysSince === null) {
            statusBadge = '<span class="status-badge overdue">Noch nicht erledigt</span>';
            statusClass = 'overdue';
        } else if (daysSince >= habit.reminderDays) {
            statusBadge = `<span class="status-badge overdue">Überfällig (${daysSince} Tage)</span>`;
            statusClass = 'overdue';
        } else if (daysSince >= habit.reminderDays - 2) {
            statusBadge = `<span class="status-badge soon">Bald fällig (${daysSince} Tage)</span>`;
            statusClass = 'soon';
        } else {
            statusBadge = `<span class="status-badge good">Aktuell (${daysSince} Tage)</span>`;
            statusClass = 'good';
        }
        
        return `
            <div class="habit-card priority-${habit.priority}" data-status="${statusClass}">
                <div class="habit-header">
                    <div class="habit-title">
                        <h3>${habit.name}</h3>
                    </div>
                </div>
                
                <div class="habit-badges">
                    <span class="badge badge-category">${categories[habit.category].label}</span>
                    <span class="badge badge-priority ${priorities[habit.priority].class}">
                        ${priorities[habit.priority].emoji} ${priorities[habit.priority].label}
                    </span>
                </div>

                <div class="habit-info">
                    <div class="info-row">
                        <strong>Erinnerung:</strong>
                        <span>Alle ${habit.reminderDays} Tage</span>
                    </div>
                    <div class="info-row">
                        <strong>Zuletzt gemacht:</strong>
                        <span>${lastDoneText}</span>
                    </div>
                    <div class="info-row">
                        <strong>Status:</strong>
                        ${statusBadge}
                    </div>
                </div>

                ${habit.notes ? `
                    <div class="habit-notes">
                        💡 ${habit.notes}
                    </div>
                ` : ''}

                <div class="habit-actions">
                    <button class="btn-done" onclick="markAsDone(${habit.id})">
                        ✓ Heute erledigt
                    </button>
                    <button class="btn-edit" onclick="editHabit(${habit.id})">
                        ✏️ Bearbeiten
                    </button>
                    <button class="btn-delete" onclick="deleteHabit(${habit.id})">
                        🗑 Löschen
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// =========================
// Gewohnheit als erledigt markieren
// =========================

function markAsDone(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
        habit.lastDone = Date.now();
        saveHabits();
        displayHabits();
        
        const messages = [
            `✅ Super! "${habit.name}" erledigt!`,
            `🎉 Gut gemacht! "${habit.name}" abgehakt!`,
            `👏 Klasse! "${habit.name}" ist erledigt!`,
            `💪 Weiter so! "${habit.name}" geschafft!`
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        // Kurzes visuelles Feedback
        const notification = document.createElement('div');
        notification.textContent = randomMsg;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #43A047;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
        
        console.log('Gewohnheit erledigt:', habit.name);
    }
}

// =========================
// Gewohnheit bearbeiten
// =========================

function editHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const modal = document.getElementById('habitModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 style="color: var(--emendare-blue); margin-bottom: 24px;">Gewohnheit bearbeiten</h2>
        
        <div class="form-group">
            <label for="editName">Name der Gewohnheit</label>
            <input type="text" id="editName" value="${habit.name}">
        </div>

        <div class="form-group">
            <label for="editCategory">Kategorie</label>
            <select id="editCategory">
                <option value="team" ${habit.category === 'team' ? 'selected' : ''}>🤝 Team</option>
                <option value="organization" ${habit.category === 'organization' ? 'selected' : ''}>🏢 Organisation</option>
                <option value="personal" ${habit.category === 'personal' ? 'selected' : ''}>👤 Persönlich</option>
            </select>
        </div>

        <div class="form-group">
            <label for="editPriority">Priorität</label>
            <select id="editPriority">
                <option value="high" ${habit.priority === 'high' ? 'selected' : ''}>🔴 Hoch</option>
                <option value="medium" ${habit.priority === 'medium' ? 'selected' : ''}>🟡 Mittel</option>
                <option value="low" ${habit.priority === 'low' ? 'selected' : ''}>🟢 Niedrig</option>
            </select>
        </div>

        <div class="form-group">
            <label for="editDays">Erinnerung nach (Tagen)</label>
            <input type="number" id="editDays" value="${habit.reminderDays}" min="1">
        </div>

        <div class="form-group">
            <label for="editNotes">Notizen</label>
            <textarea id="editNotes" rows="3">${habit.notes}</textarea>
        </div>

        <button class="btn-primary" onclick="saveEditedHabit(${habit.id})">
            Änderungen speichern
        </button>
    `;

    modal.classList.add('show');
}

function saveEditedHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const name = document.getElementById('editName').value.trim();
    const category = document.getElementById('editCategory').value;
    const priority = document.getElementById('editPriority').value;
    const reminderDays = parseInt(document.getElementById('editDays').value);
    const notes = document.getElementById('editNotes').value.trim();

    if (name === '') {
        alert('Bitte gib einen Namen ein!');
        return;
    }

    habit.name = name;
    habit.category = category;
    habit.priority = priority;
    habit.reminderDays = reminderDays;
    habit.notes = notes;

    saveHabits();
    displayHabits();
    closeModal();

    console.log('Gewohnheit aktualisiert:', habit);
}

// =========================
// Gewohnheit löschen
// =========================

function deleteHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    if (confirm(`Möchtest du "${habit.name}" wirklich löschen?`)) {
        habits = habits.filter(h => h.id !== id);
        saveHabits();
        displayHabits();
        console.log('Gewohnheit gelöscht');
    }
}

// =========================
// Vorschlag für nächste Aktivität
// =========================

function suggestNextHabit() {
    if (habits.length === 0) {
        alert('📋 Du hast noch keine Gewohnheiten!\n\nFüge zuerst Gewohnheiten hinzu oder wähle ein Template.');
        return;
    }
    
    const now = Date.now();
    const overdue = [];
    
    habits.forEach(habit => {
        if (!habit.lastDone) {
            // Noch nie gemacht - höchste Priorität
            overdue.push({ 
                habit, 
                daysSince: 999,
                priorityValue: getPriorityValue(habit.priority)
            });
        } else {
            const daysSince = Math.floor((now - habit.lastDone) / (1000 * 60 * 60 * 24));
            if (daysSince >= habit.reminderDays) {
                overdue.push({ 
                    habit, 
                    daysSince,
                    priorityValue: getPriorityValue(habit.priority)
                });
            }
        }
    });
    
    if (overdue.length === 0) {
        alert('👍 Fantastisch!\n\nAlle deine Gewohnheiten sind aktuell. Du machst einen super Job! 🎉');
        return;
    }
    
    // Sortiere nach Priorität, dann nach Tagen
    overdue.sort((a, b) => {
        if (a.priorityValue !== b.priorityValue) {
            return a.priorityValue - b.priorityValue;
        }
        return b.daysSince - a.daysSince;
    });
    
    const suggestion = overdue[0].habit;
    const categoryLabel = categories[suggestion.category].label;
    const priorityLabel = priorities[suggestion.priority].emoji + ' ' + priorities[suggestion.priority].label;
    
    const message = suggestion.lastDone
        ? `💡 Empfehlung für dich:\n\n"${suggestion.name}"\n\n` +
          `📂 Kategorie: ${categoryLabel}\n` +
          `⭐ Priorität: ${priorityLabel}\n` +
          `📅 Zuletzt gemacht: vor ${overdue[0].daysSince} Tagen\n` +
          `⏰ Erinnerung: alle ${suggestion.reminderDays} Tage\n\n` +
          `${overdue.length > 1 ? `Es gibt noch ${overdue.length - 1} weitere überfällige Aktivität(en).` : ''}`
        : `💡 Empfehlung für dich:\n\n"${suggestion.name}"\n\n` +
          `📂 Kategorie: ${categoryLabel}\n` +
          `⭐ Priorität: ${priorityLabel}\n` +
          `📅 Das hast du noch nie gemacht!\n` +
          `⏰ Erinnerung: alle ${suggestion.reminderDays} Tage\n\n` +
          `${overdue.length > 1 ? `Es gibt noch ${overdue.length - 1} weitere überfällige Aktivität(en).` : ''}`;
    
    alert(message);
}

function getPriorityValue(priority) {
    const values = { high: 0, medium: 1, low: 2 };
    return values[priority] || 1;
}

// =========================
// Filter
// =========================

function initFilter() {
    const filterSelect = document.getElementById('categoryFilter');
    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        displayHabits();
    });
}

// =========================
// Modal
// =========================

function closeModal() {
    const modal = document.getElementById('habitModal');
    modal.classList.remove('show');
}

// Modal schließen bei Klick außerhalb
window.onclick = function(event) {
    const modal = document.getElementById('habitModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Modal schließen bei X-Klick
document.querySelector('.close').addEventListener('click', closeModal);

// =========================
// Service Worker (PWA)
// =========================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('Service Worker registriert:', reg))
        .catch(err => console.log('Service Worker Fehler:', err));
}

// =========================
// App initialisieren
// =========================

document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    initTabs();
    initFilter();
    displayHabits();
    displayTemplates();
    
    // Event Listener
    document.getElementById('addBtn').addEventListener('click', addHabit);
    document.getElementById('suggestBtn').addEventListener('click', suggestNextHabit);
    
    // Enter-Taste im Formular
    document.getElementById('habitName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });
    
    console.log('✅ Scrum Habits Tracker v2.0 gestartet!');
    console.log(`📊 ${habits.length} Gewohnheiten geladen`);
});

// Animationen für Notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
