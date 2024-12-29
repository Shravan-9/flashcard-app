let currentMode = 'default'; // Tracks the current mode (default, edit, delete)

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupCardFlip();
    renderFlashcards(flashcards); // Automatically makes initial cards flippable
});


function setupEventListeners() {
    const createButton = document.getElementById('create-btn');
    const editButton = document.getElementById('edit-btn');
    const deleteButton = document.getElementById('delete-btn');
    const createForm = document.getElementById('create-flashcard-form');
    const editForm = document.getElementById('edit-flashcard-form');

    if (createButton) createButton.addEventListener('click', showCreateForm);
    if (editButton) editButton.addEventListener('click', startEditMode);
    if (deleteButton) deleteButton.addEventListener('click', startDeleteMode);

    if (createForm) createForm.addEventListener('submit', handleCreateFormSubmit);
    if (editForm) editForm.addEventListener('submit', handleEditFormSubmit);
}

function renderFlashcards(flashcards) {
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = '';
    flashcards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.dataset.id = card.id;
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><strong>${card.question}</strong></div>
                <div class="card-back"><strong>${card.answer}</strong></div>
            </div>
        `;
        cardContainer.appendChild(cardEl);
    });
    setupCardFlip();
}

function setupCardFlip() {
    document.querySelectorAll('.card').forEach(card => {
        card.removeEventListener('click', handleCardClick); // Remove any existing listeners
        card.addEventListener('click', handleCardClick); // Add the click listener
    });
}

function handleCardClick(event) {
    const card = event.currentTarget;

    if (currentMode === 'default') {
        card.classList.toggle('flipped'); // Allow flipping in default mode
    } else if (currentMode === 'edit') {
        openEditForm(event); // Open Edit form
    } else if (currentMode === 'delete') {
        deleteCard(event); // Delete the card
    }
}

function showCreateForm() {
    const createForm = document.getElementById('create-form');
    if (createForm) {
        // Clear the form fields
        const questionInput = createForm.querySelector('textarea[name="question"]');
        const answerInput = createForm.querySelector('textarea[name="answer"]');
        if (questionInput) questionInput.value = ''; // Clear question field
        if (answerInput) answerInput.value = ''; // Clear answer field

        createForm.classList.remove('hidden'); // Show the form
    }
}


function hideCreateForm() {
    const createForm = document.getElementById('create-form');
    if (createForm) {
        createForm.classList.add('hidden');
        removeDimBackground();
    }
}

function handleCreateFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    fetch('/create', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            renderFlashcards(data.flashcards);
            hideCreateForm();
        });
}

function startEditMode() {
    currentMode = 'edit';
    dimBackground();
}

function openEditForm(event) {
    const card = event.currentTarget;
    const cardId = card.dataset.id;

    const questionInput = document.getElementById('edit-question');
    const answerInput = document.getElementById('edit-answer');

    questionInput.value = card.querySelector('.card-front strong').textContent;
    answerInput.value = card.querySelector('.card-back strong').textContent;

    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.dataset.id = cardId;
        editForm.classList.remove('hidden');
    }
}

function hideEditForm() {
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.classList.add('hidden');
        removeDimBackground();
    }
}

function handleEditFormSubmit(event) {
    event.preventDefault();

    const editForm = document.getElementById('edit-form');
    const cardId = editForm.dataset.id;

    const formData = new FormData(event.target);

    fetch(`/edit/${cardId}`, {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            renderFlashcards(data.flashcards);
            hideEditForm();
        });
}

function startDeleteMode() {
    currentMode = 'delete';
    dimBackground();
}

function deleteCard(event) {
    const cardId = event.currentTarget.dataset.id;

    fetch(`/delete/${cardId}`, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            renderFlashcards(data.flashcards);
            removeDimBackground();
        });
}

function dimBackground() {
    const dimmedBg = document.createElement('div');
    dimmedBg.id = 'dimmed-bg';
    document.body.appendChild(dimmedBg);

    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('highlight'); // Highlight cards in Edit/Delete modes
    });
}

function removeDimBackground() {
    const dimmedBg = document.getElementById('dimmed-bg');
    if (dimmedBg) dimmedBg.remove();

    currentMode = 'default'; // Reset to default mode
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('highlight'); // Remove highlights
    });
}
