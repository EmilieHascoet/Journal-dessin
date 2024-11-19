import { renderCalendar } from "./calendrier.js";
import { closeModal, openModal } from "./modal.js";
import { generateDateId, calculateTimeDifference, formatDateFromId } from "./utils.js";
import { getDatabase } from "./main.js";

export function addSession(db, date, notePersonnelle, theme, heureDebut, heureFin) {
    const dateId = generateDateId(date);
    const temps = calculateTimeDifference(heureDebut, heureFin);

    const transaction = db.transaction(["Date", "Session"], "readwrite");
    const dateStore = transaction.objectStore("Date");
    const sessionStore = transaction.objectStore("Session");

    // Vérifier ou créer l'entrée Date
    dateStore.get(dateId).onsuccess = (event) => {
        let dateEntry = event.target.result;

        if (!dateEntry) {
            dateEntry = { id: dateId, nbrSession: 0, nbrDessin: 0, TotalHeure: 0 };
            dateStore.add(dateEntry);
        }

        dateEntry.nbrSession += 1;
        dateEntry.TotalHeure += temps;

        dateStore.put(dateEntry);
    };

    // Ajouter la session
    sessionStore.add({
        dateId,
        date,
        notePersonnelle,
        theme,
        heureDebut,
        heureFin,
        temps,
    }).onsuccess = () => {
        alert("Session ajoutée !");
        closeModal('add-session-modal')
        renderCalendar();
    };
}

export function deleteSession(sessionId) {
    sessionId = parseInt(sessionId, 10);
    const db = getDatabase();
    const transaction = db.transaction(["Session", "Dessin", "Date"], "readwrite");
    const sessionStore = transaction.objectStore("Session");
    const drawingStore = transaction.objectStore("Dessin");
    const dateStore = transaction.objectStore("Date");

    sessionStore.get(sessionId).onsuccess = (event) => {
        const session = event.target.result;
        console.log('event', event);
        console.log('event.target', event.target);
        console.log('event.target.result', event.target.result);

        if (session) {
            const dateId = session.dateId;
            const sessionTemps = session.temps;

            // Supprimer les dessins associés
            const index = drawingStore.index("sessionId");
            const range = IDBKeyRange.only(sessionId);

            index.openCursor(range).onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    drawingStore.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };

            // Supprimer la session
            sessionStore.delete(sessionId).onsuccess = () => {
                // Mettre à jour la table Date
                dateStore.get(dateId).onsuccess = (event) => {
                    const dateEntry = event.target.result;

                    if (dateEntry) {
                        dateEntry.nbrSession -= 1;
                        dateEntry.TotalHeure -= sessionTemps;

                        if (dateEntry.nbrSession <= 0) {
                            dateStore.delete(dateId); // Supprimer la date si plus de sessions
                        } else {
                            dateStore.put(dateEntry);
                        }
                    }
                };

                alert("Session supprimée !");
                renderCalendar();
            };
        }
    };
}

export function openSessionDetailsModal(dateId) {
    // Met à jour le titre avec la date
    document.getElementById('session-date-title').textContent = `Sessions du ${formatDateFromId(dateId)}`;

    // Récupère les données depuis la base de données
    const db = getDatabase(); // Assure-toi que cette fonction est bien définie
    const transaction = db.transaction(["Session"], "readonly");
    const store = transaction.objectStore("Session");
    const index = store.index("dateId");
    const sessionsContainer = document.getElementById('session-details-container');
    sessionsContainer.innerHTML = ''; // Réinitialise les sessions précédentes
    index.getAll(dateId).onsuccess = (event) => {
        const sessions = event.target.result;
        if (sessions.length > 0) {
            sessions.forEach(session => {
                // Crée un élément pour chaque session
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('session-item');
                sessionElement.innerHTML = `
                    <p><strong>Horaires :</strong> ${session.heureDebut} - ${session.heureFin}</p>
                    <p><strong>Theme :</strong> ${session.theme}</p>
                    <p><strong>Note personnelle :</strong> ${session.notePersonnelle}</p>
                    <button class="delete-session-btn" data-session-id="${session.id}">Supprimer</button>
                `;
                sessionsContainer.appendChild(sessionElement);
            });

            // Ajoute les événements pour les boutons "Supprimer"
            const deleteButtons = document.querySelectorAll('.delete-session-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const sessionId = button.getAttribute('data-session-id');
                    deleteSession(sessionId);
                    openSessionDetailsModal(dateId); // Rafraîchir après suppression
                });
            });
        } else {
            sessionsContainer.innerHTML = '<p>Aucune session trouvée.</p>';
        }
    };
    
    // Affiche le modal
    openModal('session-details-modal')
}