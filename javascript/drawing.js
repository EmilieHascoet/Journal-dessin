
import { renderCalendar } from "./calendrier.js";
import { closeModal, getCurrentSessionId } from "./modal.js";
import { updateDateEntry, calculateTimeDifference } from "./utils.js";

export function addDrawing(db, title, image, heureDebut, heureFin) {
    const sessionId = getCurrentSessionId();
    const temps = calculateTimeDifference(heureDebut, heureFin);

    const transaction = db.transaction(["Dessin", "Session", "Date"], "readwrite");
    const drawingStore = transaction.objectStore("Dessin");
    const sessionStore = transaction.objectStore("Session");
    const dateStore = transaction.objectStore("Date");

    drawingStore.add({ sessionId: currentSessionId, titre: title, image, heureDebut, heureFin, temps }).onsuccess = () => {
        sessionStore.get(sessionId).onsuccess = (event) => {
            const session = event.target.result;

            if (session) {
                const dateId = session.dateId;

                // Mettre à jour la session et la date
                session.temps += temps;
                sessionStore.put(session);

                updateDateEntry(db, dateId, (dateEntry) => {
                    dateEntry.nbrDessin += 1;
                    dateEntry.TotalHeure += temps;
                });

                alert("Dessin ajouté !");
                closeModal('add-drawing-modal')
                renderCalendar();
            }
        };
    };
}

export function deleteDrawing(drawingId) {
    const transaction = db.transaction(["Dessin", "Session", "Date"], "readwrite");
    const drawingStore = transaction.objectStore("Dessin");
    const sessionStore = transaction.objectStore("Session");

    drawingStore.get(drawingId).onsuccess = (event) => {
        const drawing = event.target.result;

        if (drawing) {
            const sessionId = drawing.sessionId;
            const drawingTemps = drawing.temps;

            drawingStore.delete(drawingId).onsuccess = () => {
                sessionStore.get(sessionId).onsuccess = (event) => {
                    const session = event.target.result;

                    if (session) {
                        const dateId = session.dateId;

                        // Mettre à jour la session et la date
                        session.temps -= drawingTemps;
                        sessionStore.put(session);

                        updateDateEntry(db, dateId, (dateEntry) => {
                            dateEntry.nbrDessin -= 1;
                            dateEntry.TotalHeure -= drawingTemps;
                        });

                        alert("Dessin supprimé !");
                        renderCalendar();
                    }
                };
            };
        }
    };
}