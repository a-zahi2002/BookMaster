// Manager Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeManagerDashboard();
    
    // Set up navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
});

function initializeManagerDashboard() {
    // Set current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Set manager name (you can get this from authentication)
    document.getElementById('managerName').textContent = 'Manager User';
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('currentTime').textContent = timeString;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('bg-gray-100'));
            
            // Add active class to clicked link
            this.classList.add('bg-gray-100');
            
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            
            // Show target section
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection + 'Section');
            if (targetElement) {
                targetElement.classList.remove('hidden');
                
                // Update section title
                const sectionTitle = document.getElementById('sectionTitle');
                if (sectionTitle) {
                    sectionTitle.textContent = this.querySelector('span').textContent;
                }
            }
        });
    });
}

function loadDashboardData() {
    // Load summary data
    loadSummaryData();
    
    // Load charts
    loadCharts();
    
    // Load inventory data
    loadInventoryData();
}

function loadSummaryData() {
    // This would typically fetch data from your backend
    // For now, we'll use placeholder data
    document.getElementById('todaySales').textContent = 'LKR 15,750';
    document.getElementById('totalBooks').textContent = '1,234';
    document.getElementById('lowStockCount').textContent = '12';
}

function loadCharts() {
    // Sales Overview Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Top Books Chart
    const topBooksCtx = document.getElementById('topBooksChart');
    if (topBooksCtx) {
        new Chart(topBooksCtx, {
            type: 'doughnut',
            data: {
                labels: ['Book A', 'Book B', 'Book C', 'Book D', 'Book E'],
                datasets: [{
                    data: [12, 19, 3, 5, 2],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
}

function loadInventoryData() {
    // This would typically fetch data from your backend
    const sampleBooks = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', stock: 15, price: 1200 },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', stock: 8, price: 950 },
        { id: 3, title: '1984', author: 'George Orwell', stock: 22, price: 1100 },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', stock: 5, price: 850 }
    ];
    
    const booksList = document.getElementById('booksList');
    if (booksList) {
        booksList.innerHTML = sampleBooks.map(book => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.author}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${book.stock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR ${book.price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editBook(${book.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onclick="deleteBook(${book.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Add logout logic here
            window.location.href = 'login.html';
        });
    }
    
    // Add book form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBook);
    }
    
    // Report filter form
    const reportFilterForm = document.getElementById('reportFilterForm');
    if (reportFilterForm) {
        reportFilterForm.addEventListener('submit', handleGenerateReport);
    }
    
    // Settings save button
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }
}

// Modal functions
function showAddBookModal() {
    const modal = document.getElementById('addBookModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAddBookModal() {
    const modal = document.getElementById('addBookModal');
    if (modal) {
        modal.classList.add('hidden');
        // Reset form
        const form = document.getElementById('addBookForm');
        if (form) {
            form.reset();
        }
    }
}

function handleAddBook(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        isbn: formData.get('isbn'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        publisher: formData.get('publisher')
    };
    
    // Here you would typically send this data to your backend
    console.log('Adding book:', bookData);
    
    // Close modal and reload data
    closeAddBookModal();
    loadInventoryData();
}

function handleGenerateReport(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportData = {
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        filterType: formData.get('filterType')
    };
    
    // Here you would typically generate the report
    console.log('Generating report:', reportData);
    
    // Load sample report data
    loadReportData();
}

function loadReportData() {
    const sampleReportData = [
        { date: '2024-01-15', title: 'The Great Gatsby', quantity: 2, total: 2400 },
        { date: '2024-01-15', title: 'To Kill a Mockingbird', quantity: 1, total: 950 },
        { date: '2024-01-14', title: '1984', quantity: 3, total: 3300 }
    ];
    
    const reportTableBody = document.getElementById('reportTableBody');
    if (reportTableBody) {
        reportTableBody.innerHTML = sampleReportData.map(item => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR ${item.total}</td>
            </tr>
        `).join('');
    }
}

function handleSaveSettings() {
    // Here you would typically save settings to your backend
    console.log('Saving settings...');
    
    // Show success message
    alert('Settings saved successfully!');
}

// Quick action functions
function generateReport() {
    // Navigate to reports section
    const reportsLink = document.querySelector('a[data-section="reports"]');
    if (reportsLink) {
        reportsLink.click();
    }
}

function backupDatabase() {
    // Here you would typically trigger a database backup
    console.log('Backing up database...');
    alert('Database backup initiated!');
}

// Book management functions
function editBook(bookId) {
    console.log('Editing book:', bookId);
    // Implement edit functionality
}

function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        console.log('Deleting book:', bookId);
        // Implement delete functionality
        loadInventoryData(); // Reload data
    }
}
