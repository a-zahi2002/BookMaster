const { ipcRenderer } = require('electron');

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
            showSection(e.currentTarget.dataset.section);
        });
    });

    // Initialize inventory table
    loadInventory();

    // Initialize report filters
    initializeReportFilters();
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