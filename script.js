document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const noResultsDiv = document.getElementById('noResults');
    const startMessageDiv = document.getElementById('startMessage');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    // Search form submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        startMessageDiv.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        noResultsDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                displayResults(data.items);
                resultsDiv.classList.remove('hidden');
            } else {
                noResultsDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            noResultsDiv.classList.remove('hidden');
        } finally {
            loadingDiv.classList.add('hidden');
        }
    });

    // Display search results
    function displayResults(books) {
        resultsDiv.innerHTML = books.map(book => {
            const { volumeInfo } = book;
            return `
                <div class="book-card" onclick="showBookDetails('${book.id}')">
                    <img 
                        src="${volumeInfo.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=2487&ixlib=rb-4.0.3'}"
                        alt="${volumeInfo.title}"
                        class="book-cover"
                    >
                    <div class="book-info">
                        <h3 class="book-title">${volumeInfo.title}</h3>
                        <p class="book-author">${volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
                        ${volumeInfo.averageRating ? `
                            <div class="rating">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <span>${volumeInfo.averageRating}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Show book details in modal
    window.showBookDetails = async (bookId) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
            const book = await response.json();
            const { volumeInfo } = book;

            modalContent.innerHTML = `
                <div class="modal-book">
                    <img 
                        src="${volumeInfo.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=2487&ixlib=rb-4.0.3'}"
                        alt="${volumeInfo.title}"
                        class="modal-cover"
                    >
                    <div class="modal-info">
                        <h2 class="modal-title">${volumeInfo.title}</h2>
                        <p class="modal-author">${volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
                        ${volumeInfo.categories ? `
                            <div class="categories">
                                ${volumeInfo.categories.map(category => 
                                    `<span class="category">${category}</span>`
                                ).join('')}
                            </div>
                        ` : ''}
                        <div class="book-details">
                            ${volumeInfo.publishedDate ? `
                                <p>Published: ${new Date(volumeInfo.publishedDate).toLocaleDateString()}</p>
                            ` : ''}
                            ${volumeInfo.pageCount ? `
                                <p>Pages: ${volumeInfo.pageCount}</p>
                            ` : ''}
                        </div>
                        <div class="description">
                            ${volumeInfo.description || 'No description available.'}
                        </div>
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching book details:', error);
        }
    };

    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.close-button')) {
            modal.classList.add('hidden');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
});