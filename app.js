document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameForm = document.getElementById('game-form');
    const entriesContainer = document.getElementById('entries-container');
    const searchInput = document.getElementById('search-input');

    // State
    let entries = JSON.parse(localStorage.getItem('gameDiaryEntries')) || [];

    // Initialize
    renderEntries();

    // Event Listeners
    gameForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', (e) => renderEntries(e.target.value));

    // Functions

    function handleFormSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const genre = document.getElementById('genre').value;
        const platform = document.getElementById('platform').value;
        const status = document.getElementById('status').value;
        const rating = document.getElementById('rating').value;
        const playtime = document.getElementById('playtime').value;
        const review = document.getElementById('review').value;

        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            title,
            genre,
            platform,
            status,
            rating,
            playtime,
            review
        };

        entries.unshift(newEntry); // Add to top
        saveEntries();
        renderEntries();
        gameForm.reset();
    }

    function saveEntries() {
        localStorage.setItem('gameDiaryEntries', JSON.stringify(entries));
    }

    function renderEntries(filterText = '') {
        entriesContainer.innerHTML = '';

        const filteredEntries = entries.filter(entry =>
            entry.title.toLowerCase().includes(filterText.toLowerCase()) ||
            entry.genre.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredEntries.length === 0) {
            entriesContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No entries found. Start gaming!</p>';
            return;
        }

        filteredEntries.forEach(entry => {
            const dateObj = new Date(entry.date);
            const dateString = dateObj.toLocaleDateString();

            const card = document.createElement('div');
            card.className = 'entry-card';
            card.innerHTML = `
                <div class="entry-header">
                    <span class="entry-title">${escapeHtml(entry.title)}</span>
                    <span class="entry-rating">⭐ ${entry.rating}/5</span>
                </div>
                <div class="entry-meta">
                    <span>📅 ${dateString}</span>
                    <span>🕹️ ${escapeHtml(entry.platform || 'N/A')}</span>
                    <span>🎭 ${escapeHtml(entry.genre || 'N/A')}</span>
                    <span>⏱️ ${entry.playtime || 0}h</span>
                    <span style="color: var(--accent);">[${entry.status}]</span>
                </div>
                <div class="entry-review">${escapeHtml(entry.review)}</div>
                <div class="entry-actions">
                    <button class="btn-share" onclick="shareEntry(${entry.id})">Share</button>
                    <button class="btn-delete" onclick="deleteEntry(${entry.id})">Delete</button>
                </div>
            `;
            entriesContainer.appendChild(card);
        });
    }

    // Helper to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Global functions for buttons (since they are in innerHTML)
    window.deleteEntry = function(id) {
        if(confirm('Are you sure you want to delete this entry?')) {
            entries = entries.filter(entry => entry.id !== id);
            saveEntries();
            renderEntries(searchInput.value);
        }
    };

    window.shareEntry = function(id) {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        const shareText = `🎮 Game Diary Log\n\nTitle: ${entry.title}\nRating: ⭐ ${entry.rating}/5\nStatus: ${entry.status}\nPlaytime: ${entry.playtime}h\n\n"${entry.review}"`;

        navigator.clipboard.writeText(shareText).then(() => {
            alert('Entry copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy to clipboard.');
        });
    };
});
