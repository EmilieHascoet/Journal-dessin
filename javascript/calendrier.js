import { formatDateFromId, formatMinutes, generateDateId } from './utils.js';
import { getDatabase } from './main.js';

let currentMonth = new Date().getMonth(); // Mois actuel
let currentYear = new Date().getFullYear(); // Année actuelle

// Fonction pour afficher le mois et les jours
export function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const monthDays = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7; // Le jour de la semaine du 1er jour du mois
    const monthName = firstDay.toLocaleString('default', { month: 'long' });

    // Met à jour le titre du mois et de l'année
    document.getElementById('calendar-month').textContent = `${monthName} ${currentYear}`;

    const calendarGrid = document.querySelector('#calendar');
    calendarGrid.innerHTML = ''; // Réinitialiser la grille du calendrier

    // Créer les jours de la semaine
    const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });

    let dateCell = 1;
    // Créer les cellules du calendrier
    for (let i = 0; i < 6; i++) {

        // Créer les cellules pour chaque jour de la semaine
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (i === 0 && j < startDay) {
                calendarGrid.appendChild(cell); // Cellules vides avant le premier jour du mois
            } else if (dateCell <= monthDays) {
                const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dateCell).padStart(2, '0')}`;
                cell.textContent = dateCell;

                // Vérifier si la date est dans la base de données et afficher les données
                const dateId = generateDateId(date);
                checkDataForDate(dateId, cell);

                dateCell++;
                calendarGrid.appendChild(cell);
            }
        }
    }
}

// Fonction pour changer de mois
export function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

// Fonction pour vérifier et afficher les données de la date dans la base de données
function checkDataForDate(dateId, cell) {
    const db = getDatabase();
    const transaction = db.transaction(["Date"], "readonly");
    const store = transaction.objectStore("Date");

    store.get(dateId).onsuccess = (event) => {
        const dateEntry = event.target.result;
        if (dateEntry) {
            const recap = document.createElement("div");
            recap.classList.add("date-recap");
            recap.innerHTML = `
                <p>Sessions : ${dateEntry.nbrSession}</p>
                <p>Dessins : ${dateEntry.nbrDessin}</p>
                <p>${formatMinutes(dateEntry.TotalHeure)}</p>
            `;
            cell.appendChild(recap);
        }
    };
}
