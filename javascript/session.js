import { renderCalendar } from "./calendrier.js";
import { closeModal } from "./modal.js";
import { generateDateId, calculateTimeDifference } from "./utils.js";

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
    const transaction = db.transaction(["Session", "Dessin", "Date"], "readwrite");
    const sessionStore = transaction.objectStore("Session");
    const drawingStore = transaction.objectStore("Dessin");
    const dateStore = transaction.objectStore("Date");

    sessionStore.get(sessionId).onsuccess = (event) => {
        const session = event.target.result;

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