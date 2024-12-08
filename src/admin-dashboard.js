const { ipcRenderer } = require('electron');
const Chart = require('chart.js');

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const sectionTitle = document.getElementById('sectionTitle');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            sections.forEach(section => section.classList.add('hidden'));
            document.getElementById(`${sectionId}Section`).classList.remove('hidden');
            sectionTitle.textContent = link.textContent;
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

    // Show home section by default
    showSection('home');
    loadDashboardData();

    // Add event listener for report filter form
    document.getElementById('reportFilterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const reportData = await fetchReportData({
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            filterType: formData.get('filterType'),
            filterValue: formData.get('filterValue')
        });
        populateReportTable(reportData);
    });

    // Add event listener for download PDF button
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadReportAsPdf);
});

async function loadDashboardData() {
    try {
        // Load summary data
        const summaryData = await ipcRenderer.invoke('get-dashboard-summary');
        updateSummaryCards(summaryData);

        // Load sales chart data
        const salesData = await ipcRenderer.invoke('get-sales-data');
        initializeSalesChart(salesData);

        // Load top books data
        const topBooksData = await ipcRenderer.invoke('get-top-books');
        initializeTopBooksChart(topBooksData);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateSummaryCards(data) {
    document.getElementById('todaySales').textContent = `LKR ${data.todaySales.toLocaleString()}`;
    document.getElementById('totalBooks').textContent = data.totalBooks.toLocaleString();
    document.getElementById('lowStockCount').textContent = data.lowStockCount.toLocaleString();
}

function initializeSalesChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sales',
                data: data.values,
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeTopBooksChart(data) {
    const ctx = document.getElementById('topBooksChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Copies Sold',
                data: data.values,
                backgroundColor: 'rgb(59, 130, 246)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}Section`).classList.remove('hidden');
    document.getElementById('sectionTitle').textContent = 
        sectionId === 'home' ? 'Dashboard' : sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

function createBackup() {
    ipcRenderer.invoke('create-backup').then(() => {
        alert('Backup created successfully');
        loadBackupHistory();
    }).catch(err => {
        console.error('Error creating backup:', err);
        alert('Failed to create backup');
    });
}

function restoreBackup() {
    // Implement restore backup functionality
    alert('Restore backup functionality not yet implemented');
}

function showAddUserForm() {
    // Show form to add a new user
}

function showAddBookForm() {
    // Show form to add a new book
}

async function fetchReportData(filters) {
    try {
        return await ipcRenderer.invoke('generate-report', filters);
    } catch (error) {
        console.error('Error fetching report data:', error);
        return [];
    }
}

function populateReportTable(data) {
    const tableBody = document.getElementById('reportTableBody');
    tableBody.innerHTML = ''; // Clear existing data

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${row.date}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.title}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.seller}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.publisher}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.genre}</td>
            <td class="px-6 py-4 whitespace-nowrap">${row.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap">LKR ${row.total.toLocaleString()}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function downloadReportAsPdf() {
    const reportData = document.getElementById('reportTableBody').innerHTML;
    ipcRenderer.invoke('download-report-pdf', reportData).catch(error => {
        console.error('Error downloading PDF:', error);
    });
} 