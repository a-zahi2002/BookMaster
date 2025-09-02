// Sales Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeSalesDashboard();
    
    // Set up navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize cart
    initializeCart();
});

let cart = [];
let availableBooks = [];

function initializeSalesDashboard() {
    // Set current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Set sales user name (you can get this from authentication)
    document.getElementById('salesName').textContent = 'Sales User';
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
    }
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
    
    // Load available books
    loadAvailableBooks();
}

function loadSummaryData() {
    // This would typically fetch data from your backend
    // For now, we'll use placeholder data
    const todaySalesElement = document.getElementById('todaySales');
    const totalBooksElement = document.getElementById('totalBooks');
    const lowStockCountElement = document.getElementById('lowStockCount');
    
    if (todaySalesElement) todaySalesElement.textContent = 'LKR 8,450';
    if (totalBooksElement) totalBooksElement.textContent = '1,234';
    if (lowStockCountElement) lowStockCountElement.textContent = '12';
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

function loadAvailableBooks() {
    // This would typically fetch data from your backend
    availableBooks = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', stock: 15, price: 1200 },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', stock: 8, price: 950 },
        { id: 3, title: '1984', author: 'George Orwell', stock: 22, price: 1100 },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', stock: 5, price: 850 },
        { id: 5, title: 'The Hobbit', author: 'J.R.R. Tolkien', stock: 18, price: 1300 },
        { id: 6, title: 'Lord of the Flies', author: 'William Golding', stock: 12, price: 900 }
    ];
    
    updateAvailableBooksTable();
    updateViewBooksTable();
}

function updateAvailableBooksTable() {
    const booksList = document.getElementById('availableBooksList');
    if (booksList) {
        booksList.innerHTML = availableBooks.map(book => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR ${book.price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${book.stock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="addToCart(${book.id})" class="text-blue-600 hover:text-blue-900">Add to Cart</button>
                </td>
            </tr>
        `).join('');
    }
}

function updateViewBooksTable() {
    const booksList = document.getElementById('viewBooksList');
    if (booksList) {
        booksList.innerHTML = availableBooks.map(book => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.author}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR ${book.price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${book.stock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewBookDetails(${book.id})" class="text-blue-600 hover:text-blue-900">View Details</button>
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
    
    // Report filter form
    const reportFilterForm = document.getElementById('reportFilterForm');
    if (reportFilterForm) {
        reportFilterForm.addEventListener('submit', handleGenerateReport);
    }
}

// Cart functions
function initializeCart() {
    cart = [];
    updateCartDisplay();
}

function addToCart(bookId) {
    const book = availableBooks.find(b => b.id === bookId);
    if (!book) return;
    
    if (book.stock <= 0) {
        alert('This book is out of stock!');
        return;
    }
    
    const existingItem = cart.find(item => item.id === bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: book.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.id !== bookId);
    updateCartDisplay();
}

function updateCartQuantity(bookId, newQuantity) {
    const item = cart.find(item => item.id === bookId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(bookId);
        } else {
            item.quantity = newQuantity;
        }
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartItemCountElement = document.getElementById('cartItemCount');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                    <h5 class="font-medium text-gray-900">${item.title}</h5>
                    <p class="text-sm text-gray-500">LKR ${item.price} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" class="text-red-600 hover:text-red-800">-</button>
                    <span class="text-sm font-medium">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" class="text-green-600 hover:text-green-800">+</button>
                    <button onclick="removeFromCart(${item.id})" class="text-red-600 hover:text-red-800 ml-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartItemCountElement) cartItemCountElement.textContent = totalItems;
    if (cartTotalElement) cartTotalElement.textContent = `LKR ${totalAmount.toFixed(2)}`;
}

// Quick action functions
function startNewSale() {
    // Navigate to POS section
    const posLink = document.querySelector('a[data-section="pos"]');
    if (posLink) {
        posLink.click();
    }
}

function viewBooks() {
    // Navigate to books section
    const booksLink = document.querySelector('a[data-section="books"]');
    if (booksLink) {
        booksLink.click();
    }
}

function generateSalesReport() {
    // Navigate to reports section
    const reportsLink = document.querySelector('a[data-section="reports"]');
    if (reportsLink) {
        reportsLink.click();
    }
}

// POS functions
function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        updateCartDisplay();
    }
}

function processPayment() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    // Here you would typically process the payment
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Show payment options
    const paymentMethod = prompt(`Total: LKR ${totalAmount.toFixed(2)}\n\nSelect payment method:\n1. Cash\n2. Card\n3. Mobile Payment`);
    
    if (paymentMethod) {
        // Process payment based on method
        console.log('Processing payment:', paymentMethod);
        
        // Clear cart after successful payment
        cart = [];
        updateCartDisplay();
        
        alert('Payment processed successfully!');
    }
}

// Book functions
function viewBookDetails(bookId) {
    const book = availableBooks.find(b => b.id === bookId);
    if (book) {
        alert(`Book Details:\n\nTitle: ${book.title}\nAuthor: ${book.author}\nPrice: LKR ${book.price}\nStock: ${book.stock}`);
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
    const filteredBooks = availableBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );
    
    const booksList = document.getElementById('viewBooksList');
    if (booksList) {
        booksList.innerHTML = filteredBooks.map(book => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${book.author}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR ${book.price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${book.stock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewBookDetails(${book.id})" class="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
            </tr>
        `).join('');
    }
}

// Report functions
function handleGenerateReport(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportData = {
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        filterType: formData.get('filterType')
    };
    
    // Here you would typically generate the report
    console.log('Generating sales report:', reportData);
    
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
