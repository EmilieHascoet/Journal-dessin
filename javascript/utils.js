// utils.js
export function generateDateId(date) {
    const [year, month, day] = date.split("-");
    return `${day}${month}${year}`;
}

export function calculateTimeDifference(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
}

export function updateDateEntry(db, dateId, updateFn) {
    const transaction = db.transaction("Date", "readwrite");
    const store = transaction.objectStore("Date");

    store.get(dateId).onsuccess = (event) => {
        const dateEntry = event.target.result;
        if (dateEntry) {
            updateFn(dateEntry);
            store.put(dateEntry);
        }
    };
}

export function formatDateFromId(id) {
    const day = id.slice(0, 2);
    const month = id.slice(2, 4);
    const year = id.slice(4);
    return `${day}/${month}/${year}`;
}

export function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
}