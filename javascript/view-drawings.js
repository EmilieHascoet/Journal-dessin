/* Vignettes */
function openVignettesModal(seanceId) {
    const transaction = db.transaction('Dessin', 'readonly');
    const drawingStore = transaction.objectStore('Dessin');
    const index = drawingStore.index('seanceCardId');
    const range = IDBKeyRange.only(seanceId);
    const request = index.getAll(range);

    request.onsuccess = () => {
        const drawings = request.result;
        const drawingsContainer = document.getElementById('drawings-container-vignettes');
        drawingsContainer.innerHTML = ''; // Réinitialiser le contenu avant d'ajouter les dessins

        drawings.forEach((drawing, index) => {
            const blob = new Blob([drawing.image], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
        
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = drawing.titre || `Dessin ${index + 1}`;
        
            const titleElement = document.createElement('h4');
            titleElement.textContent = drawing.titre || `Dessin ${index + 1}`;
        
            const cardElement = document.createElement('div');
            cardElement.className = 'drawing-card';
            cardElement.appendChild(imgElement);
            cardElement.appendChild(titleElement);
        
            document.getElementById('drawings-container-vignettes').appendChild(cardElement);
        });
        

        // Ouvrir le modal avec les dessins
        openModal('view-vignettes-modal');
    };
}

/* Carousel */
let currentImageIndex = 0;

function showNextImage() {
    const images = document.querySelectorAll('#carousel-images img');
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0;
    }
    updateCarousel();
}

function showPrevImage() {
    const images = document.querySelectorAll('#carousel-images img');
    if (currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = images.length - 1;
    }
    updateCarousel();
}

function updateCarousel() {
    const images = document.querySelectorAll('#carousel-images img');
    images.forEach((img, index) => {
        img.classList.remove('active');
        if (index === currentImageIndex) {
            img.classList.add('active');
        }
    });
}

/* Carousel*/
function openCarouselModal(seanceId) {
    const transaction = db.transaction('Dessin', 'readonly');
    const drawingStore = transaction.objectStore('Dessin');
    const index = drawingStore.index('seanceCardId');
    const range = IDBKeyRange.only(seanceId);
    const request = index.getAll(range);

    request.onsuccess = () => {
        const drawings = request.result;
        const carouselContainer = document.getElementById('carousel-images');
        carouselContainer.innerHTML = '';

        drawings.forEach((drawing, index) => {
            const blob = new Blob([drawing.image], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);

            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = drawing.titre || `Dessin ${index + 1}`;
            carouselContainer.appendChild(imgElement);
        });

        // Initialisation du carrousel
        updateCarousel();

        openModal('view-carousel-modal');
    };
}
