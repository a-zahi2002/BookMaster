const { ipcRenderer } = require('electron');

// Add modal control functions
function showAddBookModal() {
    const modal = document.getElementById('addBookModal');
    const mainContent = document.querySelector('#inventorySection');
    modal.style.top = mainContent.offsetTop + 'px';
    modal.classList.remove('hidden');
    mainContent.style.visibility = 'hidden';
}

function closeAddBookModal() {
    const modal = document.getElementById('addBookModal');
    const mainContent = document.querySelector('#inventorySection');
    modal.classList.add('hidden');
    mainContent.style.visibility = 'visible';
    document.getElementById('addBookForm').reset();
}

document.addEventListener('DOMContentLoaded', () => {
    // Logout button handler
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await ipcRenderer.invoke('logout');
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Failed to logout. Please try again.');
        }
    });

    // Section navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);
            
            // Load section-specific data
            if (section === 'home') {
                loadHomeStats();
            } else if (section === 'inventory') {
                loadInventory();
            }
        });
    });

    // Initialize inventory table
    loadInventory();

    // Initialize report filters
    initializeReportFilters();

    // Add book form submission handler
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

    // Close modal with Escape key
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

    // Show home section by default
    showSection('home');
    loadHomeStats();
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    // Show selected section
    document.getElementById(`${sectionId}Section`).classList.remove('hidden');
    // Update section title
    document.getElementById('sectionTitle').textContent = 
        sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

async function loadInventory() {
    try {
        const books = await ipcRenderer.invoke('get-inventory');
        const tbody = document.getElementById('booksList');
        tbody.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap">${book.author}</td>
                <td class="px-6 py-4 whitespace-nowrap">${book.stock}</td>
                <td class="px-6 py-4 whitespace-nowrap">LKR ${book.price.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
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

function initializeReportFilters() {
    document.getElementById('reportFilterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const report = await ipcRenderer.invoke('generate-report', {
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate')
            });
            displayReport(report);
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report. Please try again.');
        }
    });
}

function displayReport(data) {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${row.date}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.title}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap">LKR ${row.total.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Home section functions
async function loadHomeStats() {
    try {
        const stats = await ipcRenderer.invoke('get-dashboard-stats');
        document.getElementById('totalBooks').textContent = stats.totalBooks;
        document.getElementById('lowStockCount').textContent = stats.lowStockCount;
        document.getElementById('todaySales').textContent = `LKR ${stats.todaySales.toLocaleString()}`;
        
        // Load recent activities
        const activities = await ipcRenderer.invoke('get-recent-activities');
        const activitiesContainer = document.getElementById('recentActivities');
        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between py-2">
                <div>
                    <p class="text-sm font-medium">${activity.action}</p>
                    <p class="text-xs text-gray-500">${activity.timestamp}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Settings section functions
async function backupDatabase() {
    try {
        const result = await ipcRenderer.invoke('backup-database');
        if (result.success) {
            alert('Database backup created successfully!');
        } else {
            alert('Failed to create backup: ' + result.error);
        }
    } catch (error) {
        console.error('Backup failed:', error);
        alert('Failed to create backup. Please try again.');
    }
}

async function restoreDatabase() {
    const fileInput = document.getElementById('restoreFile');
    if (!fileInput.files.length) {
        alert('Please select a backup file first.');
        return;
    }

    const confirmation = confirm('Warning: This will replace your current database. Are you sure you want to proceed?');
    if (!confirmation) return;

    try {
        const result = await ipcRenderer.invoke('restore-database', fileInput.files[0].path);
        if (result.success) {
            alert('Database restored successfully! The application will now restart.');
            await ipcRenderer.invoke('restart-app');
        } else {
            alert('Failed to restore database: ' + result.error);
        }
    } catch (error) {
        console.error('Restore failed:', error);
        alert('Failed to restore database. Please try again.');
    }
} 