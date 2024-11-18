// database.js

export function initializeDatabase(db) {
    // Table Date
    const dateStore = db.createObjectStore("Date", { keyPath: "id" });
    dateStore.createIndex("nbrSession", "nbrSession", { unique: false });
    dateStore.createIndex("nbrDessin", "nbrDessin", { unique: false });
    dateStore.createIndex("TotalHeure", "TotalHeure", { unique: false });

    // Table Session
    const sessionStore = db.createObjectStore("Session", { keyPath: "id", autoIncrement: true });
    sessionStore.createIndex("dateId", "dateId", { unique: false });

    // Table Dessin
    const drawingStore = db.createObjectStore("Dessin", { keyPath: "id", autoIncrement: true });
    drawingStore.createIndex("sessionId", "sessionId", { unique: false });
}