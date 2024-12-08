const { ipcRenderer } = require('electron');
const Chart = require('chart.js');

// Define functions globally
function showAddBookModal() {
    const modal = document.getElementById('addBookModal');
    const inventoryContent = document.querySelector('#inventorySection > div'); // Select the entire inventory content div
    modal.classList.remove('hidden');
    inventoryContent.style.display = 'none'; // Hide the entire inventory content
}

function closeAddBookModal() {
    const modal = document.getElementById('addBookModal');
    const inventoryContent = document.querySelector('#inventorySection > div'); // Select the entire inventory content div
    modal.classList.add('hidden');
    inventoryContent.style.display = 'block'; // Show the entire inventory content
    document.getElementById('addBookForm').reset();
}

document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers for navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            switchSection(section);
            
            // Load inventory data only when switching to inventory section
            if (section === 'inventory') {
                loadInventory();
            }
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await ipcRenderer.invoke('logout');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Failed to logout');
        }
    });

    // Form Submission Handler
    document.getElementById('addBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            isbn: document.getElementById('isbn').value,
            price: parseFloat(document.getElementById('price').value),
            stock_quantity: parseInt(document.getElementById('stock').value),
            publisher: document.getElementById('publisher').value
        };

        try {
            const result = await ipcRenderer.invoke('add-book', formData);
            if (result.success) {
                await loadInventory(); // Refresh the table
                
                const action = e.submitter.getAttribute('data-action');
                if (action === 'save-close') {
                    closeAddBookModal();
                } else if (action === 'save-next') {
                    document.getElementById('addBookForm').reset();
                    document.getElementById('title').focus();
                }
            } else {
                alert('Failed to add book: ' + result.error);
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Failed to add book. Please try again.');
        }
    });

    // Show home section by default
    switchSection('home');
    
    // Initialize inventory data
    loadInventory();

    // Backup functionality
    document.getElementById('backupBtn').addEventListener('click', async () => {
        try {
            const result = await ipcRenderer.invoke('create-backup');
            if (result.success) {
                alert('Backup created successfully at: ' + result.path);
            } else {
                alert('Failed to create backup: ' + result.error);
            }
        } catch (error) {
            console.error('Backup error:', error);
            alert('Failed to create backup. Please try again.');
        }
    });

    // Restore functionality
    document.getElementById('restoreBtn').addEventListener('click', async () => {
        const fileInput = document.getElementById('restoreFile');
        if (!fileInput.files.length) {
            alert('Please select a backup file first');
            return;
        }

        const confirmRestore = confirm(
            'Warning: Restoring from backup will replace all current data. This action cannot be undone. Continue?'
        );

        if (confirmRestore) {
            try {
                const result = await ipcRenderer.invoke('restore-backup', fileInput.files[0].path);
                if (result.success) {
                    alert('Database restored successfully. The application will now restart.');
                    ipcRenderer.invoke('restart-app');
                } else {
                    alert('Failed to restore backup: ' + result.error);
                }
            } catch (error) {
                console.error('Restore error:', error);
                alert('Failed to restore backup. Please try again.');
            }
        }
    });

    // Export functionality
    document.getElementById('exportCSV').addEventListener('click', async () => {
        try {
            const result = await ipcRenderer.invoke('export-data', 'csv');
            if (result.success) {
                alert('Data exported successfully to: ' + result.path);
            } else {
                alert('Failed to export data: ' + result.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    });

    document.getElementById('exportJSON').addEventListener('click', async () => {
        try {
            const result = await ipcRenderer.invoke('export-data', 'json');
            if (result.success) {
                alert('Data exported successfully to: ' + result.path);
            } else {
                alert('Failed to export data: ' + result.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    });
});

// Function to load inventory
async function loadInventory() {
    try {
        const books = await ipcRenderer.invoke('get-books');
        const tbody = document.getElementById('booksList');
        tbody.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.author}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.stock_quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR ${book.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editBook(${book.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onclick="deleteBook(${book.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load inventory:', error);
        alert('Failed to load inventory. Please try again.');
    }
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(sectionId + 'Section').classList.remove('hidden');
    
    // Update section title
    document.getElementById('sectionTitle').textContent = 
        sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('addBookModal').classList.contains('hidden')) {
        closeAddBookModal();
    }
});

// Close modal when clicking outside
document.getElementById('addBookModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeAddBookModal();
    }
});