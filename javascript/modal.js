// modal.js
let currentSessionId = null;
// let currentDrawingId = null;

// Ouvrir un modal
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
    } else {
        console.error(`Modal with ID "${modalId}" not found.`);
    }
}

// Fermer un modal
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    } else {
        console.error(`Modal with ID "${modalId}" not found.`);
    }
}

// Fonction pour ouvrir le modal d'ajout dessin + stocker l'ID de la session
export function openDrawingModal(sessionId) {
    currentSeanceCardId = sessionId; // Stocker l'ID dans la variable temporaire
    openModal('add-drawing-modal');
}

// Gérer la fermeture lorsqu'on clique en dehors du contenu
export function setupModalHandlers() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

export function getCurrentSessionId() {
    return currentSessionId;
}