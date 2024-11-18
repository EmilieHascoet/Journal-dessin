// main.js

// Initialisation de la base IndexedDB
import { initializeDatabase } from './database.js';
import { renderCalendar, changeMonth } from './calendrier.js';
import { setupModalHandlers } from './modal.js';

import { addDrawing, deleteDrawing } from './drawing.js';
import { addSession, deleteSession } from './session.js';

let db;

// Initialiser la base de données
const request = indexedDB.open("DrawingTracker", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    initializeDatabase(db); // Appelle la fonction depuis database.js
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database initialized!");
    renderCalendar(); // Charge le calendrier après l'initialisation
};

request.onerror = () => {
    console.error("Database failed to open");
};

// Gestion des modals (fermeture automatique, etc.)
setupModalHandlers();

document.getElementById('add-session-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const date = document.getElementById('session-date').value;
    const notePersonnelle = document.getElementById('session-note').value;
    const theme = document.getElementById('session-theme').value;
    const heureDebut = document.getElementById('session-start-time').value;
    const heureFin = document.getElementById('session-end-time').value;

    addSession(db, date, notePersonnelle, theme, heureDebut, heureFin);
});

document.getElementById('add-drawing-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('drawing-title').value;
    const image = document.getElementById('drawing-image').value;
    const heureDebut = document.getElementById('drawing-start-time').value;
    const heureFin = document.getElementById('drawing-end-time').value;

    addDrawing(db, title, image, heureDebut, heureFin);
});

export function getDatabase() {
    return db;
}

// Pour l'html
import { openModal, closeModal, openDrawingModal } from './modal.js';

// Exporter les fonctions pour l'html
window.openModal = openModal;
window.closeModal = closeModal;
window.openDrawingModal = openDrawingModal;
window.changeMonth = changeMonth;