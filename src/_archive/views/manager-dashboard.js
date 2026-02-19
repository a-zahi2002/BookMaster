// Manager Dashboard JavaScript
let currentUser = null;
let books = [];
let cart = [];
let salesData = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadUserData();
    loadBooks();
    setupEventListeners();
    updateTime();
    setInterval(updateTime, 1000);
});

function initializeDashboard() {
    // Set default section
    showSection('home');
    updateSectionTitle('Dashboard');
}

function loadUserData() {
    // Load user data from localStorage or session
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        document.getElementById('managerName').textContent = currentUser.name || 'Manager';
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            updateSectionTitle(this.textContent.trim());
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Add Book Form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBook);
    }

    // Report Filter Form
    const reportFilterForm = document.getElementById('reportFilterForm');
    if (reportFilterForm) {
        reportFilterForm.addEventListener('submit', handleGenerateReport);
    }

    // Settings
    document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
    document.getElementById('backupBtn')?.addEventListener('click', backupDatabase);
    document.getElementById('restoreBtn')?.addEventListener('click', restoreDatabase);
    document.getElementById('exportCSV')?.addEventListener('click', exportDataCSV);
    document.getElementById('exportJSON')?.addEventListener('click', exportDataJSON);
}

function showSection(sectionName) {
    console.log('showSection called with:', sectionName);
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        console.log('Section shown:', sectionName + 'Section');
    } else {
        console.error('Section not found:', sectionName + 'Section');
    }

    // Update navigation active state
    document.querySelectorAll('[data-section]').forEach(link => {
        link.classList.remove('bg-blue-50', 'text-blue-700');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('bg-blue-50', 'text-blue-700');
        }
    });

    // Load section-specific data
    switch (sectionName) {
        case 'home':
            loadDashboardData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

function updateSectionTitle(title) {
    document.getElementById('sectionTitle').textContent = title;
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('currentTime').textContent = timeString;
}

// Dashboard Functions
function loadDashboardData() {
    // Load summary data
    loadSummaryCards();
    loadCharts();
}

function loadSummaryCards() {
    // Calculate summary data
    const todaySales = calculateTodaySales();
    const totalBooks = books.length;
    const lowStockCount = books.filter(book => book.stock_quantity < 10).length;

    // Update summary cards
    document.getElementById('todaySales').textContent = `LKR ${todaySales.toLocaleString()}`;
    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('lowStockCount').textContent = lowStockCount;
}

function loadCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sales',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
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
                labels: books.slice(0, 5).map(book => book.title),
                datasets: [{
                    data: books.slice(0, 5).map(book => book.stock_quantity),
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

// Inventory Functions
function loadInventoryData() {
    console.log('loadInventoryData called');
    displayBooks();
}

function displayBooks() {
    console.log('displayBooks called');
    const booksList = document.getElementById('booksList');
    if (!booksList) {
        console.error('booksList element not found');
        return;
    }

    console.log('Books to display:', books);
    booksList.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${book.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.author}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${book.stock_quantity}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR ${book.price.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editBook(${book.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button onclick="deleteBook(${book.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        booksList.appendChild(row);
    });
    console.log('Books displayed successfully');
}

function showAddBookModal() {
    console.log('showAddBookModal called');
    const modal = document.getElementById('addBookModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal shown');
    } else {
        console.error('Modal element not found');
    }
}

function closeAddBookModal() {
    console.log('closeAddBookModal called');
    const modal = document.getElementById('addBookModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('addBookForm').reset();
        console.log('Modal closed');
    } else {
        console.error('Modal element not found');
    }
}

function handleAddBook(e) {
    console.log('handleAddBook called');
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        isbn: formData.get('isbn'),
        price: parseFloat(formData.get('price')),
        stock_quantity: parseInt(formData.get('stock')),
        publisher: formData.get('publisher')
    };

    console.log('Book data:', bookData);

    // Add book to database (simulate)
    bookData.id = Date.now();
    books.push(bookData);
    
    console.log('Book added, total books:', books.length);
    
    // Update display
    displayBooks();
    loadSummaryCards();
    
    // Close modal based on action
    const action = e.submitter.getAttribute('data-action');
    console.log('Form action:', action);
    if (action === 'save-close') {
        closeAddBookModal();
    } else if (action === 'save-next') {
        e.target.reset();
        // Keep modal open for next entry
    }
}

function editBook(bookId) {
    console.log('editBook called with ID:', bookId);
    const book = books.find(b => b.id === bookId);
    if (book) {
        console.log('Found book:', book);
        // Populate form with book data
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('price').value = book.price;
        document.getElementById('stock').value = book.stock_quantity;
        document.getElementById('publisher').value = book.publisher;
        
        showAddBookModal();
    } else {
        console.log('Book not found with ID:', bookId);
    }
}

function deleteBook(bookId) {
    console.log('deleteBook called with ID:', bookId);
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(b => b.id !== bookId);
        displayBooks();
        loadSummaryCards();
        console.log('Book deleted successfully');
    }
}

// Reports Functions
function loadReportsData() {
    // Initialize reports section
}

function handleGenerateReport(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const filterType = formData.get('filterType');
    
    // Generate report data (simulate)
    generateReportData(startDate, endDate, filterType);
}

function generateReportData(startDate, endDate, filterType) {
    // Simulate report data
    const reportData = [
        { date: '2024-01-15', title: 'Sample Book 1', quantity: 5, total: 2500 },
        { date: '2024-01-16', title: 'Sample Book 2', quantity: 3, total: 1800 },
        { date: '2024-01-17', title: 'Sample Book 3', quantity: 7, total: 3500 }
    ];
    
    displayReportData(reportData);
}

function displayReportData(data) {
    const reportTableBody = document.getElementById('reportTableBody');
    if (!reportTableBody) return;

    reportTableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR ${item.total.toLocaleString()}</td>
        `;
        reportTableBody.appendChild(row);
    });
}

// Settings Functions
function loadSettingsData() {
    // Load current settings
}

function saveSettings() {
    // Save settings to database
    alert('Settings saved successfully!');
}

function backupDatabase() {
    // Create database backup
    alert('Database backup created successfully!');
}

function restoreDatabase() {
    const fileInput = document.getElementById('restoreFile');
    if (fileInput.files.length > 0) {
        alert('Database restored successfully!');
    } else {
        alert('Please select a backup file first.');
    }
}

function exportDataCSV() {
    // Export data as CSV
    alert('Data exported as CSV successfully!');
}

function exportDataJSON() {
    // Export data as JSON
    alert('Data exported as JSON successfully!');
}

// Utility Functions
function calculateTodaySales() {
    // Calculate today's sales (simulate)
    return Math.floor(Math.random() * 50000) + 10000;
}

function loadBooks() {
    // Load books from database (simulate)
    books = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', price: 1500, stock_quantity: 25, publisher: 'Scribner' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0446310789', price: 1200, stock_quantity: 30, publisher: 'Grand Central' },
        { id: 3, title: '1984', author: 'George Orwell', isbn: '978-0451524935', price: 1000, stock_quantity: 8, publisher: 'Signet' },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', price: 800, stock_quantity: 15, publisher: 'Penguin' },
        { id: 5, title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0547928241', price: 2000, stock_quantity: 12, publisher: 'Houghton Mifflin' }
    ];
}

function logout() {
    // Clear user session
    localStorage.removeItem('currentUser');
    // Redirect to login page
    window.location.href = 'login.html';
}

// Quick Actions
function generateReport() {
    showSection('reports');
    updateSectionTitle('Reports & Analytics');
}

function backupDatabase() {
    alert('Database backup created successfully!');
} 