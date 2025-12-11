// Hier speichern wir alle Gewohnheiten
let habits = [];

// Gewohnheiten aus dem Browser-Speicher laden
function loadHabits() {
    const saved = localStorage.getItem('scrumHabits');
    if (saved) {
        habits = JSON.parse(saved);
    }
}

// Gewohnheiten im Browser-Speicher speichern
function saveHabits() {
    localStorage.setItem('scrumHabits', JSON.stringify(habits));
}

// App starten
loadHabits();
console.log('App gestartet!');
// Neue Gewohnheit hinzufügen
function addHabit() {
    const nameInput = document.getElementById('habitName');
    const daysInput = document.getElementById('reminderDays');
    
    const name = nameInput.value.trim();
    const reminderDays = parseInt(daysInput.value);
    
    if (name === '') {
        alert('Bitte einen Namen eingeben!');
        return;
    }
    
    const habit = {
        id: Date.now(),
        name: name,
        reminderDays: reminderDays,
        lastDone: null
    };
    
    habits.push(habit);
    saveHabits();
    
    nameInput.value = '';
    daysInput.value = '7';
    
    displayHabits();
    console.log('Gewohnheit hinzugefügt:', habit);
}

// Button-Event verbinden
document.getElementById('addBtn').addEventListener('click', addHabit);
// Gewohnheiten anzeigen
function displayHabits() {
    const container = document.getElementById('habitsList');
    
    if (habits.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6e6e73;">Noch keine Gewohnheiten hinzugefügt.</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => {
        const lastDoneText = habit.lastDone 
            ? new Date(habit.lastDone).toLocaleDateString('de-DE')
            : 'Noch nie';
        
        return `
            <div class="habit-card">
                <h3>${habit.name}</h3>
                <p>Erinnern nach: ${habit.reminderDays} Tagen</p>
                <p>Zuletzt gemacht: ${lastDoneText}</p>
                <button onclick="markAsDone(${habit.id})">✓ Heute erledigt</button>
                <button onclick="deleteHabit(${habit.id})" class="delete-btn">🗑 Löschen</button>
            </div>
        `;
    }).join('');
}

// Beim Start einmal anzeigen
displayHabits();
// Gewohnheit als erledigt markieren
function markAsDone(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
        habit.lastDone = Date.now();
        saveHabits();
        displayHabits();
        console.log('Gewohnheit erledigt:', habit.name);
    }
}

// Gewohnheit löschen
function deleteHabit(id) {
    if (confirm('Wirklich löschen?')) {
        habits = habits.filter(h => h.id !== id);
        saveHabits();
        displayHabits();
        console.log('Gewohnheit gelöscht');
    }
}
// Vorschlag für nächste Aktivität
function suggestNextHabit() {
    if (habits.length === 0) {
        alert('Noch keine Gewohnheiten vorhanden!');
        return;
    }
    
    const now = Date.now();
    const overdue = [];
    
    habits.forEach(habit => {
        if (!habit.lastDone) {
            // Noch nie gemacht - höchste Priorität
            overdue.push({ habit, daysSince: 999 });
        } else {
            const daysSince = Math.floor((now - habit.lastDone) / (1000 * 60 * 60 * 24));
            if (daysSince >= habit.reminderDays) {
                overdue.push({ habit, daysSince });
            }
        }
    });
    
    if (overdue.length === 0) {
        alert('👍 Alles up to date! Du bist super!');
        return;
    }
    
    // Sortiere nach Tagen (am längsten her zuerst)
    overdue.sort((a, b) => b.daysSince - a.daysSince);
    
    const suggestion = overdue[0].habit;
    const message = suggestion.lastDone
        ? `💡 Vorschlag: "${suggestion.name}"\n\nZuletzt gemacht vor ${overdue[0].daysSince} Tagen.`
        : `💡 Vorschlag: "${suggestion.name}"\n\nDas hast du noch nie gemacht!`;
    
    alert(message);
}

// Button-Event verbinden
document.getElementById('suggestBtn').addEventListener('click', suggestNextHabit);
// Service Worker registrieren (für PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('Service Worker registriert:', reg))
        .catch(err => console.log('Service Worker Fehler:', err));
}
